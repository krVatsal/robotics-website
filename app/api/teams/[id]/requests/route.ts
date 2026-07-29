import { NextRequest, NextResponse } from 'next/server'
import { getPendingRequestsForTeam } from '@/lib/models/join-request'
import { getTeamById } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { ForbiddenError, NotFoundError, handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

/**
 * GET /api/teams/[id]/requests
 * Pending join requests scoped to one team. Leader-only.
 */
export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const { id } = await params
    ObjectIdSchema.parse(id)

    const team = await getTeamById(id)
    if (!team) throw new NotFoundError('Team not found')
    if (team.leaderId?.toString() !== userId) {
      throw new ForbiddenError('Only the team leader can view requests')
    }

    const requests = await getPendingRequestsForTeam(id)
    return NextResponse.json(requests)
  } catch (error) {
    return handleApiError(error)
  }
}
