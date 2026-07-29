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

export class RateLimitError extends ApiError {
  public readonly retryAfterSec: number
  constructor(retryAfterSec: number, message = 'Too many requests') {
    super(429, message)
    this.name = 'RateLimitError'
    this.retryAfterSec = retryAfterSec
  }
}


export function handleApiError(error: unknown): NextResponse {
  // Malformed JSON — request.json() throws SyntaxError. Without this branch it
  // would fall through to the generic 500 handler and get logged as an unhandled
  // error. Return a clean 400 instead.
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.flatten() },
      { status: 400 },
    )
  }

  
  if (error instanceof ApiError) {
    const body: Record<string, unknown> = { error: error.message }
    if (error.details !== undefined) body.details = error.details
    // 429s benefit from Retry-After — clients that respect it back off cleanly.
    const headers: Record<string, string> = {}
    if (error instanceof RateLimitError) {
      headers['Retry-After'] = String(error.retryAfterSec)
    }
    return NextResponse.json(body, { status: error.statusCode, headers })
  }

  // Hook point: if Sentry (or another APM) is wired up, capture the exception
  // HERE. Keep it optional — the hook fires only if SENTRY_DSN is configured.
  // The dep isn't installed by default (avoids a chunky bundle just for the hook).
  //
  //   if (env.SENTRY_DSN) Sentry.captureException(error)
  log.error('unhandled api error', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
