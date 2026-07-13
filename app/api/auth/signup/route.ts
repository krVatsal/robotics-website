import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail } from '@/lib/models/user'
import { env } from '@/lib/env'
import { SignupSchema } from '@/lib/validation'
import { ConflictError, handleApiError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = SignupSchema.parse(await request.json())

    // Cheap pre-check. The DB unique index on `users.email` (once added) is the
    // actual race-safe guarantee — this check just returns a nicer error.
    const existing = await getUserByEmail(body.email)
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    const user = await createUser(body)

    const token = jwt.sign(
      { userId: user._id?.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
