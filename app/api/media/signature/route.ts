import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { requireUser } from '@/lib/auth-guard'
import { env } from '@/lib/env'
import { handleApiError } from '@/lib/errors'

/**
 * POST /api/media/signature
 *
 * Returns a short-lived Cloudinary signature so the browser can upload
 * DIRECTLY to Cloudinary — no bytes flow through our server. This is the
 * canonical way to do uploads at scale.
 *
 * Old flow (still available at /api/media/upload):
 *   browser → our API → cloudinary  (bytes proxied, API bandwidth burned)
 *
 * New flow:
 *   1. browser POSTs here → gets { signature, timestamp, apiKey, cloudName, folder }
 *   2. browser POSTs (multipart) to https://api.cloudinary.com/v1_1/<cloudName>/image/upload
 *      with fields: file, api_key, timestamp, folder, signature
 *   3. browser gets back { secure_url, public_id, ... }
 *   4. browser POSTs { url, publicId, size, mime, filename } to /api/media (a
 *      new "record upload" endpoint, TODO — not in scope for this iteration)
 *      to save the DB row.
 *
 * We only sign what we control. `folder` is fixed to 'robotics-club' so a
 * malicious client can't dump images into someone else's folder in the
 * account.
 */
export async function POST() {
  try {
    // Only signed-in users may upload — same rule the proxy upload enforces.
    await requireUser()

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'robotics-club'

    // Cloudinary signing: sort params alphabetically, join as key=value pairs,
    // append api_secret, SHA-1. Docs:
    //   https://cloudinary.com/documentation/authentication_signatures
    const signParams = { folder, timestamp: String(timestamp) }
    const paramString = Object.keys(signParams)
      .sort()
      .map((k) => `${k}=${(signParams as any)[k]}`)
      .join('&')
    const signature = createHash('sha1')
      .update(paramString + env.CLOUDINARY_API_SECRET)
      .digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
