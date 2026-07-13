import { NextResponse } from 'next/server'
import { getAllTeamsForUser } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    const userId = await requireUser()
    const teams = await getAllTeamsForUser(userId)
    return NextResponse.json(teams)
  } catch (error) {
    return handleApiError(error)
  }
}
