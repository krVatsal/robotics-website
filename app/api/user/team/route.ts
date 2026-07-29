import { NextResponse } from 'next/server'
import { getAllTeamsForUser } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'
import { cacheKeys, withCache } from '@/lib/redis'

// Short TTL — team membership can change (join / kick / leave) and users
// notice staleness immediately. 30 seconds is enough to soak up a burst of
// page loads without hiding real changes for long.
const USER_TEAMS_CACHE_TTL_SEC = 30

export async function GET() {
  try {
    const userId = await requireUser()

    const teams = await withCache(
      cacheKeys.userTeams(userId),
      USER_TEAMS_CACHE_TTL_SEC,
      () => getAllTeamsForUser(userId),
    )

    return NextResponse.json(teams)
  } catch (error) {
    return handleApiError(error)
  }
}
