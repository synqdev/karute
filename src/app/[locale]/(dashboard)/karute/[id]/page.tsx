"use client"

import { use, useEffect, useState } from "react"
import { KaruteEditor } from "@/components/karute"
import type { KaruteEntryData } from "@/components/karute"
import type { TranscriptSegment } from "@/components/karute"

interface KaruteData {
  segments: TranscriptSegment[]
  entries: KaruteEntryData[]
  aiSummary: string
  staffName: string
  date: string
}

export default function KaruteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [data, setData] = useState<KaruteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Try sessionStorage first (fresh recording still in memory)
    function trySessionStorage(): boolean {
      const stored = sessionStorage.getItem(`karute_${id}`)
      if (!stored) return false
      try {
        const parsed = JSON.parse(stored) as KaruteData
        const entries = (parsed.entries || []).map((e: KaruteEntryData, i: number) => ({
          ...e,
          id: e.id || `entry_${i}`,
          sortOrder: e.sortOrder ?? i,
          confidence: e.confidence ?? 0.8,
          tags: e.tags || [],
        }))
        setData({ ...parsed, entries })
        setLoading(false)
        return true
      } catch {
        return false
      }
    }

    if (trySessionStorage()) return

    // 2. Try loading from DB
    async function loadFromDB() {
      try {
        const res = await fetch(`/api/karute/${id}`)
        if (res.ok) {
          const record = await res.json()
          const entries: KaruteEntryData[] = (record.entries || []).map(
            (e: Record<string, unknown>, i: number) => ({
              id: e.id as string,
              category: e.category as string,
              content: e.content as string,
              originalQuote: e.originalQuote as string | null,
              confidence: (e.confidence as number) ?? 0.8,
              tags: (e.tags as string[]) || [],
              sortOrder: (e.sortOrder as number) ?? i,
            })
          )
          const segments: TranscriptSegment[] = (
            record.recordingSession?.transcriptionSegments || []
          ).map((s: Record<string, unknown>) => ({
            text: s.text as string,
            startTime: s.startTime as number,
            endTime: s.endTime as number,
            speakerLabel: s.speakerLabel as string | undefined,
          }))
          setData({
            segments,
            entries,
            aiSummary: (record.aiSummary as string) || "",
            staffName: record.staff?.name || "",
            date: (record.createdAt as string).slice(0, 10),
          })
          setLoading(false)
          return
        }
      } catch {
        // fall through to polling
      }

      // 3. Poll sessionStorage (recording may still be processing)
      let attempts = 0
      const maxAttempts = 30
      const interval = setInterval(() => {
        attempts++
        if (trySessionStorage() || attempts >= maxAttempts) {
          clearInterval(interval)
          setLoading(false)
        }
      }, 1000)
      return () => clearInterval(interval)
    }

    loadFromDB()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-500/30 border-t-teal-500" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">No data found for this recording.</p>
      </div>
    )
  }

  return (
    <KaruteEditor
      karuteId={id}
      customerName=""
      staffName={data.staffName}
      date={data.date}
      aiSummary={data.aiSummary}
      entries={data.entries}
      segments={data.segments}
    />
  )
}
