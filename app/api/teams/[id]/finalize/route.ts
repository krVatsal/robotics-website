import { NextRequest, NextResponse } from 'next/server'
import { finalizeTeam } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { ForbiddenError, handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const userId = await requireUser()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)

    // The model function already enforces "must be leader" via the WHERE clause
    // on the update. If it throws Unauthorized, translate to a 403.
    try {
      const updatedTeam = await finalizeTeam(teamId, userId)
      return NextResponse.json({
        message: 'Protocol Finalized: Team Deployment Confirmed',
        team: updatedTeam,
      })
    } catch (e: any) {
      if (typeof e?.message === 'string' && e.message.includes('Unauthorized')) {
        throw new ForbiddenError(
          'Access Denied: Only the Team Leader can finalize registration',
        )
      }
      throw e
    }
  } catch (error) {
    return handleApiError(error)
  }
}
