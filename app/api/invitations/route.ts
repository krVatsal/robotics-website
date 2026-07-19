import { NextResponse } from 'next/server'
import { getPendingInvitationsForUser } from '@/lib/models/invitation'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/invitations
 * Returns pending invitations for the signed-in user, with team + inviter
 * details already populated by the aggregation pipeline.
 */
export async function GET() {
  try {
    const userId = await requireUser()
    const invitations = await getPendingInvitationsForUser(userId)
    return NextResponse.json(invitations)
  } catch (error) {
    return handleApiError(error)
  }
}
