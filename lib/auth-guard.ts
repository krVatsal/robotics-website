import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { env } from './env'
import { AuthError, ForbiddenError } from './errors'

interface UserTokenPayload {
  userId: string
  email?: string
  iat?: number
  exp?: number
}

interface AdminTokenPayload {
  admin: boolean
  iat?: number
  exp?: number
}

/** Returns the authenticated userId, or null if the request is unauthenticated. Never throws. */
export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserTokenPayload
    return decoded.userId ?? null
  } catch {
    return null
  }
}

/** Returns true if the request has a valid admin_token cookie. Never throws. */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload
    return decoded.admin === true
  } catch {
    return false
  }
}

/** Guarantee an authenticated user or throw AuthError (401). */
export async function requireUser(): Promise<string> {
  const userId = await getAuthUserId()
  if (!userId) throw new AuthError()
  return userId
}

/** Guarantee an admin session or throw ForbiddenError (403). */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new ForbiddenError('Admin access required')
}

/**
 * Guarantee the caller is either the target user OR an admin.
 * Used for endpoints like "edit user by id" — a user can edit themselves,
 * an admin can edit anyone, no one else can touch the record.
 */
export async function requireSelfOrAdmin(
  targetUserId: string,
): Promise<{ userId: string | null; isAdmin: boolean }> {
  const userId = await getAuthUserId()
  const admin = await isAdmin()
  if (!userId && !admin) throw new AuthError()
  if (!admin && userId !== targetUserId) throw new ForbiddenError()
  return { userId, isAdmin: admin }
}
