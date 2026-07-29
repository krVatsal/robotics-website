import { NextRequest, NextResponse } from 'next/server'
import { setUserCodename } from '@/lib/models/user'
import { requireUser } from '@/lib/auth-guard'
import { SetCodenameSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

/**
 * POST /api/users/me/codename  { codename: "nexus_pilot" }
 * The signed-in user picks a codename. Race-safe via the unique sparse index —
 * two concurrent attempts on the same codename produce one winner and one 409.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser()
    const { codename } = SetCodenameSchema.parse(await request.json())

    const user = await setUserCodename(userId, codename)
    if (!user) throw new NotFoundError('User not found')

    // Bust cached user doc so /api/auth/me reflects the new codename immediately.
    void cacheDel(cacheKeys.user(userId))

    return NextResponse.json({ message: 'Codename set', codename })
  } catch (error) {
    return handleApiError(error)
  }
}
