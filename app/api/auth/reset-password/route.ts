import { NextRequest, NextResponse } from 'next/server'
import { consumeResetToken } from '@/lib/models/password-reset'
import { updateUserPassword } from '@/lib/models/user'
import { ResetPasswordSchema } from '@/lib/validation'
import { AuthError, NotFoundError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'
import { clientIp, enforceLimit, resetPasswordLimiter } from '@/lib/rate-limit'

/**
 * POST /api/auth/reset-password
 * Body: { "token": "<raw token from email>", "password": "<new plaintext>" }
 *
 * Atomically consumes the token (so it can't be replayed) and sets the new
 * password. If the token is invalid, expired, or already used, we return a
 * uniform 401 — same message regardless of the reason, no info leaked.
 */
export async function POST(request: NextRequest) {
  try {
    await enforceLimit(resetPasswordLimiter(), clientIp(request))
    const { token, password } = ResetPasswordSchema.parse(await request.json())

    const userId = await consumeResetToken(token)
    if (!userId) {
      throw new AuthError('Reset link is invalid or has expired')
    }

    const ok = await updateUserPassword(userId, password)
    if (!ok) throw new NotFoundError('User not found')

    // Bust the cached user doc — /api/auth/me should reflect any change.
    void cacheDel(cacheKeys.user(userId))

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
