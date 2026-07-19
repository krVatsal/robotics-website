import { NextRequest, NextResponse } from 'next/server'
import { transferLeadership } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema, TransferLeadershipSchema } from '@/lib/validation'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
} from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/teams/[id]/transfer-leadership
 * Body: { "newLeaderId": "..." }
 * Current leader hands off to a member. Not allowed on approved teams.
 */
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const currentLeaderId = await requireUser()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)
    const { newLeaderId } = TransferLeadershipSchema.parse(await request.json())

    const result = await transferLeadership(teamId, currentLeaderId, newLeaderId)

    if (typeof result === 'string') {
      switch (result) {
        case 'not-found':
          throw new NotFoundError('Team not found')
        case 'not-leader':
          throw new ForbiddenError('Only the current leader can transfer leadership')
        case 'locked':
          throw new ConflictError('Approved teams cannot change leadership')
        case 'new-leader-not-member':
          throw new ConflictError(
            'The new leader must already be a member of the team',
          )
        case 'same-user':
          throw new ConflictError('New leader is the same as the current leader')
      }
    }

    // Bust caches for team + every member — leader label affects each member's view.
    void cacheDel(
      cacheKeys.team(teamId),
      ...result.memberIds.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Leadership transferred' })
  } catch (error) {
    return handleApiError(error)
  }
}
