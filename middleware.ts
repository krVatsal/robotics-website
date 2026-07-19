/**
 * Next.js middleware — runs at the edge before any page renders.
 *
 * What it does here:
 *   - Redirects unauthenticated users away from protected PAGES (/admin, /profile)
 *   - Redirects already-signed-in users AWAY from /auth/signin & /auth/signup
 *     (no point showing a login form to someone who's already logged in)
 *
 * What it deliberately does NOT do:
 *   - Verify the JWT signature. Middleware runs in the Edge Runtime, which
 *     doesn't have Node's crypto module — jsonwebtoken wouldn't work. Actual
 *     token verification is still done by route handlers via requireUser().
 *     Cookie presence here is a UX hint, not a security boundary.
 *   - Touch /api/* — API routes handle their own auth via requireUser /
 *     requireAdmin, and their responses are correct 401/403 JSON. Redirecting
 *     API calls to /auth/signin would break every fetch() from the client.
 */
import { NextRequest, NextResponse } from 'next/server'

// Pages that require any signed-in user (auth_token cookie present).
const USER_PROTECTED_PATHS = ['/profile', '/dashboard']

// Pages that require an admin session (admin_token cookie present).
const ADMIN_PROTECTED_PATHS = ['/admin']

// Pages that are pointless for signed-in users; bounce them home.
// NOTE: the codename setup page is intentionally NOT here — signed-in users
// without a codename get redirected TO it by the client-side gate in auth-context.
const AUTH_PAGES = ['/auth/signin', '/auth/signup']

function isUnder(path: string, list: string[]): boolean {
  return list.some((p) => path === p || path.startsWith(p + '/'))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authToken = req.cookies.get('auth_token')?.value
  const adminToken = req.cookies.get('admin_token')?.value

  // Admin section — needs admin_token. Special-case /admin/auth so admins
  // can actually reach the login page.
  if (isUnder(pathname, ADMIN_PROTECTED_PATHS)) {
    if (pathname === '/admin/auth' || pathname.startsWith('/admin/auth/')) {
      return NextResponse.next()
    }
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/auth', req.url))
    }
    return NextResponse.next()
  }

  // Signed-in-only pages
  if (isUnder(pathname, USER_PROTECTED_PATHS)) {
    if (!authToken) {
      const url = new URL('/auth/signin', req.url)
      // Preserve the intended destination so we can bounce back after login.
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Auth pages — if already signed in, send them home.
  if (isUnder(pathname, AUTH_PAGES) && authToken) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Match everything EXCEPT api routes, _next internals, and static files.
  // The negative lookahead is Next.js's canonical matcher trick.
  matcher: ['/((?!api/|_next/|_static/|.*\\..*).*)'],
}
