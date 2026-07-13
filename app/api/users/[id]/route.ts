import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/models/user'
import { requireSelfOrAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema, UpdateUserSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

// Next.js 15/16: params is a Promise. The old signature (`{ id: string }`)
// would blow up at runtime — this file had the bug and is fixed here.
type Props = { params: Promise<{ id: string }> }

/** Returns a whitelist of public-ish fields. Never includes password. */
function publicUser(user: any) {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    rollNo: user.rollNo,
    department: user.department,
    phone: user.phone,
    profileImage: user.profileImage,
    bio: user.bio,
    teamId: user.teamId,
  }
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    ObjectIdSchema.parse(id)
    // Reading a user profile is currently self-or-admin. Loosen later if we
    // want public profile pages, but at that point return an even narrower set.
    await requireSelfOrAdmin(id)

    const user = await getUserById(id)
    if (!user) throw new NotFoundError('User not found')
    return NextResponse.json(publicUser(user))
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    ObjectIdSchema.parse(id)
    await requireSelfOrAdmin(id)

    // .strict() on UpdateUserSchema means extra fields (like `role: 'admin'`)
    // are rejected outright — no privilege escalation via profile edit.
    const updates = UpdateUserSchema.parse(await request.json())
    const user = await updateUser(id, updates)
    if (!user) throw new NotFoundError('User not found')
    return NextResponse.json(publicUser(user))
  } catch (error) {
    return handleApiError(error)
  }
}
