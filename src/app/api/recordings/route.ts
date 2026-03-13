import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

// GET /api/recordings?orgId=xxx&date=2026-03-12
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }

  const where: Record<string, unknown> = { orgId }

  if (date) {
    const start = new Date(`${date}T00:00:00`)
    const end = new Date(`${date}T23:59:59`)
    where.createdAt = { gte: start, lte: end }
  }

  const sessions = await prisma.recordingSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      staff: { select: { id: true, name: true } },
      customer: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(sessions)
}

// POST /api/recordings — create a new recording session
export async function POST(request: Request) {
  const body = await request.json()
  const { orgId, staffId, customerId, startsAt, status } = body

  if (!orgId || !staffId) {
    return NextResponse.json({ error: 'orgId and staffId required' }, { status: 400 })
  }

  const session = await prisma.recordingSession.create({
    data: {
      orgId,
      staffId,
      customerId: customerId || null,
      status: status || 'RECORDING',
      ...(startsAt ? { createdAt: new Date(startsAt) } : {}),
    },
  })

  return NextResponse.json(session)
}
