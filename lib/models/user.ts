import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { getDB } from '@/lib/db'
import { ConflictError } from '@/lib/errors'

export interface User {
  _id?: ObjectId
  email: string
  password: string
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

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
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
