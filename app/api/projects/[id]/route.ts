import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  deleteProject,
  getProjectById,
  togglePublished,
  updateProject,
} from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import {
  ObjectIdSchema,
  ProjectPatchActionSchema,
  UpdateProjectSchema,
} from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

export const revalidate = 60

/** Bust every cached read that touches this project. */
function invalidateProject(id: string) {
  revalidatePath('/api/projects')
  revalidatePath(`/api/projects/${id}`)
}

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    ObjectIdSchema.parse(id)
    const project = await getProjectById(id)
    if (!project) throw new NotFoundError('Project not found')
    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const body = UpdateProjectSchema.parse(await request.json())
    const project = await updateProject(id, body)
    if (!project) throw new NotFoundError('Project not found')
    invalidateProject(id)
    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const ok = await deleteProject(id)
    if (!ok) throw new NotFoundError('Project not found')
    invalidateProject(id)
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const { action } = ProjectPatchActionSchema.parse(await request.json())

    if (action === 'togglePublished') {
      const project = await togglePublished(id)
      if (!project) throw new NotFoundError('Project not found')
      invalidateProject(id)
      return NextResponse.json(project)
    }

    // Shouldn't reach here — the Zod enum already rejects unknown actions.
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return handleApiError(error)
  }
}
