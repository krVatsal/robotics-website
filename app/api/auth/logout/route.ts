import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleApiError } from '@/lib/errors'

export async function POST() {
  try {
    const cookieStore = await cookies()
    // Belt-and-braces: delete AND overwrite with an expired cookie. Some proxies
    // don't forward Set-Cookie deletions cleanly; the maxAge:0 overwrite is the
    // guaranteed way to invalidate on the browser.
    cookieStore.delete('auth_token')
    cookieStore.set('auth_token', '', { maxAge: 0, path: '/' })
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
