import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    await requireAdmin()
    const db = await getDB()

    // Single-pass aggregation. Keeping this in Mongo instead of doing separate
    // queries + JS joins is a ~10x latency win once the collections have real data.
    const participations = await db
      .collection('teams')
      .aggregate([
        // Same $toObjectId guard used in lib/models/team.ts — supports legacy
        // team docs where competitionId was accidentally stored as a string.
        { $addFields: { competitionIdObj: { $toObjectId: '$competitionId' } } },
        {
          $lookup: {
            from: 'competitions',
            localField: 'competitionIdObj',
            foreignField: '_id',
            as: 'competition',
          },
        },
        { $unwind: { path: '$competition', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'leaderId',
            foreignField: '_id',
            as: 'leader',
          },
        },
        { $unwind: { path: '$leader', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            teamCode: 1,
            isFinalized: 1,
            createdAt: 1,
            memberCount: { $size: '$members' },
            competitionName: '$competition.title',
            leaderName: '$leader.name',
            leaderEmail: '$leader.email',
            leaderPhone: '$leader.phone',
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json(participations)
  } catch (error) {
    return handleApiError(error)
  }
}
