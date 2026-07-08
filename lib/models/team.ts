import { nanoid } from 'nanoid'
import { ObjectId } from 'mongodb'
import { getDB } from '../db'

export interface Team {
  _id?: ObjectId
  name: string
  teamCode: string
  competitionId: ObjectId
  leaderId: ObjectId
  members: ObjectId[]
  isFinalized: boolean
  createdAt: Date
  finalizedAt?: Date
}

/** Accept either a valid 24-hex ObjectId string or an existing ObjectId. */
function safeObjectId(id: string): any {
  return /^[0-9a-fA-F]{24}$/.test(id) ? new ObjectId(id) : id
}

const TEAM_CODE_LENGTH = 6
const CREATE_TEAM_MAX_RETRIES = 5

/**
 * Create a team with a nanoid code. Race-safe: if two concurrent inserts
 * happen to generate the same code, the unique index on `teams.teamCode`
 * makes the second one fail with E11000, and we retry with a fresh code.
 *
 * Collision probability per attempt is astronomical (~1 in 2^30 for a 6-char
 * upper-case nanoid), so retries almost never happen — but "almost never"
 * isn't "never", and the DB guarantees correctness either way.
 */
export async function createTeam(data: {
  name: string
  leaderId: string
  competitionId: string
}) {
  const db = await getDB()

  for (let attempt = 0; attempt < CREATE_TEAM_MAX_RETRIES; attempt++) {
    const teamCode = nanoid(TEAM_CODE_LENGTH).toUpperCase()
    const newTeam = {
      name: data.name,
      teamCode,
      competitionId: safeObjectId(data.competitionId),
      leaderId: safeObjectId(data.leaderId),
      members: [safeObjectId(data.leaderId)],
      isFinalized: false,
      createdAt: new Date(),
    }

    try {
      const result = await db.collection('teams').insertOne(newTeam)
      return { ...newTeam, _id: result.insertedId }
    } catch (error: any) {
      if (error?.code === 11000 && attempt < CREATE_TEAM_MAX_RETRIES - 1) {
        continue // collision on teamCode — retry with a new nanoid
      }
      throw error
    }
  }

  // If we ever hit this line, something is very wrong (or the entropy is bad).
  throw new Error('Failed to generate a unique team code after retries')
}

export async function joinTeamByCode(userId: string, code: string) {
  const db = await getDB()
  // Only allow joining teams that aren't finalized yet.
  const result = await db.collection('teams').findOneAndUpdate(
    { teamCode: code, isFinalized: false },
    { $addToSet: { members: safeObjectId(userId) } },
    { returnDocument: 'after' },
  )
  return result
}

/**
 * Fetch a team by _id with member details and competition name populated.
 * Single aggregation pipeline — one round-trip instead of N+1 lookups.
 */
export async function getTeamById(id: string) {
  const db = await getDB()
  if (!ObjectId.isValid(id)) return null

  const pipeline = [
    { $match: { _id: new ObjectId(id) } },
    // Guard: ensure competitionId is an ObjectId even if legacy docs stored it as string.
    { $addFields: { competitionIdObj: { $toObjectId: '$competitionId' } } },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'memberDetails',
      },
    },
    {
      $lookup: {
        from: 'competitions',
        localField: 'competitionIdObj',
        foreignField: '_id',
        as: 'competitionDetails',
      },
    },
    { $unwind: { path: '$competitionDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        teamCode: 1,
        isFinalized: 1,
        leaderId: 1,
        competitionId: 1,
        competitionName: {
          $ifNull: [
            '$competitionDetails.title',
            '$competitionDetails.name',
            'Unknown Competition',
          ],
        },
        members: {
          $map: {
            input: '$memberDetails',
            as: 'member',
            in: {
              _id: '$$member._id',
              name: '$$member.name',
              email: '$$member.email',
            },
          },
        },
      },
    },
  ]

  const [team] = await db.collection('teams').aggregate(pipeline).toArray()
  return team ?? null
}

export async function finalizeTeam(teamId: string, userId: string) {
  const db = await getDB()

  if (!ObjectId.isValid(teamId) || !ObjectId.isValid(userId)) {
    throw new Error('Invalid System ID Format')
  }

  // The WHERE clause enforces leader-only finalization — if the user isn't the
  // leader, the update finds no doc and returns null.
  const result = await db.collection('teams').findOneAndUpdate(
    {
      _id: safeObjectId(teamId),
      leaderId: safeObjectId(userId),
    },
    { $set: { isFinalized: true, finalizedAt: new Date() } },
    { returnDocument: 'after' },
  )

  if (!result) {
    throw new Error(
      'Unauthorized: Leader credentials mismatch or team not found',
    )
  }

  return result
}

export async function getUserTeamForCompetition(userId: string, competitionId: string) {
  const db = await getDB()
  return db.collection('teams').findOne({
    competitionId: safeObjectId(competitionId),
    members: safeObjectId(userId),
  })
}

/** Newest team the user is on. Uses the (members, createdAt desc) index. */
export async function getLatestTeamForUser(userId: string) {
  const [team] = await runUserTeamsPipeline(userId, { limit: 1 })
  return team ?? null
}

/** All teams the user is on, newest first. Uses the (members, createdAt desc) index. */
export async function getAllTeamsForUser(userId: string) {
  return runUserTeamsPipeline(userId)
}

/** Shared aggregation for "teams by user" — same shape for both list/single endpoints. */
async function runUserTeamsPipeline(userId: string, opts: { limit?: number } = {}) {
  const db = await getDB()
  const pipeline: any[] = [
    { $match: { members: new ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
  ]
  if (opts.limit) pipeline.push({ $limit: opts.limit })
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'memberDetails',
      },
    },
    {
      $lookup: {
        from: 'competitions',
        localField: 'competitionId',
        foreignField: '_id',
        as: 'competitionDetails',
      },
    },
    { $unwind: { path: '$competitionDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        teamCode: 1,
        isFinalized: 1,
        leaderId: 1,
        competitionId: 1,
        competitionName: {
          $ifNull: [
            '$competitionDetails.title',
            '$competitionDetails.name',
            'Unknown Competition',
          ],
        },
        members: {
          $map: {
            input: '$memberDetails',
            as: 'member',
            in: {
              _id: '$$member._id',
              name: '$$member.name',
              email: '$$member.email',
            },
          },
        },
      },
    },
  )

  return db.collection('teams').aggregate(pipeline).toArray()
}
