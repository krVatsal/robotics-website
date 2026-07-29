import { NextRequest, NextResponse } from 'next/server'
import { rejectJoinRequest } from '@/lib/models/join-request'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const leaderId = await requireUser()
    const { id } = await params
    ObjectIdSchema.parse(id)
    const { teamId } = await rejectJoinRequest(id, leaderId)
    return NextResponse.json({ message: 'Request rejected', teamId })
  } catch (error) {
    return handleApiError(error)
  }
}
