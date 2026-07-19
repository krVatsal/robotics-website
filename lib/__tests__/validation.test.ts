/**
 * Sanity tests for the Zod schemas. Pure functions — no DB, no HTTP, fast.
 *
 * These aren't exhaustive; they're a starting scaffold. When you add a new
 * schema or refine a rule, add a case here to prevent regressions.
 *
 * Run: npm test
 */
import { describe, expect, it } from 'vitest'
import {
  CreateCompetitionSchema,
  CreateProjectSchema,
  ObjectIdSchema,
  ParticipateSchema,
  ResetPasswordSchema,
  SendInvitationSchema,
  SignupSchema,
  UpdateUserSchema,
} from '../validation'

describe('ObjectIdSchema', () => {
  it('accepts a 24-hex-char id', () => {
    expect(ObjectIdSchema.safeParse('6a532167a0a0dfd397aaf65e').success).toBe(
      true,
    )
  })
  it('rejects short strings', () => {
    expect(ObjectIdSchema.safeParse('abc').success).toBe(false)
  })
  it('rejects non-hex characters', () => {
    expect(
      ObjectIdSchema.safeParse('zzzzz167a0a0dfd397aaf65e').success,
    ).toBe(false)
  })
})

describe('SignupSchema', () => {
  it('accepts a minimal valid signup', () => {
    const r = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'longenough1',
      name: 'A. User',
      department: 'CSE',
    })
    expect(r.success).toBe(true)
  })
  it('lowercases + trims email', () => {
    const r = SignupSchema.safeParse({
      email: '  User@Example.COM  ',
      password: 'longenough1',
      name: 'A. User',
      department: 'CSE',
    })
    expect(r.success && r.data.email).toBe('user@example.com')
  })
  it('rejects short passwords', () => {
    const r = SignupSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      name: 'A. User',
      department: 'CSE',
    })
    expect(r.success).toBe(false)
  })
})

describe('UpdateUserSchema (.strict())', () => {
  it('rejects unknown fields — no privilege escalation via body.role', () => {
    const r = UpdateUserSchema.safeParse({
      name: 'New name',
      role: 'admin', // extra field
    })
    expect(r.success).toBe(false)
  })
  it('accepts a partial update', () => {
    const r = UpdateUserSchema.safeParse({ name: 'New name' })
    expect(r.success).toBe(true)
  })
})

describe('CreateProjectSchema', () => {
  it('fills defaults for optional fields', () => {
    const r = CreateProjectSchema.safeParse({
      title: 'T',
      description: 'D',
      shortDescription: 'S',
      category: 'C',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.featured).toBe(false)
      expect(r.data.published).toBe(false)
      expect(r.data.techStack).toEqual([])
    }
  })
})

describe('CreateCompetitionSchema', () => {
  it('rejects when maxTeamSize < minTeamSize', () => {
    const r = CreateCompetitionSchema.safeParse({
      eventId: '6a532167a0a0dfd397aaf65e',
      title: 'C',
      minTeamSize: 5,
      maxTeamSize: 3,
    })
    expect(r.success).toBe(false)
  })
  it('accepts equal min and max', () => {
    const r = CreateCompetitionSchema.safeParse({
      eventId: '6a532167a0a0dfd397aaf65e',
      title: 'C',
      minTeamSize: 3,
      maxTeamSize: 3,
    })
    expect(r.success).toBe(true)
  })
})

describe('ParticipateSchema (discriminated union)', () => {
  it('accepts a CREATE payload', () => {
    const r = ParticipateSchema.safeParse({
      action: 'CREATE',
      competitionId: '6a532167a0a0dfd397aaf65e',
      teamName: 'T',
    })
    expect(r.success).toBe(true)
  })
  it('uppercases teamCode on JOIN', () => {
    const r = ParticipateSchema.safeParse({
      action: 'JOIN',
      teamCode: 'abc123',
    })
    expect(r.success && (r.data as any).teamCode).toBe('ABC123')
  })
})

describe('SendInvitationSchema (union: id OR email)', () => {
  it('accepts a userId', () => {
    expect(
      SendInvitationSchema.safeParse({
        invitedUser: '6a532167a0a0dfd397aaf65e',
      }).success,
    ).toBe(true)
  })
  it('accepts an email', () => {
    expect(
      SendInvitationSchema.safeParse({ email: 'a@b.com' }).success,
    ).toBe(true)
  })
  it('rejects a bad email', () => {
    expect(
      SendInvitationSchema.safeParse({ email: 'not-an-email' }).success,
    ).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  it('requires a min-length password', () => {
    const r = ResetPasswordSchema.safeParse({
      token: 'a'.repeat(64),
      password: 'short',
    })
    expect(r.success).toBe(false)
  })
})
