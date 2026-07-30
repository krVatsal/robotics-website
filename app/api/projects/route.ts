import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createProject, getAllProjects, getPublishedProjects } from '@/lib/models/project'
import { requireAdmin } from '@/lib/auth-guard'
import { CreateProjectSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { getDB } from '@/lib/db'

export const revalidate = 120

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publishedOnly = searchParams.get('published') === 'true'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const category = searchParams.get('category')

    const db = await getDB()
    const filter: any = {}
    if (publishedOnly) filter.published = true
    if (category && category !== 'All') filter.category = category

    const skip = (page - 1) * limit

    const [projects, total] = await Promise.all([
      db.collection('projects')
        .find(filter)
        .sort({ featured: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('projects').countDocuments(filter),
    ])

    const res = NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    return res
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = CreateProjectSchema.parse(await request.json())
    const project = await createProject(body)
    revalidatePath('/api/projects')
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
