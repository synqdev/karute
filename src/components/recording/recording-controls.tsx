"use client"

import { Mic, Pause, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { RecordingTimer } from "./recording-timer"
import { WaveformVisualizer } from "./waveform-visualizer"

interface RecordingControlsProps {
  onRecordingComplete?: (blob: Blob) => void
}

export function RecordingControls({ onRecordingComplete }: RecordingControlsProps) {
  const {
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    audioBlob,
    elapsedSeconds,
    audioLevel,
  } = useAudioRecorder()

  const handleStop = () => {
    stopRecording()
  }

  if (audioBlob && status === "stopped" && onRecordingComplete) {
    onRecordingComplete(audioBlob)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Waveform */}
      <WaveformVisualizer audioLevel={audioLevel} />

      {/* Timer */}
      <RecordingTimer seconds={elapsedSeconds} />

      {/* Controls */}
      <div className="flex items-center gap-6">
        {status === "idle" || status === "stopped" ? (
          <button
            onClick={startRecording}
            className="group flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
            aria-label="録音開始"
          >
            <Mic className="size-8 transition-transform duration-200 group-hover:scale-110" />
          </button>
        ) : (
          <>
            {/* Pause / Resume */}
            <Button
              variant="outline"
              size="icon-lg"
              onClick={status === "paused" ? resumeRecording : pauseRecording}
              aria-label={status === "paused" ? "再開" : "一時停止"}
              className="size-14 rounded-full"
            >
              {status === "paused" ? (
                <Play className="size-5" />
              ) : (
                <Pause className="size-5" />
              )}
            </Button>

            {/* Stop */}
            <Button
              variant="destructive"
              size="icon-lg"
              onClick={handleStop}
              aria-label="停止"
              className="size-14 rounded-full"
            >
              <Square className="size-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
