/**
 * Minimal email sender.
 *
 * If RESEND_API_KEY is configured we hit Resend's REST API. Otherwise every
 * `sendEmail` call logs the payload to the server console — handy in dev,
 * unsafe in prod. Swap for SendGrid / AWS SES / your favourite provider by
 * editing `sendViaResend` — the public `sendEmail` signature stays the same.
 */
import { env } from './env'
import { log } from './logger'

interface SendEmailArgs {
  to: string
  subject: string
  /** Plain-text body — always required for accessibility + spam-filter friendliness. */
  text: string
  /** Optional HTML body. If omitted, Resend will use `text`. */
  html?: string
}

async function sendViaResend(args: SendEmailArgs): Promise<void> {
  const from = env.EMAIL_FROM ?? 'no-reply@example.com'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    log.warn('email send failed', { status: res.status, body: body.slice(0, 300) })
  }
}

export async function sendEmail(args: SendEmailArgs): Promise<void> {
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    await sendViaResend(args)
    return
  }
  // Console fallback — good enough for dev + safe by default.
  log.info('email (console fallback — no RESEND_API_KEY configured)', {
    to: args.to,
    subject: args.subject,
    text: args.text,
  })
}
