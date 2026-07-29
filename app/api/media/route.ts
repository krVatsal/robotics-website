import { NextResponse } from 'next/server'
import { getAllMedia } from '@/lib/models/media'
import { getAuthUserId, isAdmin } from '@/lib/auth-guard'
import { AuthError } from '@/lib/errors'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    const admin = await isAdmin()
    if (!userId && !admin) throw new AuthError()

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
