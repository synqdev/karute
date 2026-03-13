"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, FileText } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrg } from "@/components/providers/org-provider"

interface KaruteRow {
  id: string
  date: string
  staffName: string
  customerName: string | null
  aiSummary: string | null
  entryCount: number
  recordingSessionId: string | null
}

export default function KaruteListPage() {
  const t = useTranslations("karute")
  const { org } = useOrg()
  const [records, setRecords] = useState<KaruteRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/karute?orgId=${org.id}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        const rows: KaruteRow[] = (Array.isArray(data) ? data : []).map(
          (r: Record<string, unknown>) => ({
            id: r.id as string,
            date: (r.createdAt as string).slice(0, 10),
            staffName: (r.staff as Record<string, string>)?.name ?? "—",
            customerName: (r.customer as Record<string, string> | null)?.name ?? null,
            aiSummary: r.aiSummary as string | null,
            entryCount: (r._count as Record<string, number>)?.entries ?? 0,
            recordingSessionId: r.recordingSessionId as string | null,
          })
        )
        setRecords(rows)
      } catch (err) {
        console.error("Failed to load karute records:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [org.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button>
          <Plus className="size-4" />
          {t("new")}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("staff")}</TableHead>
              <TableHead>{t("aiSummary")}</TableHead>
              <TableHead className="text-right">{t("entryCount")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No karute records yet. Record a session and save it.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.staffName}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {record.aiSummary || "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {record.entryCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/karute/${record.recordingSessionId || record.id}`}>
                      <Button variant="ghost" size="xs">
                        <FileText className="size-3.5" />
                        {t("view")}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
