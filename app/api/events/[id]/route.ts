import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { deleteEvent, updateEvent } from '@/lib/models/events'
import { requireAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema, UpdateEventSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const body = UpdateEventSchema.parse(await request.json())
    const result = await updateEvent(id, body)
    // Same fix as competitions PUT — null result means "not found", not "no-op".
    if (!result) throw new NotFoundError('Event not found')
    revalidatePath('/api/events')
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const ok = await deleteEvent(id)
    if (!ok) throw new NotFoundError('Event not found')
    revalidatePath('/api/events')
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
