import { NextResponse } from 'next/server'
import { getPendingRequestsForLeader } from '@/lib/models/join-request'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/join-requests
 * Pending requests across all teams the caller LEADS. Populated with the
 * requesting user's codename + name so the UI can render immediately.
 */
export async function GET() {
  try {
    const leaderId = await requireUser()
    const requests = await getPendingRequestsForLeader(leaderId)
    return NextResponse.json(requests)
  } catch (error) {
    return handleApiError(error)
  }
}
