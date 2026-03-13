import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

// GET /api/karute/[id] — get a single karute record with entries and segments
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // First try to find by karute record ID
  let record = await prisma.karuteRecord.findUnique({
    where: { id },
    include: {
      entries: { orderBy: { sortOrder: 'asc' } },
      staff: { select: { name: true } },
      customer: { select: { name: true } },
      recordingSession: {
        include: {
          segments: { orderBy: { segmentIndex: 'asc' } },
        },
      },
    },
  })

  // If not found by karute ID, try by recording session ID
  if (!record) {
    record = await prisma.karuteRecord.findUnique({
      where: { recordingSessionId: id },
      include: {
        entries: { orderBy: { sortOrder: 'asc' } },
        staff: { select: { name: true } },
        customer: { select: { name: true } },
        recordingSession: {
          include: {
            segments: { orderBy: { segmentIndex: 'asc' } },
          },
        },
      },
    })
  }

  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(record)
}
