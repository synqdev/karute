import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

// GET /api/settings?orgId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')

  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { settings: true, name: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ settings: org.settings, orgName: org.name })
  } catch (error) {
    console.error('[GET /api/settings]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/settings — update org settings
export async function PUT(request: Request) {
  const body = await request.json()
  const { orgId, settings, orgName } = body

  if (!orgId) {
    return NextResponse.json({ error: 'orgId required' }, { status: 400 })
  }

  try {
    const data: Record<string, unknown> = {}
    if (settings !== undefined) data.settings = settings
    if (orgName !== undefined) data.name = orgName

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data,
      select: { settings: true, name: true },
    })

    return NextResponse.json({ settings: updated.settings, orgName: updated.name })
  } catch (error) {
    console.error('[PUT /api/settings]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
