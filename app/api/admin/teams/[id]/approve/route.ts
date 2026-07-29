import { NextRequest, NextResponse } from 'next/server'
import { approveTeam, getTeamMembersRaw } from '@/lib/models/team'
import { requireAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/teams/[id]/approve
 * Admin approves a submitted team. Terminal state — no further edits.
 */
export async function POST(_request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    const memberIds = await getTeamMembersRaw(teamId)
    const team = await approveTeam(teamId)
    if (!team) throw new NotFoundError('Team not found')

    // Bust caches — approval affects every member's view of the team.
    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIds.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Team approved', team })
  } catch (error) {
    return handleApiError(error)
  }
}
