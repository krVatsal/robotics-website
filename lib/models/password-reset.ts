/**
 * Password reset tokens.
 *
 * Design:
 *   - The RAW token (64 hex chars from crypto.randomBytes) is only shown ONCE —
 *     it's emailed to the user. We never store it.
 *   - We store SHA-256(token) as `tokenHash`. Fast to verify, one-way.
 *   - Each token has an `expiresAt` (default 1 hour) and gets marked `usedAt`
 *     on first successful reset so it can't be replayed.
 *   - The tokenHash is uniquely indexed (see scripts/setup-indexes.ts) so an
 *     accidentally-colliding token (astronomically rare) still fails cleanly.
 *
 */
import { ObjectId } from 'mongodb'
import { createHash, randomBytes } from 'node:crypto'
import { getDB } from '@/lib/db'

export interface PasswordReset {
  _id?: ObjectId
  userId: ObjectId
  tokenHash: string
  expiresAt: Date
  usedAt?: Date
  createdAt: Date
}

/** Default token lifetime — 1 hour. Long enough for email to land + user to click. */
const DEFAULT_TTL_MS = 60 * 60 * 1000

/** Generate a fresh 32-byte random token, returned as 64 hex chars. */
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

/** One-way hash used for storage + lookup. */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

/**
 * Create a reset record for the given user. Returns the RAW token — call this,
 * then include the raw token in the outgoing email (never persist it).
 *
 * Also invalidates any prior unused tokens for this user, so a fresh request
 * clobbers whatever was outstanding.
 */
export async function createResetToken(
  userId: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<string> {
  const db = await getDB()
  const uid = new ObjectId(userId)

  // Invalidate outstanding tokens — one live token per user at a time.
  await db.collection('password_resets').updateMany(
    { userId: uid, usedAt: { $exists: false }, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date(), invalidatedReason: 'superseded' } },
  )

  const rawToken = generateToken()
  const tokenHash = hashToken(rawToken)
  const doc: PasswordReset = {
    userId: uid,
    tokenHash,
    expiresAt: new Date(Date.now() + ttlMs),
    createdAt: new Date(),
  }
  await db.collection('password_resets').insertOne(doc)
  return rawToken
}

/**
 * Consume a token: verify it exists, is unexpired, unused; mark used; return
 * the associated userId. All-or-nothing: on any failure returns null, no state
 * changes.
 */
export async function consumeResetToken(rawToken: string): Promise<string | null> {
  const db = await getDB()
  const tokenHash = hashToken(rawToken)
  const now = new Date()

  // findOneAndUpdate makes the "consume" atomic — two racing requests can't
  // both use the same token.
  const result = await db.collection('password_resets').findOneAndUpdate(
    {
      tokenHash,
      expiresAt: { $gt: now },
      usedAt: { $exists: false },
    },
    { $set: { usedAt: now } },
    { returnDocument: 'after' },
  )

  const doc: any = result?.value ?? result
  if (!doc?.userId) return null
  return doc.userId.toString()
}
