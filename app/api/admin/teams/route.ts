import { NextRequest, NextResponse } from 'next/server'
import { listTeamsByStatus } from '@/lib/models/team'
import { requireAdmin } from '@/lib/auth-guard'
import { TeamStatusQuery } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/admin/teams?status=submitted
 * Returns teams filtered by approval status (leader + competition populated).
 * Defaults to 'submitted' so admin lands on the review queue.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('status') ?? 'submitted'
    // Empty query returns all statuses if explicitly asked for
    const status = raw === 'all' ? undefined : TeamStatusQuery.parse(raw)

    const teams = await listTeamsByStatus(status)
    return NextResponse.json(teams)
  } catch (error) {
    return handleApiError(error)
  }
}
