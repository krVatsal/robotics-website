import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createEvent, getAllEvents } from '@/lib/models/events'
import { requireAdmin } from '@/lib/auth-guard'
import { CreateEventSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

// Events change rarely — long-ish revalidate is fine. Writes below bust it.
export const revalidate = 300

export async function GET() {
  try {
    const events = await getAllEvents()
    return NextResponse.json(events)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = CreateEventSchema.parse(await request.json())
    const result = await createEvent(body)
    revalidatePath('/api/events')
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
