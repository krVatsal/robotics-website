import { NextRequest, NextResponse } from 'next/server'
import { getTeamById } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

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
