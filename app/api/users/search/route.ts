import { NextRequest, NextResponse } from 'next/server'
import { searchUsersByCodenamePrefix } from '@/lib/models/user'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/users/search?q=<prefix>
 * Returns up to 10 users whose codename starts with the given prefix.
 * Auth required — codenames are meaningful to signed-in users, and requiring
 * auth prevents drive-by enumeration.
 *
 * Response is a lean projection — codename, name, profileImage. Enough to
 * render a "who did you mean?" dropdown; no PII beyond the display name.
 */
export async function GET(request: NextRequest) {
  try {
    await requireUser()

    const q = request.nextUrl.searchParams.get('q') ?? ''
    const results = await searchUsersByCodenamePrefix(q)

    return NextResponse.json(
      results.map((u: any) => ({
        _id: u._id,
        codename: u.codename,
        name: u.name,
        profileImage: u.profileImage,
      })),
    )
  } catch (error) {
    return handleApiError(error)
  }
}
