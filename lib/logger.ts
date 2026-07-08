/**
 * Minimal structured logger for server-side code.
 *
 * Design goals:
 *   - Human-readable in dev (dev tools show one line per event)
 *   - JSON in prod (Vercel / Datadog / any log aggregator can parse it)
 *   - Zero deps (Node core only)
 *   - Cheap enough to sprinkle everywhere
 *
 * Swap for pino / winston if we ever need trace IDs, sampling, or transports.
 * The public shape (`log.info(msg, fields?)`) stays the same, so callers don't change.
 */
type Level = 'debug' | 'info' | 'warn' | 'error'
type Fields = Record<string, unknown>

// Read NODE_ENV directly (not via lib/env) so this file is safe to import from
// contexts that haven't validated the full env yet — e.g. during boot itself.
const isDev = process.env.NODE_ENV !== 'production'

function fmt(level: Level, msg: string, fields?: Fields): string {
  const ts = new Date().toISOString()
  if (isDev) {
    const extra = fields ? ' ' + JSON.stringify(fields) : ''
    return `[${ts}] ${level.toUpperCase()} ${msg}${extra}`
  }
  return JSON.stringify({ ts, level, msg, ...(fields ?? {}) })
}

function normalizeError(err: unknown): Fields {
  if (err instanceof Error) {
    return { errorName: err.name, errorMessage: err.message, stack: err.stack }
  }
  return { error: String(err) }
}

export const log = {
  debug(msg: string, fields?: Fields) {
    if (!isDev) return // silence debug in prod
    // eslint-disable-next-line no-console
    console.debug(fmt('debug', msg, fields))
  },
  info(msg: string, fields?: Fields) {
    // eslint-disable-next-line no-console
    console.log(fmt('info', msg, fields))
  },
  warn(msg: string, fields?: Fields) {
    // eslint-disable-next-line no-console
    console.warn(fmt('warn', msg, fields))
  },
  error(msg: string, errOrFields?: unknown) {
    const fields =
      errOrFields instanceof Error || typeof errOrFields !== 'object' || errOrFields === null
        ? normalizeError(errOrFields)
        : (errOrFields as Fields)
    // eslint-disable-next-line no-console
    console.error(fmt('error', msg, fields))
  },
}
