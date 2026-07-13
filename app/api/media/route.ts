import { NextResponse } from 'next/server'
import { getAllMedia } from '@/lib/models/media'
import { requireUser } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    // Media library is an authenticated-only view. Anon users don't need to
    // browse every uploaded image.
    await requireUser()

    const allMedia = await getAllMedia()

    // Shape mapping stays the same — UI expects `url`, `cloudinaryId`, `uploadedAt`.
    const mapped = allMedia.map((item: any) => ({
      _id: item._id,
      filename: item.filename,
      url: item.cloudinaryUrl,
      cloudinaryId: item.cloudinaryPublicId,
      uploadedAt: item.createdAt,
      size: item.fileSize,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return handleApiError(error)
  }
}
