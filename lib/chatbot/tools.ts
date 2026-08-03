import { ObjectId } from "mongodb";
import { tool } from "@langchain/core/tools";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDB } from "@/lib/db"; // reuse your existing connection helper
import {
  getProjectsSchema,
  getProjectByIdSchema,
  getEventsSchema,
  getEventDetailsSchema,
  getCompetitionByIdSchema,
  getTeamsSchema,
  getTeamByIdSchema,
  getPublicUserProfileSchema,
  getSiteContentSchema,
  getMediaSchema,
  searchMagazineSchema,
} from "./schemas";

const embedModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
  model: "gemini-embedding-001",
});

// ---------- output shaping (the actual privacy boundary) ----------

function toPublicProject(doc: any) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    shortDescription: doc.shortDescription,
    category: doc.category,
    image: doc.image,
    techStack: doc.techStack,
    hardwareUsed: doc.hardwareUsed,
    softwareUsed: doc.softwareUsed,
    achievements: doc.achievements,
    links: doc.links,
    contributors: doc.contributors?.map((c: any) => ({ name: c.name, role: c.role })),
  };
}

function toPublicEvent(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    year: doc.year,
    theme: doc.theme,
    tagline: doc.tagline,
    description: doc.description,
    date: doc.date,
    location: doc.location,
    highlights: doc.highlights,
    isActive: doc.isActive,
  };
}

function toPublicCompetition(doc: any) {
  return {
    id: doc._id.toString(),
    eventId: doc.eventId.toString(),
    title: doc.title,
    type: doc.type,
    description: doc.description,
    minTeamSize: doc.minTeamSize,
    maxTeamSize: doc.maxTeamSize,
    rules: doc.rules,
    registrationOpen: doc.registrationOpen,
  };
}

function toPublicMedia(doc: any) {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    url: doc.cloudinaryUrl,
    mimeType: doc.mimeType,
    createdAt: doc.createdAt,
  };
}

// ---------- resolvers ----------

async function getProjects(args: typeof getProjectsSchema._type) {
  const db = await getDB();
  const filter: Record<string, unknown> = { published: true }; // never overridable by model args
  if (args.category) filter.category = args.category;
  if (args.featured !== undefined) filter.featured = args.featured;
  if (args.techStack) filter.techStack = args.techStack;

  const docs = await db.collection("projects").find(filter).limit(args.limit).toArray();
  return docs.map(toPublicProject);
}

async function getProjectById(args: typeof getProjectByIdSchema._type) {
  const db = await getDB();
  const doc = await db.collection("projects").findOne({ _id: new ObjectId(args.id), published: true });
  return doc ? toPublicProject(doc) : null;
}

async function getEvents(args: typeof getEventsSchema._type) {
  const db = await getDB();
  const filter: Record<string, unknown> = {};
  if (args.year) filter.year = args.year;
  if (args.activeOnly) filter.isActive = true;

  const docs = await db.collection("events").find(filter).toArray();
  return docs.map(toPublicEvent);
}

async function getEventDetails(args: typeof getEventDetailsSchema._type) {
  const db = await getDB();
  const event = await db.collection("events").findOne({ _id: new ObjectId(args.id) });
  if (!event) return null;

  const competitions = await db
    .collection("competitions")
    .find({ eventId: event._id })
    .toArray();

  return { ...toPublicEvent(event), competitions: competitions.map(toPublicCompetition) };
}

async function getCompetitionById(args: typeof getCompetitionByIdSchema._type) {
  const db = await getDB();
  const doc = await db.collection("competitions").findOne({ _id: new ObjectId(args.id) });
  return doc ? toPublicCompetition(doc) : null;
}

async function getTeams(args: typeof getTeamsSchema._type) {
  const db = await getDB();
  const filter: Record<string, unknown> = { approvalStatus: "approved" }; // hard-coded, never overridable
  if (args.competitionId) filter.competitionId = new ObjectId(args.competitionId);

  const docs = await db.collection("teams").find(filter).limit(args.limit).toArray();
  return Promise.all(docs.map((d) => toPublicTeam(db, d)));
}

async function getTeamById(args: typeof getTeamByIdSchema._type) {
  const db = await getDB();
  const doc = await db.collection("teams").findOne({
    _id: new ObjectId(args.id),
    approvalStatus: "approved",
  });
  return doc ? toPublicTeam(db, doc) : null;
}

async function toPublicTeam(db: any, doc: any) {
  const members = await db
    .collection("users")
    .find({ _id: { $in: doc.members } })
    .project({ name: 1, codename: 1 }) // security boundary: only these fields ever leave Mongo
    .toArray();

  return {
    id: doc._id.toString(),
    name: doc.name,
    competitionId: doc.competitionId.toString(),
    members: members.map((m: any) => m.name ?? m.codename),
    isFinalized: doc.isFinalized,
  };
}

async function getPublicUserProfile(args: typeof getPublicUserProfileSchema._type) {
  const db = await getDB();
  const doc = await db.collection("users").findOne(
    { _id: new ObjectId(args.id) },
    { projection: { name: 1, codename: 1, department: 1, bio: 1, profileImage: 1 } }, // security boundary
  );
  return doc ? { id: doc._id.toString(), ...doc } : null;
}

async function getSiteContent(args: typeof getSiteContentSchema._type) {
  const db = await getDB();
  const doc = await db.collection("site_content").findOne({ sectionId: args.sectionId });
  return doc ? doc.content : null;
}

async function getMedia(args: typeof getMediaSchema._type) {
  const db = await getDB();
  const docs = await db
    .collection("media")
    .find({})
    .project({ filename: 1, cloudinaryUrl: 1, mimeType: 1, createdAt: 1 }) // drop uploadedBy at the DB level
    .sort({ createdAt: -1 })
    .limit(args.limit)
    .toArray();
  return docs.map(toPublicMedia);
}

async function searchMagazine(args: typeof searchMagazineSchema._type) {
  const db = await getDB();

  const embedResult = await embedModel.embedContent(args.query);
  const queryVector = embedResult.embedding.values;

  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: "magazine_vector_index",
        path: "embedding",
        queryVector,
        numCandidates: args.limit * 10,
        limit: args.limit,
        ...(args.year ? { filter: { year: { $eq: args.year } } } : {}),
      },
    },
    {
      $project: {
        _id: 0,
        year: 1,
        issueId: 1,
        pageNumber: 1,
        articleTitle: 1,
        text: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];

  return db.collection("magazine_chunks").aggregate(pipeline).toArray();
}

// ---------- serialization ----------

// Groq (and some other providers) rejects tool messages with empty content.
// LangChain's ToolNode treats a returned JS array as a list of content
// blocks rather than stringifying it — an empty array becomes zero content
// blocks, which fails validation. Wrapping every resolver's result through
// JSON.stringify (with an explicit fallback for empty results) avoids that
// ambiguity entirely, regardless of what shape the resolver returns.
function serialized<Args, R>(fn: (args: Args) => Promise<R>, name: string) {
  return async (args: Args): Promise<string> => {
    const result = await fn(args);
    console.log(`[tool:${name}] args=`, JSON.stringify(args), "result=", JSON.stringify(result)?.slice(0, 300));
    if (result === null || result === undefined) return "null";
    if (Array.isArray(result) && result.length === 0) {
      return JSON.stringify({ results: [], message: "No results found." });
    }
    return JSON.stringify(result);
  };
}

// ---------- LangChain tool wrappers ----------

export const chatbotTools = [
  tool(serialized(getProjects, "getProjects"), {
    name: "getProjects",
    description: "List published club projects, optionally filtered by category, featured status, or tech stack.",
    schema: getProjectsSchema,
  }),
  tool(serialized(getProjectById, "getProjectById"), {
    name: "getProjectById",
    description: "Get full details of a single published project by its id.",
    schema: getProjectByIdSchema,
  }),
  tool(serialized(getEvents, "getEvents"), {
    name: "getEvents",
    description: "List club events, optionally filtered by year or active status.",
    schema: getEventsSchema,
  }),
  tool(serialized(getEventDetails, "getEventDetails"), {
    name: "getEventDetails",
    description: "Get full details of an event including its competitions.",
    schema: getEventDetailsSchema,
  }),
  tool(serialized(getCompetitionById, "getCompetitionById"), {
    name: "getCompetitionById",
    description: "Get details of a single competition by id.",
    schema: getCompetitionByIdSchema,
  }),
  tool(serialized(getTeams, "getTeams"), {
    name: "getTeams",
    description: "List approved teams, optionally filtered by competition.",
    schema: getTeamsSchema,
  }),
  tool(serialized(getTeamById, "getTeamById"), {
    name: "getTeamById",
    description: "Get details of a single approved team, including member names.",
    schema: getTeamByIdSchema,
  }),
  tool(serialized(getPublicUserProfile, "getPublicUserProfile"), {
    name: "getPublicUserProfile",
    description: "Get a member's public profile (name, codename, department, bio). Never returns contact info.",
    schema: getPublicUserProfileSchema,
  }),
  tool(serialized(getSiteContent, "getSiteContent"), {
    name: "getSiteContent",
    description: "Get CMS content for a site section (e.g. FAQ, about).",
    schema: getSiteContentSchema,
  }),
  tool(serialized(getMedia, "getMedia"), {
    name: "getMedia",
    description: "List recent public media (gallery images/videos).",
    schema: getMediaSchema,
  }),
  tool(serialized(searchMagazine, "searchMagazine"), {
    name: "searchMagazine",
    description:
      "Semantic search over the club's yearly magazine archive. Optionally scope to a specific year. Returns no results if the archive isn't ingested yet.",
    schema: searchMagazineSchema,
  }),
];