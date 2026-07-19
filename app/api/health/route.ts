import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { env } from '@/lib/env'

/**
 * GET /api/health
 *
 * Deploy platforms (Vercel, uptime monitors, Kubernetes liveness probes)
 * use endpoints like this to know if the app is up. Design:
 *
 *   - Cheap. Two round-trips at most (MongoDB ping + Redis ping if configured).
 *     No auth, no rate limiting — probes hit it often.
 *   - Truthful. If Mongo is down, we return 503, NOT 200 with "degraded" in
 *     the body — load balancers only look at the status code.
 *   - Verbose in the body so a human can `curl /api/health | jq` and diagnose.
 *
 * Note: this endpoint is intentionally NOT cached — we want a real answer
 * every time.
 */
export const dynamic = 'force-dynamic'

interface Check {
  ok: boolean
  latencyMs: number | null
  detail?: string
}

async function checkMongo(): Promise<Check> {
  const start = Date.now()
  try {
    const db = await getDB()
    // `ping` is the canonical no-op MongoDB command; verifies auth + connectivity.
    await db.command({ ping: 1 })
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}

async function checkRedis(): Promise<Check | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null // not configured — don't fail health because of it
  }
  const start = Date.now()
  try {
    const { Redis } = await import('@upstash/redis')
    const r = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
    await r.ping()
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function GET() {
  // Fire both checks in parallel — response time = max, not sum.
  const [mongo, redis] = await Promise.all([checkMongo(), checkRedis()])

  const ok = mongo.ok && (redis?.ok ?? true)
  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      mongo,
      redis: redis ?? { ok: true, latencyMs: null, detail: 'not configured' },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  )
}
