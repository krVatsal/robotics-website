import { NextRequest, NextResponse } from 'next/server'
import { getTeamByCode } from '@/lib/models/team'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/teams/validate-code?code=ABC123
 *
 * The registration wizard uses this to preview the team name before letting
 * the user click "Configure Roster" and commit to joining. Always returns 200
 * (never 404) because the client just checks `valid: true|false` — a 404 would
 * spam the console during typing.
 *
 * Auth required — team codes are only meaningful to signed-in users, and
 * requiring auth prevents someone from probing for valid codes at scale.
 *
 * Prior version had two bugs:
 *   1. Called getDB() without await → .collection() ran on a Promise → threw
 *      → fetch caught it silently → validatedTeam stayed null → "Configure
 *      Roster" button stayed grayed out (the exact symptom the user hit).
 *   2. No auth check.
 * Both fixed.
 */
export async function GET(request: NextRequest) {
  try {
    await requireUser()

    const rawCode = request.nextUrl.searchParams.get('code') ?? ''
    const code = rawCode.trim().toUpperCase()

    // Cheap gate — team codes are 6 alphanumeric chars in the current nanoid
    // config. Reject anything else without hitting the DB.
    if (!/^[A-Z0-9]{4,10}$/.test(code)) {
      return NextResponse.json({ valid: false, reason: 'malformed' })
    }

    const team = await getTeamByCode(code)
    if (!team) {
      return NextResponse.json({ valid: false, reason: 'not_found' })
    }
    if (team.isFinalized) {
      return NextResponse.json({
        valid: false,
        reason: 'finalized',
        teamName: team.name,
      })
    }

    return NextResponse.json({
      valid: true,
      teamName: team.name,
      memberCount: Array.isArray(team.members) ? team.members.length : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
