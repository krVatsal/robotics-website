import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth-guard'
import {
  createTeam,
  getUserTeamForCompetition,
  joinTeamByCode,
} from '@/lib/models/team'
import { ParticipateSchema } from '@/lib/validation'
import { ForbiddenError, NotFoundError, handleApiError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser()
    const input = ParticipateSchema.parse(await request.json())

    // Both actions carry an (optional) competitionId — if provided, check that
    // the user isn't already on a team for it. This short-circuits both create
    // and join with a friendly "already joined" response.
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
      return NextResponse.json(team, { status: 201 })
    }

    // action === 'JOIN'
    // teamCode is already uppercased by Zod
    const result: any = await joinTeamByCode(userId, input.teamCode)
    const team = result?.value ?? result

    if (!team) throw new NotFoundError('Invalid code or team is finalized')

    // Safety check: if the request specifies a competition, the joined team
    // must belong to it. Prevents cross-competition code reuse.
    if (
      input.competitionId &&
      team.competitionId?.toString() !== input.competitionId
    ) {
      throw new ForbiddenError('This code is for a different competition')
    }

    return NextResponse.json(team)
  } catch (error) {
    return handleApiError(error)
  }
}
