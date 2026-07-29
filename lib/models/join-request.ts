/**
 * Join requests — the OPPOSITE direction of invitations.
 *
 *   Invitations : leader → user  ("come join my team")
 *   Join reqs   : user   → leader ("let me on your team")
 *
 * Kept as a separate collection from invitations for clarity + independent
 * indexing. The lifecycles are similar (pending → accepted/rejected) but the
 * consumer is different (leader sees requests, user sees invites).
 *
 * Race protection: a partial unique index on
 *   { teamId, userId, status: 'pending' }
 * prevents duplicate pending requests. Auto-created by scripts/setup-indexes.ts.
 */
import { ObjectId } from 'mongodb'
import { getDB } from '@/lib/db'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/errors'

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected'

export interface JoinRequest {
  _id?: ObjectId
  teamId: ObjectId
  userId: ObjectId // who wants to join
  status: JoinRequestStatus
  createdAt: Date
  respondedAt?: Date
}

function oid(id: string) {
  return new ObjectId(id)
}

/**
 * Create a pending join request. Called when a user submits a valid team
 * code from the registration wizard. Refuses if:
 *   - team is finalized (locked)
 *   - user is already a member
 *   - a pending request already exists (also enforced by unique index)
 */
export async function createJoinRequest(args: {
  teamId: string
  userId: string
}): Promise<JoinRequest> {
  const db = await getDB()
  const { teamId, userId } = args

  const team = await db.collection('teams').findOne({ _id: oid(teamId) })
  if (!team) throw new NotFoundError('Team not found')
  if (team.isFinalized) throw new ConflictError('Team is finalized')

  const alreadyMember = (team.members ?? []).some(
    (m: any) => m?.toString?.() === userId,
  )
  if (alreadyMember) {
    throw new ConflictError('You are already on this team')
  }

  const doc: JoinRequest = {
    teamId: oid(teamId),
    userId: oid(userId),
    status: 'pending',
    createdAt: new Date(),
  }
  try {
    const result = await db.collection('join_requests').insertOne(doc)
    return { ...doc, _id: result.insertedId }
  } catch (e: any) {
    if (e?.code === 11000) {
      throw new ConflictError(
        'You already have a pending request for this team',
      )
    }
    throw e
  }
}

/**
 * Pending requests for teams the caller LEADS. Used by the leader's inbox.
 * Aggregation populates the requesting user's codename + display name so the
 * UI can show it without a second call.
 */
export async function getPendingRequestsForLeader(leaderId: string) {
  const db = await getDB()
  return db
    .collection('join_requests')
    .aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      { $unwind: '$team' },
      { $match: { 'team.leaderId': new ObjectId(leaderId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          status: 1,
          createdAt: 1,
          teamId: 1,
          teamName: '$team.name',
          userName: '$user.name',
          userEmail: '$user.email',
          userCodename: '$user.codename',
          userProfileImage: '$user.profileImage',
        },
      },
    ])
    .toArray()
}

/**
 * Requests targeted at a specific team. Used by team detail page for the
 * leader's inbox restricted to one team. Same shape as above minus the
 * leader-scope filter (route enforces caller is leader).
 */
export async function getPendingRequestsForTeam(teamId: string) {
  const db = await getDB()
  return db
    .collection('join_requests')
    .aggregate([
      { $match: { teamId: new ObjectId(teamId), status: 'pending' } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          status: 1,
          createdAt: 1,
          userId: 1,
          userName: '$user.name',
          userEmail: '$user.email',
          userCodename: '$user.codename',
          userProfileImage: '$user.profileImage',
        },
      },
    ])
    .toArray()
}

export async function getJoinRequestById(id: string) {
  const db = await getDB()
  if (!ObjectId.isValid(id)) return null
  return db.collection('join_requests').findOne({ _id: new ObjectId(id) })
}

/**
 * Leader accepts a request. Verifies the caller leads the team, adds the
 * user to team.members, and marks the request accepted. Same E11000 catch
 * as accept-invitation for the "already-in-another-team-in-this-competition"
 * unique index case.
 *
 * Returns memberIds so the route can bust caches.
 */
export async function acceptJoinRequest(
  requestId: string,
  leaderId: string,
): Promise<{ teamId: string; memberIds: string[] }> {
  const db = await getDB()
  const req = await getJoinRequestById(requestId)
  if (!req) throw new NotFoundError('Request not found')
  if (req.status !== 'pending') {
    throw new ConflictError(`Request already ${req.status}`)
  }

  const team = await db.collection('teams').findOne({ _id: req.teamId })
  if (!team) throw new NotFoundError('Team no longer exists')
  if (team.leaderId?.toString() !== leaderId) {
    throw new ForbiddenError('Only the team leader can approve requests')
  }
  if (team.isFinalized) throw new ConflictError('Team is finalized')

  const alreadyMember = (team.members ?? []).some(
    (m: any) => m?.toString?.() === req.userId.toString(),
  )
  if (!alreadyMember) {
    try {
      await db.collection('teams').updateOne(
        { _id: req.teamId },
        { $addToSet: { members: req.userId } as any },
      )
    } catch (e: any) {
      if (e?.code === 11000) {
        throw new ConflictError(
          'That user is already on another team in this competition',
        )
      }
      throw e
    }
  }

  await db.collection('join_requests').updateOne(
    { _id: req._id },
    { $set: { status: 'accepted', respondedAt: new Date() } },
  )

  const fresh = await db.collection('teams').findOne(
    { _id: req.teamId },
    { projection: { members: 1 } },
  )
  const memberIds = (fresh?.members ?? []).map(
    (m: any) => m?.toString?.() ?? String(m),
  )
  return { teamId: req.teamId.toString(), memberIds }
}

/** Leader rejects a request. */
export async function rejectJoinRequest(
  requestId: string,
  leaderId: string,
): Promise<{ teamId: string }> {
  const db = await getDB()
  const req = await getJoinRequestById(requestId)
  if (!req) throw new NotFoundError('Request not found')
  if (req.status !== 'pending') {
    throw new ConflictError(`Request already ${req.status}`)
  }
  const team = await db.collection('teams').findOne({ _id: req.teamId })
  if (!team) throw new NotFoundError('Team no longer exists')
  if (team.leaderId?.toString() !== leaderId) {
    throw new ForbiddenError('Only the team leader can reject requests')
  }

  await db.collection('join_requests').updateOne(
    { _id: req._id },
    { $set: { status: 'rejected', respondedAt: new Date() } },
  )
  return { teamId: req.teamId.toString() }
}
