import { NextRequest, NextResponse } from 'next/server'
import { deleteMedia, getMediaById } from '@/lib/models/media'
import { requireAdmin } from '@/lib/auth-guard'
import { env } from '@/lib/env'
import { ObjectIdSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { log } from '@/lib/logger'

type Props = { params: Promise<{ id: string }> }

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    // Delete is destructive + hits Cloudinary — admin only.
    await requireAdmin()
    const { id } = await params
    ObjectIdSchema.parse(id)

    const media = await getMediaById(id)
    if (!media) {
      // Idempotent: already gone counts as success.
      return NextResponse.json({ message: 'Media already deleted' })
    }

    // Best-effort Cloudinary delete. If it fails we still delete the DB row —
    // orphaned Cloudinary assets are cleaned up by a periodic job later, better
    // than a stale DB row pointing at a missing image.
    if (media.cloudinaryPublicId) {
      const auth = Buffer.from(
        `${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`,
      ).toString('base64')
      const qs = new URLSearchParams()
      qs.append('public_ids[]', media.cloudinaryPublicId)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/image/upload?${qs}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Basic ${auth}` },
        },
      )
      if (!cloudRes.ok) {
        log.warn('cloudinary delete failed', {
          publicId: media.cloudinaryPublicId,
          status: cloudRes.status,
          body: await cloudRes.text(),
        })
      }
    }

    const ok = await deleteMedia(id)
    if (!ok) {
      return NextResponse.json({ error: 'Database delete failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
