import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json({ authorized: true })
  } catch (error) {
    return handleApiError(error)
  }
}
