'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingType = 'booking' | 'blocked' | 'open'

interface TimeSlot {
  id: string
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  type: BookingType
  customerName?: string
  serviceName?: string
}

interface StaffRow {
  id: string
  name: string
  avatarUrl?: string
  initials: string
  slots: TimeSlot[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const START_HOUR = 10
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR
const AVATAR_COL_WIDTH = 80

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STAFF: StaffRow[] = [
  {
    id: 's1',
    name: 'Amy',
    initials: 'AM',
    slots: [
      {
        id: 'b1',
        startHour: 10,
        startMinute: 0,
        endHour: 11,
        endMinute: 0,
        type: 'booking',
        customerName: 'Jon Chan',
        serviceName: '1 Hour Massage',
      },
      {
        id: 'b2',
        startHour: 12,
        startMinute: 0,
        endHour: 13,
        endMinute: 0,
        type: 'booking',
        customerName: 'Anthony Lee',
        serviceName: '1 Hour Massage',
      },
      {
        id: 'b3',
        startHour: 19,
        startMinute: 0,
        endHour: 21,
        endMinute: 0,
        type: 'blocked',
      },
    ],
  },
  {
    id: 's2',
    name: 'Liz',
    initials: 'LZ',
    slots: [
      {
        id: 'b4',
        startHour: 11,
        startMinute: 30,
        endHour: 14,
        endMinute: 0,
        type: 'blocked',
      },
    ],
  },
  {
    id: 's3',
    name: 'Staff 3',
    initials: 'S3',
    slots: [
      {
        id: 'b5',
        startHour: 12,
        startMinute: 0,
        endHour: 24,
        endMinute: 0,
        type: 'open',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeToPercent(hour: number, minute: number): number {
  const totalMinutes = (hour - START_HOUR) * 60 + minute
  const totalRange = TOTAL_HOURS * 60
  return (totalMinutes / totalRange) * 100
}

function getCurrentTimePercent(): number {
  const now = new Date()
  return timeToPercent(now.getHours(), now.getMinutes())
}

function formatCurrentTime(): string {
  const now = new Date()
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Slot colors
// ---------------------------------------------------------------------------

const slotStyles: Record<BookingType, string> = {
  booking:
    'bg-[#6db6c8]/80 border-[#4db4ca] text-white',
  blocked:
    'bg-[#d4a1a6]/70 border-[#d59fa5] text-white/80',
  open:
    'bg-white/20 border-white/30 text-white/50',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StaffTimetable() {
  const t = useTranslations('dashboard')
  const currentPercent = getCurrentTimePercent()
  const currentTime = formatCurrentTime()

  return (
    <div className="overflow-hidden rounded-xl bg-[#8fa8af] shadow-lg">
      {/* Header bar */}
      <div className="flex items-center gap-2 bg-[#7d9ea7] px-4 py-2.5">
        <span className="text-sm font-semibold text-white">
          {t('timetable.title')}
        </span>
      </div>

      {/* Timetable body */}
      <div className="relative">
        {/* Time header row */}
        <div className="flex">
          <div style={{ width: AVATAR_COL_WIDTH }} className="shrink-0" />
          <div className="relative flex-1">
            <div className="flex h-8 items-end">
              {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
                const hour = START_HOUR + i
                if (hour > END_HOUR) return null
                return (
                  <div
                    key={hour}
                    className="absolute text-[11px] font-medium text-white/70"
                    style={{ left: `${timeToPercent(hour, 0)}%`, transform: 'translateX(-50%)' }}
                  >
                    {hour}:00
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Staff rows */}
        {MOCK_STAFF.map((staff, rowIndex) => (
          <div
            key={staff.id}
            className={cn(
              'flex border-t border-white/20',
              rowIndex % 2 === 0 ? 'bg-[#b8c2c7]/40' : 'bg-[#c3c9cd]/30'
            )}
          >
            {/* Avatar column */}
            <div
              style={{ width: AVATAR_COL_WIDTH }}
              className="flex shrink-0 flex-col items-center justify-center gap-1 bg-white/10 py-3"
            >
              <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white/80 text-xs font-bold text-[#7d9ea7] shadow-sm">
                {staff.avatarUrl ? (
                  <img
                    src={staff.avatarUrl}
                    alt={staff.name}
                    className="size-full object-cover"
                  />
                ) : (
                  staff.initials
                )}
              </div>
              <span className="text-[10px] font-medium text-white/90">
                {staff.name}
              </span>
            </div>

            {/* Timeline slots area */}
            <div className="relative flex-1 py-2" style={{ minHeight: 64 }}>
              {/* Hour grid lines */}
              {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-white/15"
                  style={{ left: `${((i + 1) / TOTAL_HOURS) * 100}%` }}
                />
              ))}

              {/* Open/available background */}
              <div className="absolute inset-y-2 left-0 right-0 rounded-[20px] bg-white/10" />

              {/* Booking / blocked bars */}
              {staff.slots.map((slot) => {
                const left = timeToPercent(slot.startHour, slot.startMinute)
                const right = timeToPercent(slot.endHour, slot.endMinute)
                const width = right - left

                return (
                  <div
                    key={slot.id}
                    className={cn(
                      'absolute inset-y-2 rounded-[20px] border px-3 py-1.5 transition-shadow hover:shadow-md',
                      slotStyles[slot.type]
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {slot.type === 'booking' && (
                      <>
                        <p className="truncate text-[10px] font-medium leading-tight">
                          {slot.startHour}:{slot.startMinute.toString().padStart(2, '0')}-
                          {slot.endHour}:{slot.endMinute.toString().padStart(2, '0')}
                        </p>
                        <p className="truncate text-[11px] font-semibold leading-tight">
                          {slot.customerName}
                        </p>
                        <p className="truncate text-[10px] leading-tight opacity-80">
                          {slot.serviceName}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Current time indicator */}
        {currentPercent >= 0 && currentPercent <= 100 && (
          <div
            className="pointer-events-none absolute top-0 z-10 h-full"
            style={{
              left: `calc(${AVATAR_COL_WIDTH}px + ${currentPercent}% * (100% - ${AVATAR_COL_WIDTH}px) / 100%)`,
            }}
          >
            <div className="relative h-full">
              <div className="absolute -left-[1px] top-0 h-full w-0.5 bg-white/60" />
              <div className="absolute -left-6 -top-0.5 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-[#7d9ea7] shadow-sm">
                {currentTime}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
