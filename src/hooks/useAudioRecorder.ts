"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped"

export interface UseAudioRecorderReturn {
  status: RecorderStatus
  startRecording: () => Promise<void>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => void
  audioBlob: Blob | null
  elapsedSeconds: number
  audioLevel: number
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
  }, [])

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.fftSize)
    analyserRef.current.getByteTimeDomainData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      const val = (dataArray[i] - 128) / 128
      sum += val * val
    }
    const rms = Math.sqrt(sum / dataArray.length)
    const normalized = Math.min(1, rms * 3)
    setAudioLevel(normalized)

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setStatus("stopped")
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        setAudioLevel(0)
      }

      mediaRecorder.start(100)
      setStatus("recording")
      setAudioBlob(null)
      setElapsedSeconds(0)
      startTimer()
      updateAudioLevel()
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }, [startTimer, updateAudioLevel])

  const pauseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause()
      setStatus("paused")
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      setAudioLevel(0)
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume()
      setStatus("recording")
      startTimer()
      updateAudioLevel()
    }
  }, [startTimer, updateAudioLevel])

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    status,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    audioBlob,
    elapsedSeconds,
    audioLevel,
  }
}
