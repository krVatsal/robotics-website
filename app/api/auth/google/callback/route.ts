import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { env } from '@/lib/env'
import { exchangeCodeForProfile } from '@/lib/google-oauth'
import {
  createUserFromGoogle,
  getUserByEmail,
  getUserByGoogleId,
  linkGoogleAccount,
} from '@/lib/models/user'
import { AuthError, ConflictError, handleApiError } from '@/lib/errors'
import { log } from '@/lib/logger'

/**
 * GET /api/auth/google/callback?code=...&state=...
 *
 * Google redirects the user here after they consent. We:
 *   1. Verify the state matches the cookie we set (CSRF guard).
 *   2. Exchange the code for the user's Google profile.
 *   3. Match the profile to an existing user (by googleId, then by email),
 *      or create a new user.
 *   4. Issue our own JWT cookie — from this point on the session is identical
 *      to email/password login.
 *   5. Redirect to the `oauth_next` path (defaults to '/').
 *
 * Errors along the way redirect to /auth/signin?error=... rather than showing
 * a JSON blob — this route is hit by the browser, not by fetch().
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  try {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errParam = searchParams.get('error')

    // The user clicked "Cancel" on Google's screen, or Google returned an error.
    if (errParam) {
      return redirectToSignin(request, `google_${errParam}`)
    }
    if (!code || !state) {
      return redirectToSignin(request, 'missing_code_or_state')
    }

    // Verify state cookie → guards against CSRF and stale/leaked callbacks.
    const store = await cookies()
    const stateCookie = store.get('oauth_state')?.value
    const nextCookie = store.get('oauth_next')?.value ?? '/'
    if (!stateCookie || stateCookie !== state) {
      return redirectToSignin(request, 'invalid_state')
    }
    // One-shot — invalidate immediately.
    store.delete('oauth_state')
    store.delete('oauth_next')

    const profile = await exchangeCodeForProfile(code)

    // Resolution order:
    //   1. Existing googleId  → this is a returning Google user, sign in.
    //   2. Existing email     → email match on a password user; link Google to it.
    //   3. Neither            → brand new user, create from Google profile.
    let user = await getUserByGoogleId(profile.sub)
    if (!user) {
      const emailUser = await getUserByEmail(profile.email)
      if (emailUser) {
        // Link Google to the existing email account.
        const linked = await linkGoogleAccount(
          emailUser._id as ObjectId,
          profile.sub,
        )
        if (!linked) {
          throw new ConflictError(
            'This email is already linked to a different Google account',
          )
        }
        user = { ...emailUser, googleId: profile.sub }
      } else {
        // Fresh signup via Google.
        try {
          user = await createUserFromGoogle({
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            googleId: profile.sub,
            profileImage: profile.picture,
          })
        } catch (e) {
          // Extremely tight race: user created between our getUserByEmail and
          // our insert. Retry the whole resolution by falling through.
          if (e instanceof ConflictError) {
            const raced = await getUserByEmail(profile.email)
            if (raced) {
              const linked = await linkGoogleAccount(
                raced._id as ObjectId,
                profile.sub,
              )
              if (linked) user = { ...raced, googleId: profile.sub }
            }
          }
          if (!user) throw e
        }
      }
    }

    if (!user?._id) throw new AuthError('Could not establish session')

    // Issue our own JWT — same shape as email/password signin. From now on
    // every route sees `auth_token` and treats this identically.
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )
    store.set('auth_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    // Only allow same-origin redirects — reject `//evil.com` shenanigans.
    const safeNext =
      nextCookie.startsWith('/') && !nextCookie.startsWith('//') ? nextCookie : '/'
    return NextResponse.redirect(new URL(safeNext, request.url))
  } catch (error) {
    log.warn('google oauth callback failed', {
      err: error instanceof Error ? error.message : String(error),
    })
    // Fall through to a friendly signin-page redirect. Users don't want a
    // JSON error blob — the frontend can display a message based on ?error=.
    return handleApiErrorOrRedirect(request, error)
  }
}

/** Redirect back to /auth/signin with an error code the frontend can render. */
function redirectToSignin(request: NextRequest, error: string): NextResponse {
  const url = new URL('/auth/signin', request.url)
  url.searchParams.set('error', error)
  return NextResponse.redirect(url)
}

/**
 * For the callback route we prefer a browser-friendly redirect over a raw
 * JSON error for most cases. Truly unexpected errors still get the JSON path
 * so Vercel logs surface them.
 */
function handleApiErrorOrRedirect(
  request: NextRequest,
  error: unknown,
): NextResponse {
  const msg = error instanceof Error ? error.message : String(error)
  const encoded = encodeURIComponent(msg.slice(0, 100)) || 'oauth_failed'
  const url = new URL('/auth/signin', request.url)
  url.searchParams.set('error', encoded)
  return NextResponse.redirect(url)
}
