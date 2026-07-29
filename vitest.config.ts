import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

/**
 * Vitest config. Two important pieces:
 *   1. `alias` — matches tsconfig.json's `@/*` path so imports like
 *      `@/lib/validation` work in tests.
 *   2. `env` — provides fake env vars so lib/env.ts doesn't throw when a test
 *      transitively imports something that touches it. Real DB tests would
 *      need Testcontainers or Mongo Memory Server; those aren't wired here.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url))),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    env: {
      MONGO_URL: 'mongodb://test-placeholder',
      JWT_SECRET: 'test_jwt_secret_at_least_32_characters_long_x',
      ADMIN_PASSWORD: 'test_admin_password',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test',
      CLOUDINARY_API_KEY: 'test',
      CLOUDINARY_API_SECRET: 'test',
      CLOUDINARY_UPLOAD_PRESET: 'test',
    },
  },
})
