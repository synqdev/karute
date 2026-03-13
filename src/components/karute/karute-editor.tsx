"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Sparkles,
  Plus,
  FileText,
  FileDown,
  ArrowLeft,
  Save,
  Check,
} from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { EntryCard, type KaruteEntryData } from "./entry-card"
import { TranscriptPanel, type TranscriptSegment } from "./transcript-panel"
import {
  CategoryBadge,
  ALL_CATEGORIES,
  type EntryCategory,
} from "./category-badge"
import { useOrg } from "@/components/providers/org-provider"
import { cn } from "@/lib/utils"

interface KaruteEditorProps {
  karuteId: string
  customerName: string
  staffName: string
  date: string
  aiSummary?: string | null
  entries: KaruteEntryData[]
  segments: TranscriptSegment[]
}

export function KaruteEditor({
  karuteId,
  customerName,
  staffName,
  date,
  aiSummary,
  entries: initialEntries,
  segments,
}: KaruteEditorProps) {
  const { org, staff } = useOrg()
  const t = useTranslations("karute")
  const tCommon = useTranslations("common")

  const [entries, setEntries] = useState<KaruteEntryData[]>(initialEntries)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState<EntryCategory>("OTHER")
  const [newContent, setNewContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleUpdateEntry = (id: string, content: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, content } : e))
    )
    setSaved(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setSaved(false)
  }

  const handleAddEntry = () => {
    if (!newContent.trim()) return
    const entry: KaruteEntryData = {
      id: crypto.randomUUID(),
      category: newCategory,
      content: newContent.trim(),
      originalQuote: null,
      confidence: 1.0,
      tags: [],
      sortOrder: entries.length,
    }
    setEntries((prev) => [...prev, entry])
    setNewContent("")
    setNewCategory("OTHER")
    setShowAddForm(false)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/karute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: org.id,
          staffId: staff.id,
          recordingSessionId: karuteId,
          aiSummary,
          entries: entries.map((e) => ({
            category: e.category,
            content: e.content,
            originalQuote: e.originalQuote,
            confidence: e.confidence,
            tags: e.tags,
          })),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {customerName || staffName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {date}{customerName ? ` / ${t("staffLabel", { name: staffName })}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || saved}
            className={cn(
              saved && "bg-green-600 hover:bg-green-600"
            )}
          >
            {saved ? (
              <Check className="size-3.5" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saving ? t("saving") : saved ? t("saved") : tCommon("save")}
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="size-3.5" />
            {tCommon("pdf")}
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="size-3.5" />
            {tCommon("text")}
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <Card className="bg-muted/50">
          <CardContent>
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {t("aiSummary")}
                </p>
                <p className="text-sm leading-relaxed">{aiSummary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Left: Transcript */}
        <TranscriptPanel
          segments={segments}
          className="h-[calc(100vh-20rem)] w-full shrink-0 lg:w-80 xl:w-96"
        />

        {/* Right: Entries */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("entries", { count: entries.length })}
            </h2>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="size-3" />
              {t("addEntry")}
            </Button>
          </div>

          {/* Add Entry Form */}
          {showAddForm && (
            <div className="rounded-lg border border-dashed p-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs transition-all",
                      newCategory === cat
                        ? "ring-2 ring-ring ring-offset-1"
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <CategoryBadge category={cat} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={t("entryPlaceholder")}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-12 text-sm"
              />
              <div className="flex items-center gap-1">
                <Button size="xs" onClick={handleAddEntry}>
                  {tCommon("add")}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewContent("")
                  }}
                >
                  {tCommon("cancel")}
                </Button>
              </div>
            </div>
          )}

          {/* Entry list */}
          <div className="space-y-2">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onUpdate={handleUpdateEntry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>

          {entries.length === 0 && (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {t("emptyEntries")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
