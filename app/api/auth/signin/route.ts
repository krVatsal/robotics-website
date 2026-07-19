import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getUserByEmail, verifyPassword } from '@/lib/models/user'
import { env } from '@/lib/env'
import { SigninSchema } from '@/lib/validation'
import { AuthError, handleApiError } from '@/lib/errors'
import { clientIp, enforceLimit, signinLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    await enforceLimit(signinLimiter(), clientIp(request))
    const { email, password } = SigninSchema.parse(await request.json())

    const user = await getUserByEmail(email)
    // NOTE: return the SAME error for "no user" and "bad password" to prevent
    // account enumeration. If we distinguished, attackers could probe which
    // emails are registered.
    if (!user) {
      throw new AuthError('Invalid email or password')
    }
    // Google-only users have no password stored. Nudge them toward Google
    // sign-in instead of the generic "invalid credentials" wall.
    if (!user.password) {
      throw new AuthError(
        'This account uses Google Sign-In. Use "Continue with Google" to sign in.',
      )
    }
    if (!(await verifyPassword(password, user.password))) {
      throw new AuthError('Invalid email or password')
    }

    const token = jwt.sign(
      { userId: user._id?.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({
      message: 'Signed in successfully',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
