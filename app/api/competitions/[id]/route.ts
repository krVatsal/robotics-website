import { NextRequest, NextResponse } from "next/server"
import { getCompetitionById, updateCompetition, deleteCompetition } from "@/lib/models/competition"
import { requireAdmin } from "@/lib/auth-guard"
import { handleApiError, NotFoundError } from "@/lib/errors"
import { ObjectIdSchema, UpdateCompetitionSchema } from "@/lib/validation"

// NOTE: PUT below now throws NotFoundError on a null update result. Without
// that check we were returning 200 with a `null` body — misleading to the
// client and inconsistent with the DELETE handler.

type Props = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        ObjectIdSchema.parse(id)
        const competition = await getCompetitionById(id)
        if (!competition) throw new NotFoundError('Competition not found')
        return NextResponse.json(competition)
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
