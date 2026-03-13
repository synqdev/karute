'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface CustomerNotesProps {
  phone: string
  email: string
  notes: string
  tags: string[]
}

export function CustomerNotes({ phone, email, notes: initialNotes, tags }: CustomerNotesProps) {
  const t = useTranslations('customers')
  const tCommon = useTranslations('common')
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(true)

  function handleNotesChange(value: string) {
    setNotes(value)
    setSaved(false)
  }

  function handleSave() {
    console.log('[CustomerNotes] Save:', notes)
    setSaved(true)
  }

  return (
    <div className="space-y-4">
      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('contactInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('phone')}</span>
            <span>{phone || '—'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('email')}</span>
            <span>{email || '—'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('tags')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
              {t('addTag')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('notes')}</CardTitle>
            {!saved && (
              <Button size="sm" onClick={handleSave}>{tCommon('save')}</Button>
            )}
            {saved && notes !== initialNotes && (
              <span className="text-xs text-green-600">{tCommon('saved')}</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t('notesPlaceholder')}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  )
}
