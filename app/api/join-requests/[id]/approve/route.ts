import { NextRequest, NextResponse } from 'next/server'
import { acceptJoinRequest } from '@/lib/models/join-request'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { cacheDel, cacheKeys } from '@/lib/redis'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/join-requests/[id]/approve
 * Leader accepts a pending join request. Adds the requester to the team,
 * marks the request as accepted, busts caches for every affected member.
 */
export async function POST(_request: NextRequest, { params }: Props) {
  try {
    const leaderId = await requireUser()
    const { id } = await params
    ObjectIdSchema.parse(id)

    const { teamId, memberIds } = await acceptJoinRequest(id, leaderId)

    void cacheDel(
      cacheKeys.team(teamId),
      ...memberIds.map((mid) => cacheKeys.userTeams(mid)),
    )
    return NextResponse.json({ message: 'Request approved', teamId })
  } catch (error) {
    return handleApiError(error)
  }
}
