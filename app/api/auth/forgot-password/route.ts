import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/models/user'
import { createResetToken } from '@/lib/models/password-reset'
import { sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { ForgotPasswordSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { log } from '@/lib/logger'
import { clientIp, enforceLimit, forgotPasswordLimiter } from '@/lib/rate-limit'

/**
 * POST /api/auth/forgot-password
 * Body: { "email": "..." }
 *
 * Kicks off a reset flow. Behaviour is DELIBERATELY the same whether the
 * email exists or not — always return 200. This prevents account enumeration
 * (a bad actor probing which emails have accounts on the site).
 *
 * The heavy lifting (token + email) happens even for non-existent users —
 * well, we skip the DB writes, but we still return the same shape. Nothing
 * leaks.
 */
export async function POST(request: NextRequest) {
  try {
    // Tightest limit in the app — every call may send an email. Protect
    // Resend billing + target-user's inbox from a single hostile client.
    await enforceLimit(forgotPasswordLimiter(), clientIp(request))
    const { email } = ForgotPasswordSchema.parse(await request.json())

    // Fire-and-forget the actual work so response timing doesn't reveal
    // whether the email exists (a subtle side-channel).
    void (async () => {
      const user = await getUserByEmail(email)
      if (!user?._id) {
        log.info('forgot-password requested for unknown email', { email })
        return
      }

      const rawToken = await createResetToken(user._id.toString())
      const resetUrl = `${env.APP_URL}/auth/reset-password?token=${rawToken}`

      await sendEmail({
        to: user.email,
        subject: 'Reset your Robotics Club password',
        text:
          `Hi ${user.name ?? 'there'},\n\n` +
          `Someone requested a password reset for your account. If it was you, ` +
          `click the link below within the next hour to set a new password:\n\n` +
          `${resetUrl}\n\n` +
          `If you didn't request this, you can ignore this email — your password ` +
          `won't change.\n\n` +
          `— MNNIT Robotics Club`,
      })
    })().catch((err) => log.error('forgot-password background job', err))

    return NextResponse.json({
      message:
        'If an account exists for that email, a reset link is on its way.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
