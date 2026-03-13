import { create } from 'zustand'

export type BarType = 'booking' | 'blocked' | 'open' | 'recording' | 'processing'

export interface TimelineBar {
  id: string
  rowId: string
  startMinute: number
  durationMinute: number
  title: string
  subtitle?: string
  type: BarType
}

interface TimetableState {
  bars: TimelineBar[]
  recordingBarId: string | null
  recordingStartMinute: number | null
  loaded: boolean
  startRecordingBar: (staffId: string, orgId: string) => void
  stopRecordingBar: () => void
  setBars: (bars: TimelineBar[]) => void
  loadBars: (orgId: string, date?: string) => Promise<void>
}

function nowMinute() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function formatTime(minute: number) {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

// Convert a DB recording session to a timeline bar
function sessionToBar(session: {
  id: string
  staffId: string
  status: string
  createdAt: string
  durationSeconds?: number | null
}): TimelineBar {
  const created = new Date(session.createdAt)
  const startMinute = created.getHours() * 60 + created.getMinutes()
  const durationMinute = session.durationSeconds
    ? Math.max(1, Math.round(session.durationSeconds / 60))
    : 1

  if (session.status === 'RECORDING') {
    return {
      id: session.id,
      rowId: session.staffId,
      startMinute,
      durationMinute: Math.max(1, nowMinute() - startMinute),
      title: 'Recording...',
      type: 'recording',
    }
  }

  const endMinute = startMinute + durationMinute
  return {
    id: session.id,
    rowId: session.staffId,
    startMinute,
    durationMinute,
    title: `${formatTime(startMinute)}-${formatTime(endMinute)}`,
    subtitle: 'Recording',
    type: 'booking',
  }
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  bars: [],
  recordingBarId: null,
  recordingStartMinute: null,
  loaded: false,

  loadBars: async (orgId: string, date?: string) => {
    try {
      const d = date || todayDate()
      const res = await fetch(`/api/recordings?orgId=${orgId}&date=${d}`)
      if (!res.ok) return
      const sessions = await res.json()
      const bars = sessions.map(sessionToBar)
      set({ bars, loaded: true })
    } catch {
      // silently fail, keep in-memory bars
    }
  },

  startRecordingBar: (staffId: string, orgId: string) => {
    const start = nowMinute()
    const tempId = `rec_${Date.now()}`
    const bar: TimelineBar = {
      id: tempId,
      rowId: staffId,
      startMinute: start,
      durationMinute: 1,
      title: 'Recording...',
      type: 'recording',
    }
    set((state) => ({
      bars: [...state.bars, bar],
      recordingBarId: tempId,
      recordingStartMinute: start,
    }))

    // Persist to DB
    fetch('/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, staffId }),
    })
      .then((res) => res.json())
      .then((session) => {
        // Replace temp ID with real DB ID
        set((state) => ({
          bars: state.bars.map((b) =>
            b.id === tempId ? { ...b, id: session.id } : b
          ),
          recordingBarId: state.recordingBarId === tempId ? session.id : state.recordingBarId,
        }))
      })
      .catch(() => {})
  },

  stopRecordingBar: () => {
    const { recordingBarId, recordingStartMinute } = get()
    if (!recordingBarId || recordingStartMinute === null) return

    const end = nowMinute()
    const duration = Math.max(1, end - recordingStartMinute)
    const durationSeconds = duration * 60
    const startLabel = formatTime(recordingStartMinute)
    const endLabel = formatTime(end)

    set((state) => ({
      bars: state.bars.map((b) =>
        b.id === recordingBarId
          ? {
              ...b,
              durationMinute: duration,
              title: `${startLabel}-${endLabel}`,
              subtitle: 'Recording',
              type: 'booking' as const,
            }
          : b
      ),
      recordingBarId: null,
      recordingStartMinute: null,
    }))

    // Persist to DB
    if (!recordingBarId.startsWith('rec_')) {
      fetch(`/api/recordings/${recordingBarId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', durationSeconds }),
      }).catch(() => {})
    }
  },

  setBars: (bars) => set({ bars }),
}))
