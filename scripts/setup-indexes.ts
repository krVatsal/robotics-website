/**
 * Create all MongoDB indexes the app depends on.
 *
 * Run once after deploy (or any time the schema evolves):
 *   npx tsx scripts/setup-indexes.ts
 *
 * `createIndex` is idempotent — running it again on an existing index is a no-op.
 * Safe to run in CI/CD as part of the deploy step.
 *
 * WHY EACH INDEX EXISTS:
 *   - unique indexes give us race-safe uniqueness at the DB layer, so
 *     application-level "does this exist?" checks aren't security-critical.
 *   - non-unique indexes accelerate frequent queries; without them, MongoDB
 *     does full collection scans that fall over at even modest data volumes.
 *
 * Compound-index ordering rule: prefix matters, left-to-right. The order below
 * is chosen so the most common query patterns hit the index.
 */
import { getDB } from '../lib/db'

async function main() {
  const db = await getDB()

  const jobs: Array<{ collection: string; spec: any; options?: any; reason: string }> = [
    // ──────── USERS ────────
    {
      collection: 'users',
      spec: { email: 1 },
      options: { unique: true },
      reason: 'unique email + fast getUserByEmail (signin)',
    },

    // ──────── TEAMS ────────
    {
      collection: 'teams',
      spec: { teamCode: 1 },
      options: { unique: true },
      reason: 'unique team code + fast joinTeamByCode',
    },
    {
      collection: 'teams',
      spec: { competitionId: 1 },
      reason: 'list teams for a competition (admin views)',
    },
    {
      collection: 'teams',
      spec: { leaderId: 1 },
      reason: 'find teams a user leads (finalize permission checks)',
    },
    {
      collection: 'teams',
      // multikey index — MongoDB creates one entry per array element
      spec: { members: 1 },
      reason: 'find teams a user is on (getAllTeamsForUser aggregation)',
    },
    {
      collection: 'teams',
      spec: { members: 1, createdAt: -1 },
      reason: 'user-teams sorted newest-first (getLatestTeamForUser + getAllTeamsForUser)',
    },

    // ──────── PROJECTS ────────
    {
      collection: 'projects',
      spec: { published: 1, featured: 1, createdAt: -1 },
      reason: 'landing page: featured+published sorted newest-first',
    },
    {
      collection: 'projects',
      spec: { category: 1, published: 1 },
      reason: 'category page: getProjectsByCategory',
    },
    {
      collection: 'projects',
      spec: { published: 1, createdAt: -1 },
      reason: 'general "published projects newest first" listings',
    },

    // ──────── COMPETITIONS ────────
    {
      collection: 'competitions',
      spec: { eventId: 1 },
      reason: 'list competitions for an event',
    },

    // ──────── MEDIA ────────
    {
      collection: 'media',
      spec: { uploadedBy: 1, createdAt: -1 },
      reason: 'user media library, newest first',
    },
    {
      collection: 'media',
      spec: { cloudinaryPublicId: 1 },
      options: { unique: true },
      reason: 'unique cloud asset + fast deleteByPublicId',
    },

    // ──────── EVENTS ────────
    {
      collection: 'events',
      spec: { name: 1 },
      options: { unique: true },
      reason: 'unique event name + fast getEventByName',
    },
    {
      collection: 'events',
      spec: { isActive: 1, year: -1 },
      reason: 'active events listing sorted by year',
    },
  ]

  console.log(`\nSetting up ${jobs.length} indexes on '${db.databaseName}'...\n`)

  for (const job of jobs) {
    try {
      const name = await db.collection(job.collection).createIndex(job.spec, job.options)
      console.log(`  ✓ ${job.collection}.${name}  — ${job.reason}`)
    } catch (err: any) {
      console.error(
        `  ✗ ${job.collection}  spec=${JSON.stringify(job.spec)}  error: ${err.message}`,
      )
      // Don't abort — keep going so we report every failure at once.
    }
  }

  console.log('\nDone.\n')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Index setup failed:', err)
    process.exit(1)
  })
