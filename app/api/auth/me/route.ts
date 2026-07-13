import { NextResponse } from 'next/server'
import { getUserById } from '@/lib/models/user'
import { requireUser } from '@/lib/auth-guard'
import { NotFoundError, handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    const userId = await requireUser()
    const user = await getUserById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Whitelist fields returned to the client — never send `password` or other
    // internal fields even if they exist on the doc.
    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      rollNo: user.rollNo,
      department: user.department,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      teamId: user.teamId,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
