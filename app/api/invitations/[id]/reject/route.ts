import { NextRequest, NextResponse } from 'next/server'
import { rejectInvitation } from '@/lib/models/invitation'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/invitations/[id]/reject
 * Invitee declines. No team mutation; just marks the invite rejected.
 */
export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const { id: invitationId } = await params
    ObjectIdSchema.parse(invitationId)

    await rejectInvitation(invitationId, userId)

    return NextResponse.json({ message: 'Invitation rejected' })
  } catch (error) {
    return handleApiError(error)
  }
}
