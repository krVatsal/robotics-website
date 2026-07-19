import { NextRequest, NextResponse } from 'next/server'
import { getTeamById, submitTeamForApproval } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { ForbiddenError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * Route kept at /api/teams/[id]/finalize for backward compat with any frontend
 * that already calls it. Semantics under the hood are now "submit for admin
 * approval" — the leader no longer terminally locks the team; the admin does.
 */
export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    let updatedTeam
    try {
      updatedTeam = await submitTeamForApproval(teamId, userId)
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.includes('Unauthorized')) {
        throw new ForbiddenError(
          'Access Denied: Only the Team Leader can submit for approval',
        )
      }
      throw e
    }

    // Bust caches for the team + every member — approval status changed.
    void (async () => {
      const populated = await getTeamById(teamId).catch(() => null)
      const memberIds: string[] = Array.isArray(populated?.members)
        ? populated.members.map(
            (m: any) => m?._id?.toString?.() ?? String(m?._id ?? ''),
          )
        : []
      await cacheDel(
        cacheKeys.team(teamId),
        ...memberIds.filter(Boolean).map((id) => cacheKeys.userTeams(id)),
      )
    })()

    return NextResponse.json({
      message: 'Team submitted for admin approval',
      team: updatedTeam,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
