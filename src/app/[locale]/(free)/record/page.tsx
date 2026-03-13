'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Mic, Pause, Play, Square, ArrowLeft } from 'lucide-react'
import { useSessionStore } from '@/stores/session-store'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { Link } from '@/i18n/navigation'

function Equalizer({ level }: { level: number }) {
  const bars = Array.from({ length: 28 }, (_, i) => {
    const center = 14
    const dist = Math.abs(i - center) / center
    const wave = Math.cos(dist * Math.PI * 0.5)
    const jitter = 0.4 + Math.sin(i * 1.7) * 0.2 + Math.cos(i * 2.3) * 0.15
    const h = level > 0.01 ? Math.max(0.06, level * wave * jitter) : 0.06
    return Math.min(1, h)
  })

  return (
    <div className="flex h-16 items-center justify-center gap-[2px]">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-teal-400 to-cyan-300 dark:from-teal-500 dark:to-cyan-400"
          animate={{ height: Math.max(3, h * 64) }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function PulseRings({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-teal-400/40 dark:border-teal-500/30"
          initial={{ width: 80, height: 80, opacity: 0.6 }}
          animate={{ width: 160, height: 160, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

export default function FreeRecordPage() {
  const t = useTranslations('recording')
  const setAudioBlob = useSessionStore((s) => s.setAudioBlob)

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

  const handleComplete = useCallback(
    (blob: Blob) => { setAudioBlob(blob) },
    [setAudioBlob],
  )

  if (audioBlob && status === 'stopped') {
    handleComplete(audioBlob)
  }

  const isRecording = status === 'recording'
  const isPaused = status === 'paused'
  const isActive = isRecording || isPaused
  const minutes = Math.floor(elapsedSeconds / 60)
  const secs = elapsedSeconds % 60
  const timer = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f3460]">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-sm transition hover:bg-white/80 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Card */}
      <div className="relative w-[380px] rounded-3xl bg-white/70 px-10 py-12 shadow-xl backdrop-blur-md dark:bg-white/5 dark:shadow-2xl dark:shadow-black/30">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-teal-400/10 blur-3xl dark:bg-teal-500/10" />

        <div className="flex flex-col items-center gap-8">
          {/* Equalizer */}
          <Equalizer level={audioLevel} />

          {/* Timer */}
          <motion.div
            className="select-none"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isActive ? 1 : 0.4 }}
          >
            <span className="font-mono text-5xl font-extralight tracking-[0.15em] text-gray-800 tabular-nums dark:text-white/90">
              {timer}
            </span>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-5">
            {!isActive ? (
              <div className="relative flex items-center justify-center">
                <motion.button
                  onClick={startRecording}
                  className="relative z-10 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-400/30 dark:shadow-teal-500/20"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={t('startLabel')}
                >
                  <Mic className="size-8" />
                </motion.button>
              </div>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <PulseRings active={isRecording} />
                  <motion.button
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="relative z-10 flex size-14 items-center justify-center rounded-full border-2 border-teal-400/50 bg-white/80 text-gray-700 shadow-md backdrop-blur-sm dark:border-teal-500/40 dark:bg-white/10 dark:text-white"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={isPaused ? t('resume') : t('pause')}
                  >
                    {isPaused ? <Play className="size-5" /> : <Pause className="size-5" />}
                  </motion.button>
                </div>
                <motion.button
                  onClick={stopRecording}
                  className="flex size-14 items-center justify-center rounded-full bg-red-500 text-white shadow-md shadow-red-500/30"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={t('stop')}
                >
                  <Square className="size-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-400 dark:text-white/40">
            {isActive ? (isRecording ? 'Recording...' : 'Paused') : 'Tap to start recording'}
          </p>
        </div>
      </div>
    </div>
  )
}
