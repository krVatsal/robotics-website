import { NextRequest, NextResponse } from 'next/server'
import { createProject, getAllProjects, getPublishedProjects } from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import { CreateProjectSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('published') === 'true'

    const projects = publishedOnly
      ? await getPublishedProjects()
      : await getAllProjects()

    return NextResponse.json(projects)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = CreateProjectSchema.parse(await request.json())
    const project = await createProject(body)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
