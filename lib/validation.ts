/**
 * Zod schemas for every request body the API accepts.
 *
 * Rules of thumb applied here:
 *   - Every string has a max length (prevent 10MB payloads)
 *   - Every array has a max size (prevent 1M-element arrays)
 *   - IDs use a strict 24-hex-char regex (MongoDB ObjectId shape) — rejects garbage before it hits the DB
 *   - Enums instead of open strings where possible (dept, category, etc.)
 *   - `.default(...)` for optional-with-default fields, so downstream code never sees undefined
 *
 * Each schema doubles as a TypeScript type via `z.infer<typeof Schema>`.
 */
import { z } from 'zod'

/** MongoDB ObjectId shape — 24 hex characters. */
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')

// ────────────────────────────────────────────────────────────
// USER
// ────────────────────────────────────────────────────────────

export const SignupSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  name: z.string().min(1).max(100).trim(),
  rollNo: z.string().max(20).trim().optional(),
  department: z.string().min(1).max(100).trim(),
})
export type SignupInput = z.infer<typeof SignupSchema>

export const SigninSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z.string().min(1).max(100),
})
export type SigninInput = z.infer<typeof SigninSchema>

export const UpdateUserSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    rollNo: z.string().max(20).trim().optional(),
    department: z.string().max(100).trim().optional(),
    phone: z
      .string()
      .max(20)
      .regex(/^[+\d\s\-()]*$/, 'Invalid phone number')
      .optional(),
    profileImage: z.string().url().max(500).optional(),
    bio: z.string().max(1000).optional(),
  })
  .strict() 
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// ────────────────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────────────────

export const AdminAuthSchema = z.object({
  password: z.string().min(1).max(200),
})
export type AdminAuthInput = z.infer<typeof AdminAuthSchema>

// ────────────────────────────────────────────────────────────
// PROJECT
// ────────────────────────────────────────────────────────────

const ContributorSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  role: z.string().min(1).max(100).trim(),
  github: z.string().url().max(300).optional(),
})

const LinksSchema = z
  .object({
    github: z.string().url().max(300).optional(),
    documentation: z.string().url().max(300).optional(),
    demo: z.string().url().max(300).optional(),
  })
  .default({})

export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(2000),
  shortDescription: z.string().min(1).max(300),
  category: z.string().min(1).max(100).trim(),
  image: z.string().url().max(500).optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  hardwareUsed: z.array(z.string().max(100)).max(50).default([]),
  softwareUsed: z.array(z.string().max(100)).max(50).default([]),
  techStack: z.array(z.string().max(100)).max(50).default([]),
  contributors: z.array(ContributorSchema).max(100).default([]),
  mentors: z.array(ContributorSchema).max(20).default([]),
  content: z.string().max(50_000).default(''),
  achievements: z.array(z.string().max(300)).max(50).default([]),
  links: LinksSchema,
})
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = CreateProjectSchema.partial().strict()
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

export const ProjectPatchActionSchema = z.object({
  action: z.enum(['togglePublished']),
})

// ────────────────────────────────────────────────────────────
// EVENT
// ────────────────────────────────────────────────────────────

export const CreateEventSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  year: z.number().int().min(2000).max(2100),
  theme: z.string().max(200).default(''),
  tagline: z.string().max(300).default(''),
  description: z.string().max(5000).default(''),
  date: z.string().min(1).max(100),
  location: z.string().max(200).default(''),
  participantsLabel: z.string().max(100).default(''),
  highlights: z.array(z.string().max(200)).max(20).default([]),
})
export type CreateEventInput = z.infer<typeof CreateEventSchema>

export const UpdateEventSchema = CreateEventSchema.partial().strict()
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>

// ────────────────────────────────────────────────────────────
// COMPETITION
// ────────────────────────────────────────────────────────────

export const CreateCompetitionSchema = z
  .object({
    eventId: ObjectIdSchema,
    title: z.string().min(1).max(200).trim(),
    type: z.string().max(100).default(''),
    description: z.string().max(5000).default(''),
    minTeamSize: z.number().int().min(1).max(20),
    maxTeamSize: z.number().int().min(1).max(20),
    rules: z.array(z.string().max(1000)).max(50).default([]),
    registrationOpen: z.boolean().default(false),
  })
  .refine((d) => d.maxTeamSize >= d.minTeamSize, {
    message: 'maxTeamSize must be >= minTeamSize',
    path: ['maxTeamSize'],
  })
export type CreateCompetitionInput = z.infer<typeof CreateCompetitionSchema>


export const UpdateCompetitionSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    type: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    minTeamSize: z.number().int().min(1).max(20).optional(),
    maxTeamSize: z.number().int().min(1).max(20).optional(),
    rules: z.array(z.string().max(1000)).max(50).optional(),
    registrationOpen: z.boolean().optional(),
  })
  .strict()
export type UpdateCompetitionInput = z.infer<typeof UpdateCompetitionSchema>

// ────────────────────────────────────────────────────────────
// PARTICIPATE (team create/join)
// ────────────────────────────────────────────────────────────

export const ParticipateSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('CREATE'),
    competitionId: ObjectIdSchema,
    teamName: z.string().min(1).max(100).trim(),
  }),
  z.object({
    action: z.literal('JOIN'),
    competitionId: ObjectIdSchema.optional(),
    teamCode: z.string().min(1).max(20).trim().toUpperCase(),
  }),
])
export type ParticipateInput = z.infer<typeof ParticipateSchema>
