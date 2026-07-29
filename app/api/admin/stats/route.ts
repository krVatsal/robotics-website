import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/admin/stats
 * One-stop admin dashboard summary. All queries fire in parallel — this
 * endpoint is only as slow as its slowest query, not the sum.
 *
 * Note: some fields use countDocuments (cheap when indexed) and one uses an
 * aggregation for teams-by-status. If this endpoint gets called often, wrap
 * it in Redis with a 30-60s TTL — stats can be a bit stale without harm.
 */
export async function GET() {
  try {
    await requireAdmin()
    const db = await getDB()

    const [
      users,
      teamsTotal,
      teamsByStatus,
      projectsTotal,
      projectsPublished,
      projectsFeatured,
      eventsTotal,
      eventsActive,
      competitionsTotal,
      competitionsOpen,
      mediaTotal,
      invitationsPending,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('teams').countDocuments(),
      db
        .collection('teams')
        .aggregate([
          {
            $group: {
              // Fall back to a synthetic status for legacy docs without
              // approvalStatus so counts add up to teamsTotal.
              _id: {
                $ifNull: [
                  '$approvalStatus',
                  { $cond: ['$isFinalized', 'approved', 'draft'] },
                ],
              },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      db.collection('projects').countDocuments(),
      db.collection('projects').countDocuments({ published: true }),
      db.collection('projects').countDocuments({ featured: true, published: true }),
      db.collection('events').countDocuments(),
      db.collection('events').countDocuments({ isActive: true }),
      db.collection('competitions').countDocuments(),
      db.collection('competitions').countDocuments({ registrationOpen: true }),
      db.collection('media').countDocuments(),
      db.collection('invitations').countDocuments({ status: 'pending' }),
    ])

    // Reshape teams-by-status into a stable object with all 4 statuses present
    // (even if zero), so the frontend doesn't have to handle missing keys.
    const byStatus: Record<string, number> = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
    }
    for (const row of teamsByStatus as any[]) {
      if (row?._id && row._id in byStatus) byStatus[row._id] = row.count
    }

    return NextResponse.json({
      users: { total: users },
      teams: { total: teamsTotal, byStatus },
      projects: {
        total: projectsTotal,
        published: projectsPublished,
        featured: projectsFeatured,
      },
      events: { total: eventsTotal, active: eventsActive },
      competitions: {
        total: competitionsTotal,
        registrationOpen: competitionsOpen,
      },
      media: { total: mediaTotal },
      invitations: { pending: invitationsPending },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
