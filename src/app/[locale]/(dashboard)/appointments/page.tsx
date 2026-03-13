'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Calendar } from 'lucide-react'

type AppointmentStatus = 'confirmed' | 'tentative' | 'cancelled'

interface Appointment {
  id: string
  dateTime: string
  customerName: string
  service: string
  staff: string
  status: AppointmentStatus
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    dateTime: '2026-03-11 10:00',
    customerName: '田中 美咲',
    service: 'カット + カラー',
    staff: '山田 太郎',
    status: 'confirmed',
  },
  {
    id: '2',
    dateTime: '2026-03-11 11:30',
    customerName: '佐藤 花子',
    service: 'トリートメント',
    staff: '鈴木 一郎',
    status: 'confirmed',
  },
  {
    id: '3',
    dateTime: '2026-03-11 13:00',
    customerName: '高橋 健太',
    service: 'カット',
    staff: '山田 太郎',
    status: 'tentative',
  },
  {
    id: '4',
    dateTime: '2026-03-11 14:30',
    customerName: '渡辺 由美',
    service: 'パーマ + カット',
    staff: '佐々木 恵',
    status: 'confirmed',
  },
  {
    id: '5',
    dateTime: '2026-03-12 10:00',
    customerName: '伊藤 翔',
    service: 'カラー',
    staff: '鈴木 一郎',
    status: 'cancelled',
  },
  {
    id: '6',
    dateTime: '2026-03-12 11:00',
    customerName: '中村 さくら',
    service: 'ヘッドスパ + トリートメント',
    staff: '佐々木 恵',
    status: 'tentative',
  },
]

function getStatusVariant(
  status: AppointmentStatus
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'confirmed':
      return 'default'
    case 'tentative':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
  }
}

function getStatusClassName(status: AppointmentStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500/15 text-green-700 dark:text-green-400'
    case 'tentative':
      return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
    case 'cancelled':
      return ''
  }
}

export default function AppointmentsPage() {
  const t = useTranslations('appointments')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('new')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dateTime')}</TableHead>
                <TableHead>{t('customerName')}</TableHead>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('staff')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_APPOINTMENTS.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {apt.dateTime}
                  </TableCell>
                  <TableCell>{apt.customerName}</TableCell>
                  <TableCell>{apt.service}</TableCell>
                  <TableCell>{apt.staff}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(apt.status)}
                      className={cn(getStatusClassName(apt.status))}
                    >
                      {t(apt.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
