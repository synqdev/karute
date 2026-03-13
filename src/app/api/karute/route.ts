import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

// GET /api/karute?orgId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }

  const records = await prisma.karuteRecord.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    include: {
      staff: { select: { name: true } },
      customer: { select: { name: true } },
      _count: { select: { entries: true } },
    },
  })

  return NextResponse.json(records)
}

// POST /api/karute — create or upsert a karute record
export async function POST(request: Request) {
  const body = await request.json()
  const { orgId, staffId, recordingSessionId, aiSummary, entries } = body

  if (!orgId || !staffId) {
    return NextResponse.json({ error: 'orgId and staffId required' }, { status: 400 })
  }

  // Upsert: if a karute already exists for this recording, update it
  const existing = recordingSessionId
    ? await prisma.karuteRecord.findUnique({ where: { recordingSessionId } })
    : null

  if (existing) {
    // Delete old entries and replace
    await prisma.karuteEntry.deleteMany({ where: { karuteRecordId: existing.id } })

    const updated = await prisma.karuteRecord.update({
      where: { id: existing.id },
      data: {
        aiSummary,
        entries: {
          create: (entries || []).map((e: Record<string, unknown>, i: number) => ({
            category: e.category as string,
            content: e.content as string,
            originalQuote: (e.originalQuote as string) || null,
            confidence: (e.confidence as number) || 0,
            tags: (e.tags as string[]) || [],
            sortOrder: i,
          })),
        },
      },
      include: { entries: true },
    })

    return NextResponse.json(updated)
  }

  // Create new
  const record = await prisma.karuteRecord.create({
    data: {
      orgId,
      staffId,
      recordingSessionId: recordingSessionId || null,
      aiSummary,
      entries: {
        create: (entries || []).map((e: Record<string, unknown>, i: number) => ({
          category: e.category as string,
          content: e.content as string,
          originalQuote: (e.originalQuote as string) || null,
          confidence: (e.confidence as number) || 0,
          tags: (e.tags as string[]) || [],
          sortOrder: i,
        })),
      },
    },
    include: { entries: true },
  })

  return NextResponse.json(record)
}
