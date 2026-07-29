import { NextRequest, NextResponse } from 'next/server'
import { assignTeamToProject, getProjectTeams } from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import {
  AssignTeamToProjectSchema,
  ObjectIdSchema,
} from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

/**
 * GET /api/projects/[id]/teams
 * Public — returns teams assigned to this project (member details populated).
 */
export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    ObjectIdSchema.parse(id)
    const teams = await getProjectTeams(id)
    return NextResponse.json(teams)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/projects/[id]/teams
 * Body: { "teamId": "..." }
 * Admin assigns a team to the project. Idempotent — re-assigning is a no-op.
 */
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const { teamId } = AssignTeamToProjectSchema.parse(await request.json())

    await assignTeamToProject(id, teamId)
    return NextResponse.json({ message: 'Team assigned to project' })
  } catch (error) {
    return handleApiError(error)
  }
}
