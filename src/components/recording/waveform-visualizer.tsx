"use client"

import { useMemo } from "react"

interface WaveformVisualizerProps {
  audioLevel: number
}

const BAR_COUNT = 30

export function WaveformVisualizer({ audioLevel }: WaveformVisualizerProps) {
  const barHeights = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const center = BAR_COUNT / 2
      const distFromCenter = Math.abs(i - center) / center
      const wave = Math.cos(distFromCenter * Math.PI * 0.5)
      const jitter = 0.3 + Math.sin(i * 1.7) * 0.2 + Math.cos(i * 2.3) * 0.15
      const height = audioLevel > 0.01
        ? Math.max(0.08, audioLevel * wave * jitter)
        : 0.08
      return Math.min(1, height)
    })
  }, [audioLevel])

  return (
    <div className="flex h-24 items-center justify-center gap-[3px]">
      {barHeights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-primary/40 transition-all duration-150 ease-out"
          style={{
            height: `${Math.max(6, height * 96)}px`,
          }}
        />
      ))}
    </div>
  )
}
