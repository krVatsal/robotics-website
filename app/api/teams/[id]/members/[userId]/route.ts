import { NextRequest, NextResponse } from 'next/server'
import { getTeamMembersRaw, kickMember } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
} from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string; userId: string }> }

/**
 * DELETE /api/teams/[id]/members/[userId]
 * Team leader removes a member from the team.
 * Leader cannot kick themselves. Not allowed after finalization.
 */
export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const callerId = await requireUser()
    const { id: teamId, userId: targetUserId } = await params
    ObjectIdSchema.parse(teamId)
    ObjectIdSchema.parse(targetUserId)

    // Snapshot for cache bust — take BEFORE mutation.
    const memberIdsBefore = await getTeamMembersRaw(teamId)

    const result = await kickMember(teamId, callerId, targetUserId)

    switch (result) {
      case 'not-found':
        throw new NotFoundError('Team not found')
      case 'finalized':
        throw new ConflictError('Team is finalized — cannot remove members')
      case 'not-leader':
        throw new ForbiddenError('Only the team leader can remove members')
      case 'cant-kick-self':
        throw new ForbiddenError(
          'Leaders cannot remove themselves. Delete the team or transfer leadership.',
        )
      case 'target-not-member':
        throw new NotFoundError('That user is not a member of this team')
      case 'ok':
        break
    }

    // Bust caches for the team + every member before the change (their view
    // of the roster is now stale).
    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIdsBefore.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
