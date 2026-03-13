'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createCustomerSchema, type CreateCustomerInput } from '@/lib/validations/customer'

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function CustomerForm({ open, onOpenChange, onSaved }: CustomerFormProps) {
  const t = useTranslations('customerForm')
  const tCommon = useTranslations('common')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<CreateCustomerInput>({
    name: '',
    nameKana: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    if (!open) {
      setForm({ name: '', nameKana: '', phone: '', email: '', notes: '' })
      setErrors({})
    }
  }, [open])

  function updateField(field: keyof CreateCustomerInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = createCustomerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key) fieldErrors[String(key)] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      // TODO: replace with API call
      await new Promise((r) => setTimeout(r, 500))
      onOpenChange(false)
      onSaved?.()
    } catch {
      // TODO: surface error to user
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input
              id="name"
              placeholder={t('namePlaceholder')}
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameKana">{t('kanaLabel')}</Label>
            <Input
              id="nameKana"
              placeholder={t('kanaPlaceholder')}
              value={form.nameKana}
              onChange={(e) => updateField('nameKana', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('notesLabel')}</Label>
            <Textarea
              id="notes"
              placeholder={t('notesPlaceholder')}
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('saving') : tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
