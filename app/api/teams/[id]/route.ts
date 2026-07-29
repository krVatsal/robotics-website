import { NextRequest, NextResponse } from 'next/server'
import { deleteTeamById, getTeamById } from '@/lib/models/team'
import { isAdmin, requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    // Team info includes member emails — only authenticated users should see it.
    await requireUser()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const team = await getTeamById(id)
    if (!team) throw new NotFoundError('Team not found')
    return NextResponse.json(team)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/teams/[id]
 * Leader can delete their own team (unless it's approved).
 * Admin can delete any team at any status.
 * Cascade: pulls team from all project.teamIds, deletes pending invitations.
 */
export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const admin = await isAdmin()

    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    const { memberIds } = await deleteTeamById(teamId, userId, admin)

    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIds.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Team deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
