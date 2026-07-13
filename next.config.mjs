/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Consider removing this once the codebase is fully typed — right now it
    // hides real bugs. Leaving as-is to match previous behavior.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // NOTE: `api.bodyParser` and `serverRuntimeConfig` were removed in Next.js 13+.
  // - Body size for route handlers is controlled per-route (see media/upload route).
  // - `maxDuration` is now set per-route via `export const maxDuration = 60`.
}

export default nextConfig
