import { NextRequest, NextResponse } from 'next/server'
import { createCompetition, getCompetitionsByEvent } from '@/lib/models/competition'
import { requireAdmin } from '@/lib/auth-guard'
import { CreateCompetitionSchema, ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    ObjectIdSchema.parse(eventId)
    const competitions = await getCompetitionsByEvent(eventId)
    return NextResponse.json(competitions)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = CreateCompetitionSchema.parse(await request.json())
    // Model expects eventId as ObjectId, not string. Convert at the boundary.
    const result = await createCompetition({
      ...body,
      eventId: new ObjectId(body.eventId),
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
