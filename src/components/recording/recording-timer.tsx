"use client"

interface RecordingTimerProps {
  seconds: number
}

export function RecordingTimer({ seconds }: RecordingTimerProps) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

  return (
    <div className="select-none text-center">
      <span className="text-4xl font-light tracking-widest text-foreground tabular-nums font-mono">
        {display}
      </span>
    </div>
  )
}
