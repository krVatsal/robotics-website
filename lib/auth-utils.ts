/**
 * Backward-compat shim.
 *
 * The real auth helpers now live in `lib/auth-guard.ts`. This file re-exports
 * `getAuthUserId` so existing routes that import from `@/lib/auth-utils` keep
 * working. New code should import from `@/lib/auth-guard` directly and prefer
 * the stricter `requireUser` / `requireAdmin` helpers.
 */
export { getAuthUserId } from './auth-guard'
