import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { createMedia } from '@/lib/models/media'
import { requireUser } from '@/lib/auth-guard'
import { env } from '@/lib/env'
import { ApiError, handleApiError } from '@/lib/errors'

// Loose caps to catch obvious abuse. Cloudinary has its own limits.
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

export async function POST(request: NextRequest) {
  try {
    // Auth is now REQUIRED — no more phantom '000...000' ObjectId fallback.
    const userId = await requireUser()

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      throw new ApiError(400, 'No file provided')
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new ApiError(413, 'File too large (max 10 MB)')
    }
    if (!ALLOWED_MIME.has(file.type)) {
      throw new ApiError(415, `Unsupported file type: ${file.type}`)
    }

    // Forward to Cloudinary (unsigned preset upload).
    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: file.type })
    const cloudForm = new FormData()
    cloudForm.append('file', blob, file.name)
    cloudForm.append('upload_preset', env.CLOUDINARY_UPLOAD_PRESET)
    cloudForm.append('folder', 'robotics-club')

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: cloudForm },
    )

    if (!cloudRes.ok) {
      const errBody = await cloudRes.json().catch(() => ({}))
      throw new ApiError(
        502,
        `Cloudinary upload failed: ${
          errBody?.error?.message ?? 'unknown error'
        }`,
      )
    }

    const uploadResult = await cloudRes.json()

    const media = await createMedia({
      filename: file.name,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      uploadedBy: new ObjectId(userId),
      fileSize: buffer.byteLength,
      mimeType: file.type,
    })

    return NextResponse.json({ ...media, url: media.cloudinaryUrl }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
