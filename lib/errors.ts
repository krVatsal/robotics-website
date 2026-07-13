import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { log } from './logger'

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(details: unknown, message = 'Invalid input') {
    super(400, message, details)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message)
    this.name = 'ConflictError'
  }
}


export function handleApiError(error: unknown): NextResponse {

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.flatten() },
      { status: 400 },
    )
  }

  
  if (error instanceof ApiError) {
    const body: Record<string, unknown> = { error: error.message }
    if (error.details !== undefined) body.details = error.details
    return NextResponse.json(body, { status: error.statusCode })
  }


  log.error('unhandled api error', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
