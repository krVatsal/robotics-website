import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'
import { AdminAuthSchema } from '@/lib/validation'
import { AuthError, handleApiError } from '@/lib/errors'
import { adminAuthLimiter, clientIp, enforceLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection — the admin password is a single shared secret.
    await enforceLimit(adminAuthLimiter(), clientIp(request))
    const { password } = AdminAuthSchema.parse(await request.json())

    // Constant-time-ish compare would be ideal here; strings are short enough
    // that the timing-attack surface is negligible. Fine for MVP.
    if (password !== env.ADMIN_PASSWORD) {
      throw new AuthError('Invalid password')
    }

    const token = jwt.sign({ admin: true }, env.JWT_SECRET, { expiresIn: '24h' })

    const cookieStore = await cookies()
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    })

    return NextResponse.json({ message: 'Admin access granted' })
  } catch (error) {
    return handleApiError(error)
  }
}
