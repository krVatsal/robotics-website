import { NextRequest, NextResponse } from 'next/server'
import { getTeamMembersRaw, leaveTeam } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
} from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/teams/[id]/leave
 * Caller removes themselves from the team.
 * Leaders can't leave — they must delete the team or transfer leadership.
 */
export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    // Snapshot members BEFORE mutation — needed for cache bust of everyone
    // whose "user-teams:*" cache now includes stale membership.
    const memberIdsBefore = await getTeamMembersRaw(teamId)

    const result = await leaveTeam(teamId, userId)

    switch (result) {
      case 'not-found':
        throw new NotFoundError('Team not found')
      case 'finalized':
        throw new ConflictError('Team is finalized — cannot leave')
      case 'leader':
        throw new ForbiddenError(
          'Leaders cannot leave a team. Delete the team or transfer leadership first.',
        )
      case 'not-member':
        throw new ForbiddenError('You are not a member of this team')
      case 'ok':
        break
    }

    // Bust caches: the team doc + user-teams for the leaver + user-teams for
    // every remaining member (their view of the roster changed).
    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIdsBefore.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Left team successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
