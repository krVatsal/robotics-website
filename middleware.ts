import { NextRequest, NextResponse } from 'next/server'

const USER_PROTECTED_PATHS = ['/profile', '/dashboard', '/teams', '/participate']

const ADMIN_PROTECTED_PATHS = ['/admin']

const AUTH_PAGES = ['/auth/signin']

function isUnder(path: string, list: string[]): boolean {
  return list.some((p) => path === p || path.startsWith(p + '/'))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authToken = req.cookies.get('auth_token')?.value
  const adminToken = req.cookies.get('admin_token')?.value

  if (isUnder(pathname, ADMIN_PROTECTED_PATHS)) {
    if (pathname === '/admin/auth' || pathname.startsWith('/admin/auth/')) {
      return NextResponse.next()
    }
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/auth', req.url))
    }
    return NextResponse.next()
  }

  if (isUnder(pathname, USER_PROTECTED_PATHS)) {
    if (!authToken) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (isUnder(pathname, AUTH_PAGES) && authToken) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|.*\\..*).*)'],
}
