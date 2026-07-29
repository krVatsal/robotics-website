// Redis upstash Layer
import { Redis } from '@upstash/redis'
import { env } from './env'
import { log } from './logger'

declare global {
  
  var __upstashRedis: Redis | undefined
}


function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null

  if (!globalThis.__upstashRedis) {
    globalThis.__upstashRedis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return globalThis.__upstashRedis
}

/** Fetch a typed value from cache. Returns null on miss, error, or missing config. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  try {
    // Upstash's SDK auto-deserializes JSON, so the return type is already `T | null`.
    const val = await r.get<T>(key)
    return (val as T) ?? null
  } catch (err) {
    log.warn('cache get failed', { key, err: String(err) })
    return null
  }
}

/** Store a value with a TTL (seconds). No-op on error or missing config. */
export async function cacheSet<T>(key: string, value: T, ttlSec: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    await r.set(key, value as any, { ex: ttlSec })
  } catch (err) {
    log.warn('cache set failed', { key, err: String(err) })
  }
}

/** Delete one or more keys. Used for invalidation on writes. */
export async function cacheDel(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  const r = getRedis()
  if (!r) return
  try {
    await r.del(...keys)
  } catch (err) {
    log.warn('cache del failed', { keys, err: String(err) })
  }
}

/**
 * Read-through cache wrapper.
 *
 *   const user = await withCache(
 *     `user:${userId}`,
 *     60,                       // TTL in seconds
 *     () => getUserById(userId), // loader — only called on miss
 *   )
 *
 * On miss OR on Redis failure, the loader is called and the result is cached
 * best-effort. The caller sees the same value either way — cache is transparent.
 */
export async function withCache<T>(
  key: string,
  ttlSec: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key)
  if (hit !== null) return hit

  const fresh = await loader()
  // Fire-and-forget the set. Don't block the response on cache write.
  void cacheSet(key, fresh, ttlSec)
  return fresh
}

// ────────────────────────────────────────────────────────────
// Domain key builders — one place to change if we ever rename
// ────────────────────────────────────────────────────────────
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userTeams: (userId: string) => `user-teams:${userId}`,
  team: (teamId: string) => `team:${teamId}`,
} as const
