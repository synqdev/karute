'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionStore } from '@/stores/session-store'
import { RecordingControls } from '@/components/recording'
import type { KaruteEntryData, EntryCategory } from '@/components/karute'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { exportKarutePDF, exportKaruteText } from '@/lib/export'
import { cn } from '@/lib/utils'
import {
  Loader2,
  CheckCircle2,
  FileText,
  FileDown,
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  X,
  Check,
  Sparkles,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Category config (self-contained for free tier)
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  SYMPTOM: { label: '症状', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  TREATMENT: { label: '施術', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  BODY_AREA: { label: '部位', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  PREFERENCE: { label: '希望', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  LIFESTYLE: { label: '生活習慣', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  NEXT_VISIT: { label: '次回予約', bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  PRODUCT: { label: '商品', bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  OTHER: { label: 'その他', bg: 'bg-gray-50 dark:bg-gray-950/30', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
}

function getCategoryLabel(category: string): string {
  return CATEGORY_CONFIG[category]?.label ?? category
}

// ---------------------------------------------------------------------------
// Inline entry card (self-contained for free tier)
// ---------------------------------------------------------------------------

function FreeEntryCard({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: KaruteEntryData
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.content)
  const config = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.OTHER

  const handleSave = () => {
    onUpdate(entry.id, draft)
    setEditing(false)
  }

  return (
    <div className={cn('rounded-lg border p-3', config.border)}>
      <div className="mb-2 flex items-center justify-between">
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', config.bg, config.text, config.border)}>
          {config.label}
        </span>
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button variant="ghost" size="icon" className="size-6" onClick={handleSave}>
                <Check className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => { setEditing(false); setDraft(entry.content) }}>
                <X className="size-3" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => setEditing(true)}>
                <Pencil className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6 text-destructive" onClick={() => onDelete(entry.id)}>
                <Trash2 className="size-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-12 text-sm" />
      ) : (
        <p className="text-sm">{entry.content}</p>
      )}
      {entry.originalQuote && !editing && (
        <p className="mt-1 text-xs text-muted-foreground italic">「{entry.originalQuote}」</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { key: 'record', label: '録音' },
  { key: 'transcribe', label: '文字起こし' },
  { key: 'classify', label: 'AI分類' },
  { key: 'review', label: '確認・編集' },
  { key: 'done', label: '完了' },
] as const

function stepIndex(
  step: ReturnType<typeof useSessionStore.getState>['step'],
): number {
  const map: Record<string, number> = {
    idle: 0,
    recording: 0,
    transcribing: 1,
    classifying: 2,
    review: 3,
    exported: 4,
  }
  return map[step] ?? 0
}

function StepIndicator({
  currentStep,
}: {
  currentStep: ReturnType<typeof useSessionStore.getState>['step']
}) {
  const current = stepIndex(currentStep)

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const isCompleted = i < current
          const isActive = i === current
          const isUpcoming = i > current

          return (
            <li
              key={s.key}
              className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isActive && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20',
                    isUpcoming && 'border-muted-foreground/30 bg-muted text-muted-foreground/50',
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="size-4" /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium transition-colors duration-300',
                    isCompleted && 'text-primary',
                    isActive && 'text-foreground',
                    isUpcoming && 'text-muted-foreground/50',
                  )}
                >
                  {s.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div className="mx-2 mt-[-20px] h-0.5 flex-1">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      i < current ? 'bg-primary' : 'bg-muted-foreground/20',
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Step: Record (idle / recording)
// ---------------------------------------------------------------------------

function RecordStep() {
  const customerName = useSessionStore((s) => s.customerName)
  const staffName = useSessionStore((s) => s.staffName)
  const setCustomerName = useSessionStore((s) => s.setCustomerName)
  const setStaffName = useSessionStore((s) => s.setStaffName)
  const setAudioBlob = useSessionStore((s) => s.setAudioBlob)

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      setAudioBlob(blob)
    },
    [setAudioBlob],
  )

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="customer-name" className="text-xs font-medium text-muted-foreground">
              お客様名（任意）
            </label>
            <Input
              id="customer-name"
              placeholder="例：田中 太郎"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="staff-name" className="text-xs font-medium text-muted-foreground">
              スタッフ名（任意）
            </label>
            <Input
              id="staff-name"
              placeholder="例：山田 花子"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center">
        <RecordingControls onRecordingComplete={handleRecordingComplete} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          録音ボタンを押して会話を開始してください
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step: Transcribing
// ---------------------------------------------------------------------------

function TranscribingStep() {
  const audioBlob = useSessionStore((s) => s.audioBlob)
  const setTranscription = useSessionStore((s) => s.setTranscription)
  const setError = useSessionStore((s) => s.setError)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!audioBlob || hasStarted.current) return
    hasStarted.current = true

    const transcribe = async () => {
      try {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        const res = await fetch('/api/transcriptions', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || '文字起こしに失敗しました')
        }

        const data = await res.json()
        setTranscription(data.segments)
      } catch (err) {
        setError(err instanceof Error ? err.message : '文字起こしに失敗しました')
      }
    }

    transcribe()
  }, [audioBlob, setTranscription, setError])

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <Loader2 className="size-12 animate-spin text-primary" />
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
      </div>
      <p className="mt-6 text-lg font-medium">文字起こし中...</p>
      <p className="mt-2 text-sm text-muted-foreground">録音データをテキストに変換しています</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step: Classifying
// ---------------------------------------------------------------------------

function ClassifyingStep() {
  const segments = useSessionStore((s) => s.segments)
  const setClassification = useSessionStore((s) => s.setClassification)
  const setError = useSessionStore((s) => s.setError)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!segments.length || hasStarted.current) return
    hasStarted.current = true

    const classify = async () => {
      try {
        const transcriptText = segments.map((s) => s.text).join('\n')

        const res = await fetch('/api/classifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcriptText }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'AI分類に失敗しました')
        }

        const data = await res.json()
        setClassification(data.entries, data.summary)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI分類に失敗しました')
      }
    }

    classify()
  }, [segments, setClassification, setError])

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <Loader2 className="size-12 animate-spin text-primary" />
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
      </div>
      <p className="mt-6 text-lg font-medium">AI分類中...</p>
      <p className="mt-2 text-sm text-muted-foreground">AIがカルテの項目を自動分類しています</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step: Review
// ---------------------------------------------------------------------------

function ReviewStep() {
  const entries = useSessionStore((s) => s.entries)
  const aiSummary = useSessionStore((s) => s.aiSummary)
  const customerName = useSessionStore((s) => s.customerName)
  const staffName = useSessionStore((s) => s.staffName)
  const date = useSessionStore((s) => s.date)
  const updateEntry = useSessionStore((s) => s.updateEntry)
  const deleteEntry = useSessionStore((s) => s.deleteEntry)
  const addEntry = useSessionStore((s) => s.addEntry)
  const setExported = useSessionStore((s) => s.setExported)
  const reset = useSessionStore((s) => s.reset)

  const handleAddEntry = useCallback(() => {
    addEntry({
      id: crypto.randomUUID(),
      category: 'OTHER' as EntryCategory,
      content: '',
      originalQuote: null,
      confidence: 1.0,
      tags: [],
      sortOrder: entries.length,
    })
  }, [addEntry, entries.length])

  const handleExportPDF = useCallback(() => {
    exportKarutePDF({
      customerName: customerName || '未設定',
      staffName: staffName || '未設定',
      date,
      aiSummary,
      entries: entries.map((e) => ({
        category: e.category,
        content: e.content,
        originalQuote: e.originalQuote ?? null,
      })),
    })
    setExported()
  }, [entries, aiSummary, customerName, staffName, date, setExported])

  const handleExportText = useCallback(() => {
    exportKaruteText({
      customerName: customerName || '未設定',
      staffName: staffName || '未設定',
      date,
      aiSummary,
      entries: entries.map((e) => ({
        category: e.category,
        content: e.content,
        originalQuote: e.originalQuote ?? null,
      })),
    })
    setExported()
  }, [entries, aiSummary, customerName, staffName, date, setExported])

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {aiSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent>
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="mb-1 text-xs font-medium text-primary">AIサマリー</p>
                <p className="text-sm leading-relaxed text-foreground/80">{aiSummary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">カルテエントリー ({entries.length})</h3>
          <Button variant="outline" size="sm" onClick={handleAddEntry}>
            <Plus className="size-3.5" />
            エントリー追加
          </Button>
        </div>

        {entries.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              エントリーがありません。「エントリー追加」ボタンで追加してください。
            </CardContent>
          </Card>
        )}

        {entries.map((entry) => (
          <FreeEntryCard
            key={entry.id}
            entry={entry}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="lg" onClick={reset}>
          <RotateCcw className="size-4" />
          新しい録音
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleExportText}>
            <FileText className="size-4" />
            テキスト出力
          </Button>
          <Button size="lg" onClick={handleExportPDF}>
            <FileDown className="size-4" />
            PDF出力
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step: Exported
// ---------------------------------------------------------------------------

function ExportedStep() {
  const reset = useSessionStore((s) => s.reset)

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">エクスポート完了</h2>
      <p className="mt-2 text-sm text-muted-foreground">カルテが正常に出力されました</p>
      <Button className="mt-8" size="lg" onClick={reset}>
        <RotateCcw className="size-4" />
        新しい録音を開始
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error display
// ---------------------------------------------------------------------------

function ErrorDisplay() {
  const error = useSessionStore((s) => s.error)
  const setError = useSessionStore((s) => s.setError)
  const reset = useSessionStore((s) => s.reset)

  if (!error) return null

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setError('')}>
            閉じる
          </Button>
          <Button variant="destructive" size="sm" onClick={reset}>
            最初からやり直す
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function FreeRecordPage() {
  const step = useSessionStore((s) => s.step)
  const error = useSessionStore((s) => s.error)

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">AIカルテ作成</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          録音して、AIが自動でカルテを作成します
        </p>
      </div>

      <StepIndicator currentStep={step} />

      {error && <ErrorDisplay />}

      {!error && (
        <>
          {(step === 'idle' || step === 'recording') && <RecordStep />}
          {step === 'transcribing' && <TranscribingStep />}
          {step === 'classifying' && <ClassifyingStep />}
          {step === 'review' && <ReviewStep />}
          {step === 'exported' && <ExportedStep />}
        </>
      )}
    </div>
  )
}
