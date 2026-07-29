import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import {
  createTeam,
  getTeamByCode,
  getUserTeamForCompetition,
} from '@/lib/models/team'
import { createJoinRequest } from '@/lib/models/join-request'
import { ParticipateSchema } from '@/lib/validation'
import {
  ConflictError,
  NotFoundError,
  handleApiError,
} from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

/**
 * POST /api/participate
 *
 * CREATE → leader creates a team; they become member #1 immediately.
 * JOIN   → user submits a team code. Instead of joining directly (previous
 *          behaviour), we now file a JOIN REQUEST. The team leader sees it
 *          in their inbox and approves or rejects. Response shape signals
 *          this: `{ pending: true, requestId, teamName }`.
 *
 * This puts the leader in control of who's on their team — matches how the
 * invitation flow works in reverse.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser()
    const input = ParticipateSchema.parse(await request.json())

    // Both actions carry an (optional) competitionId — if provided, don't let
    // the user create a duplicate team OR file a request while already on one
    // for the same competition.
    if ('competitionId' in input && input.competitionId) {
      const existing = await getUserTeamForCompetition(userId, input.competitionId)
      if (existing) {
        return NextResponse.json(
          {
            message: 'You are already participating in this competition',
            team: existing,
            alreadyJoined: true,
          },
          { status: 200 },
        )
      }
    }

    if (input.action === 'CREATE') {
      const team = await createTeam({
        name: input.teamName,
        leaderId: userId,
        competitionId: input.competitionId,
      })
      void cacheDel(cacheKeys.userTeams(userId))
      return NextResponse.json(team, { status: 201 })
    }

    // action === 'JOIN' — file a request, don't add to members directly.
    const team = await getTeamByCode(input.teamCode)
    if (!team) throw new NotFoundError('Invalid team code')
    if (team.isFinalized) {
      throw new ConflictError('Team is finalized — cannot request to join')
    }

    // If competitionId was passed, ensure the code matches that competition.
    if (
      input.competitionId &&
      (team as any).competitionId?.toString?.() !== input.competitionId
    ) {
      throw new ConflictError('This code is for a different competition')
    }

    const req = await createJoinRequest({
      teamId: team._id!.toString(),
      userId,
    })

    return NextResponse.json(
      {
        pending: true,
        requestId: req._id,
        teamId: team._id,
        teamName: team.name,
        message:
          'Request sent — the team leader will review and approve or reject it.',
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
