import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import { CompleteProfileSchema } from '@/lib/validation'
import { updateUser, setUserCodename } from '@/lib/models/user'
import { handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const userId = await requireUser()
    const body = await request.json()
    const data = CompleteProfileSchema.parse(body)

    const updates: Record<string, any> = {
      phone: data.phone,
      department: data.branch,
      isMnnit: data.isMnnit,
      isProfileComplete: true,
    }

    if (data.isMnnit) {
      updates.rollNo = data.rollNo
      updates.college = 'MNNIT Allahabad'
    } else {
      updates.college = data.college
    }

    await updateUser(userId, updates)

    if (data.codename) {
      try {
        await setUserCodename(userId, data.codename)
      } catch {
        // codename taken — not a blocker for profile completion
      }
    }

    void cacheDel(cacheKeys.user(userId))

    return NextResponse.json({ message: 'Profile completed' })
  } catch (error) {
    return handleApiError(error)
  }
}
