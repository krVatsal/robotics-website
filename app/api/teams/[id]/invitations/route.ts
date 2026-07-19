import { NextRequest, NextResponse } from 'next/server'
import { sendInvitation } from '@/lib/models/invitation'
import { getUserByCodename, getUserByEmail } from '@/lib/models/user'
import { requireUser } from '@/lib/auth-guard'
import { ObjectIdSchema, SendInvitationSchema } from '@/lib/validation'
import { NotFoundError, handleApiError } from '@/lib/errors'

type Props = { params: Promise<{ id: string }> }

/**
 * POST /api/teams/[id]/invitations
 * Body accepts ONE of:
 *   { "invitedUser": "<userId>" }
 *   { "email": "..." }
 *   { "codename": "..." }
 *
 * Codename is the primary flow the UI will use — the leader searches by
 * codename in an autocomplete and clicks the result. Email/userId are kept
 * for backward compat + admin tooling.
 */
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const leaderId = await requireUser()
    const { id: teamId } = await params
    ObjectIdSchema.parse(teamId)
    const body = SendInvitationSchema.parse(await request.json())

    // Resolve whichever identity path the client used → userId.
    let invitedUserId: string
    if ('email' in body) {
      const user = await getUserByEmail(body.email)
      if (!user?._id) {
        throw new NotFoundError(
          'No user with that email is registered. Ask them to sign up first.',
        )
      }
      invitedUserId = user._id.toString()
    } else if ('codename' in body) {
      const user = await getUserByCodename(body.codename)
      if (!user?._id) {
        throw new NotFoundError(
          'No user with that codename. Ask them to pick a codename first.',
        )
      }
      invitedUserId = user._id.toString()
    } else {
      invitedUserId = body.invitedUser
    }

    const invitation = await sendInvitation({
      teamId,
      leaderId,
      invitedUserId,
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
