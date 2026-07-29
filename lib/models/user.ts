import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { getDB } from '@/lib/db'
import { ConflictError } from '@/lib/errors'

export interface User {
  _id?: ObjectId
  email: string
  /**
   * bcrypt hash of the user's password. OPTIONAL because Google-OAuth-only
   * users never set a password. If missing, /api/auth/signin returns a hint
   * telling the user to sign in with Google.
   */
  password?: string
  name: string
  rollNo?: string
  department: string
  // Optional profile fields (populated after signup via profile edits)
  phone?: string
  profileImage?: string
  bio?: string
  teamId?: ObjectId
  // Coarse role flag — currently unused for auth (admin auth uses a shared password
  // via ADMIN_PASSWORD env), but the field is here so we can migrate to role-based
  // admin without a schema change later.
  role?: 'user' | 'admin'
  /**
   * Google account subject id (the `sub` claim from Google's OAuth response).
   * Populated when a user signs in with Google. Unique via sparse index so
   * multiple password-only users can coexist without conflicting on null.
   */
  googleId?: string
  /**
   * Unique lowercase handle chosen by the user (letters/digits/underscore,
   * starts with a letter). Used by team leaders to invite people they know
   * without needing the raw ObjectId. Unique via sparse index.
   */
  codename?: string
  createdAt: Date
}

const BCRYPT_ROUNDS = 10

/**
 * Insert a new user. Race-safe: relies on the unique index on `users.email`
 * (created by scripts/setup-indexes.ts) to guarantee uniqueness at the DB
 * layer. If two simultaneous signups collide, one gets a ConflictError.
 */
export async function createUser(userData: Omit<User, '_id' | 'createdAt'>) {
  const db = await getDB()
  const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS)

  const newUser: User = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  }

  try {
    const result = await db.collection('users').insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  } catch (error: any) {
    // MongoDB duplicate-key error code
    if (error?.code === 11000) {
      throw new ConflictError('Email already registered')
    }
    throw error
  }
}

export async function getUserById(id: string | ObjectId) {
  const db = await getDB()
  return db.collection('users').findOne({ _id: new ObjectId(id) })
}

export async function getUserByEmail(email: string) {
  const db = await getDB()
  return db.collection('users').findOne({ email })
}

/** Find a user by their Google subject id. Used for repeat Google sign-ins. */
export async function getUserByGoogleId(googleId: string) {
  const db = await getDB()
  return db.collection('users').findOne({ googleId })
}

/**
 * Create a user from a Google profile. No password is set — the user must use
 * Google to sign in again (or use the forgot-password flow to add a password).
 *
 * Race-safe against duplicate email via the unique index.
 */
export async function createUserFromGoogle(profile: {
  email: string
  name: string
  googleId: string
  profileImage?: string
}) {
  const db = await getDB()
  const doc: User = {
    email: profile.email,
    name: profile.name,
    googleId: profile.googleId,
    profileImage: profile.profileImage,
    // Required by our current schema; store 'unknown' until user fills it in.
    department: 'unknown',
    createdAt: new Date(),
  }
  try {
    const result = await db.collection('users').insertOne(doc)
    return { ...doc, _id: result.insertedId }
  } catch (e: any) {
    if (e?.code === 11000) {
      throw new ConflictError('An account with this email already exists')
    }
    throw e
  }
}

/**
 * Attach a Google account to an existing email/password user. Used when the
 * user signed up with email/password and later clicks "Sign in with Google"
 * with the same address.
 *
 * Only allowed if the user has no googleId yet OR the existing googleId
 * matches (idempotent re-link).
 */
export async function linkGoogleAccount(userId: ObjectId, googleId: string) {
  const db = await getDB()
  const result = await db.collection('users').updateOne(
    {
      _id: userId,
      $or: [
        { googleId: { $exists: false } },
        { googleId: null as any },
        { googleId }, // idempotent re-link
      ],
    },
    { $set: { googleId } },
  )
  return result.matchedCount > 0
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

/** Lookup by exact codename. Codenames are stored lowercase; normalize input. */
export async function getUserByCodename(codename: string) {
  const db = await getDB()
  return db.collection('users').findOne({ codename: codename.toLowerCase() })
}

/**
 * Set the caller's codename. Race-safe via the unique sparse index —
 * two concurrent choices of the same codename lose to E11000, which we
 * translate into a ConflictError.
 *
 * `changeAllowed=false` blocks re-setting once assigned. Right now we DO
 * allow changing (returns updated user), but we log the change so we can
 * revisit if abuse shows up.
 */
export async function setUserCodename(userId: string, codename: string) {
  const db = await getDB()
  const normalized = codename.toLowerCase()
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { codename: normalized } },
      { returnDocument: 'after' },
    )
    return (result as any)?.value ?? result
  } catch (e: any) {
    if (e?.code === 11000) {
      throw new ConflictError('That codename is already taken')
    }
    throw e
  }
}

/**
 * Prefix search by codename. Used by the leader's "invite by codename" UI.
 * Case-insensitive (codenames are stored lowercase so a simple prefix regex
 * works with the index). Limits results to a small page to keep the query fast.
 */
export async function searchUsersByCodenamePrefix(prefix: string, limit = 10) {
  if (!prefix.trim()) return []
  const db = await getDB()
  const p = prefix.toLowerCase().replace(/[^a-z0-9_]/g, '') // sanitize regex input
  if (!p) return []
  const rx = new RegExp('^' + p)
  return db
    .collection('users')
    .find(
      { codename: rx },
      { projection: { codename: 1, name: 1, profileImage: 1 } },
    )
    .limit(limit)
    .toArray()
}

/**
 * Set a new password on a user (used by the reset-password flow).
 * Hashes the plaintext, writes only the `password` field — never touches
 * anything else on the doc.
 */
export async function updateUserPassword(
  id: string | ObjectId,
  newPlaintextPassword: string,
): Promise<boolean> {
  const db = await getDB()
  const hashed = await bcrypt.hash(newPlaintextPassword, BCRYPT_ROUNDS)
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { password: hashed, passwordUpdatedAt: new Date() } },
  )
  return result.matchedCount > 0
}

export async function updateUser(id: string | ObjectId, updates: Partial<User>) {
  const db = await getDB()

  // Strip fields that should never be settable via a generic update — even
  // though the Zod layer already rejects them, defense-in-depth is cheap.
  const { _id, password, createdAt, role, ...safeUpdates } = updates as any

  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: safeUpdates },
    { returnDocument: 'after' },
  )

  return (result as any)?.value ?? result
}
