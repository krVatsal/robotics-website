import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProject, getAllProjects, getPublishedProjects } from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import { CreateProjectSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

// ISR: cache this GET response at the CDN/edge for 60s. A burst of 1000 visitors
// hitting /projects in the same minute now results in 1 DB query, not 1000.
// Writes below call revalidatePath to bust the cache on mutations.
export const revalidate = 60

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
    // Bust cached list — new project needs to be visible immediately.
    revalidatePath('/api/projects')
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
