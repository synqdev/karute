import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

// PATCH /api/recordings/:id — update recording (e.g. stop recording)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, durationSeconds, endsAt } = body

  const data: Record<string, unknown> = {}
  if (status) data.status = status
  if (durationSeconds !== undefined) data.durationSeconds = durationSeconds

  const session = await prisma.recordingSession.update({
    where: { id },
    data,
  })

  return NextResponse.json(session)
}
