import { NextRequest, NextResponse } from 'next/server'
import { deleteCompetition, updateCompetition } from '@/lib/models/competition'
import { requireAdmin } from '@/lib/auth-guard'
import { ObjectIdSchema, UpdateCompetitionSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

// NOTE: PUT below now throws NotFoundError on a null update result. Without
// that check we were returning 200 with a `null` body — misleading to the
// client and inconsistent with the DELETE handler.

type Props = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const body = UpdateCompetitionSchema.parse(await request.json())
    const result = await updateCompetition(id, body)
    if (!result) throw new NotFoundError('Competition not found')
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
    const ok = await deleteCompetition(id)
    if (!ok) throw new NotFoundError('Competition not found')
    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
