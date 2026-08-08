import { z } from "zod";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "must be a valid ObjectId");

export const getProjectsSchema = z.object({
  category: z.string().optional(),
  featured: z.boolean().optional(),
  techStack: z.string().optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const getProjectByIdSchema = z.object({
  id: objectId,
});

export const getEventsSchema = z.object({
  year: z.number().int().optional(),
  activeOnly: z.boolean().default(false),
});

export const getEventDetailsSchema = z.object({
  id: objectId,
});

export const getCompetitionByIdSchema = z.object({
  id: objectId,
});

export const getTeamsSchema = z.object({
  competitionId: objectId.optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const getTeamByIdSchema = z.object({
  id: objectId,
});

export const getPublicUserProfileSchema = z.object({
  id: objectId,
});

export const getSiteContentSchema = z.object({
  sectionId: z.string().min(1),
});

export const getMediaSchema = z.object({
  limit: z.number().int().min(1).max(20).default(10),
});

export const searchMagazineSchema = z.object({
  query: z.string().min(3).max(300),
  year: z.number().int().min(2000).max(2100).optional(),
  limit: z.number().int().min(1).max(20).default(5),
});