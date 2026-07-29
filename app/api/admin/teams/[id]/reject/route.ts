import { NextRequest, NextResponse } from 'next/server'
import { getTeamMembersRaw, rejectTeam } from '@/lib/models/team'
import { requireAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema, RejectTeamSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/teams/[id]/reject
 * Optional body: { "reason": "..." }
 * Admin declines. Team returns to editable state so leader can fix + resubmit.
 */
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    // Body is optional — reason is a nice-to-have but not required.
    let reason: string | undefined
    try {
      const text = await request.text()
      if (text) {
        reason = RejectTeamSchema.parse(JSON.parse(text)).reason
      }
    } catch {
      // Empty or non-JSON body — treat as no reason. Validation of a real body
      // still runs above and would throw for actually-malformed JSON.
    }

    const memberIds = await getTeamMembersRaw(teamId)
    const team = await rejectTeam(teamId, reason)
    if (!team) throw new NotFoundError('Team not found')

    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIds.map((id) => cacheKeys.userTeams(id)),
    )

    return NextResponse.json({ message: 'Team rejected', team })
  } catch (error) {
    return handleApiError(error)
  }
}
