import { NextRequest, NextResponse } from 'next/server'
import { unassignTeamFromProject } from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string; teamId: string }> }

/**
 * DELETE /api/projects/[id]/teams/[teamId]
 * Admin unassigns a team from the project. Idempotent.
 */
export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id, teamId } = await params
    ObjectIdSchema.parse(id)
    ObjectIdSchema.parse(teamId)
    await unassignTeamFromProject(id, teamId)
    return NextResponse.json({ message: 'Team removed from project' })
  } catch (error) {
    return handleApiError(error)
  }
}
