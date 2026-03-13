'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Settings, Save, Check, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { useOrg } from '@/components/providers/org-provider'
import { cn } from '@/lib/utils'

interface SettingsState {
  // Profile
  organizationName: string
  businessType: string
  ownerName: string
  // AI Settings
  aiProvider: string
  aiModel: string
  recordingLanguage: string
  autoTranscribe: boolean
  autoClassify: boolean
  // Recording Settings
  audioQuality: string
  maxRecordingDuration: number
  // Notifications
  emailNotifications: boolean
  notificationEmail: string
}

const defaultSettings: SettingsState = {
  organizationName: '',
  businessType: '',
  ownerName: '',
  aiProvider: 'openai',
  aiModel: 'gpt-4o',
  recordingLanguage: 'ja',
  autoTranscribe: true,
  autoClassify: true,
  audioQuality: 'standard',
  maxRecordingDuration: 60,
  emailNotifications: false,
  notificationEmail: '',
}

function Toggle({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { org } = useOrg()
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Load settings from DB on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/settings?orgId=${org.id}`)
        if (!res.ok) return
        const data = await res.json()
        const stored = (data.settings || {}) as Partial<SettingsState>
        setSettings((prev) => ({
          ...prev,
          ...stored,
          organizationName: data.orgName || prev.organizationName,
        }))
      } catch {
        // use defaults
      } finally {
        setLoadingSettings(false)
      }
    }
    load()
  }, [org.id])

  const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const { organizationName, ...rest } = settings
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: org.id,
          orgName: organizationName,
          settings: rest,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }, [settings, org.id])

  const handleExportData = useCallback(() => {
    console.log('Exporting all data...')
  }, [])

  const handleDeleteAllData = useCallback(() => {
    console.log('Deleting all data...')
    setDeleteDialogOpen(false)
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-7 w-7 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || saved || loadingSettings}
          className={cn('gap-2', saved && 'bg-green-600 hover:bg-green-600')}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? t('saving') : saved ? t('saved') : tCommon('save')}
        </Button>
      </div>

      {/* 1. Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="organizationName" className="text-sm font-medium">
              {t('profile.orgName')}
            </label>
            <Input
              id="organizationName"
              placeholder={t('profile.orgNamePlaceholder')}
              value={settings.organizationName}
              onChange={(e) => updateSetting('organizationName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="businessType" className="text-sm font-medium">
              {t('profile.businessType')}
            </label>
            <Select
              value={settings.businessType}
              onValueChange={(value) => value && updateSetting('businessType', value)}
            >
              <SelectTrigger id="businessType">
                <SelectValue placeholder={t('profile.businessTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salon">{t('profile.salon')}</SelectItem>
                <SelectItem value="clinic">{t('profile.clinic')}</SelectItem>
                <SelectItem value="seitaiin">{t('profile.seitaiin')}</SelectItem>
                <SelectItem value="other">{t('profile.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerName" className="text-sm font-medium">
              {t('profile.ownerName')}
            </label>
            <Input
              id="ownerName"
              placeholder={t('profile.ownerNamePlaceholder')}
              value={settings.ownerName}
              onChange={(e) => updateSetting('ownerName', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ai.title')}</CardTitle>
          <CardDescription>{t('ai.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="aiProvider" className="text-sm font-medium">
              {t('ai.provider')}
            </label>
            <Select
              value={settings.aiProvider}
              onValueChange={(value) => value && updateSetting('aiProvider', value)}
            >
              <SelectTrigger id="aiProvider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="aiModel" className="text-sm font-medium">
              {t('ai.model')}
            </label>
            <Select
              value={settings.aiModel}
              onValueChange={(value) => value && updateSetting('aiModel', value)}
            >
              <SelectTrigger id="aiModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="recordingLanguage" className="text-sm font-medium">
              {t('ai.recordingLanguage')}
            </label>
            <Select
              value={settings.recordingLanguage}
              onValueChange={(value) => value && updateSetting('recordingLanguage', value)}
            >
              <SelectTrigger id="recordingLanguage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">{t('ai.japanese')}</SelectItem>
                <SelectItem value="en">{t('ai.english')}</SelectItem>
                <SelectItem value="auto">{t('ai.autoDetect')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="autoTranscribe" className="text-sm font-medium">
                {t('ai.autoTranscribe')}
              </label>
              <p className="text-sm text-muted-foreground">
                {t('ai.autoTranscribeDesc')}
              </p>
            </div>
            <Toggle
              id="autoTranscribe"
              checked={settings.autoTranscribe}
              onCheckedChange={(checked) => updateSetting('autoTranscribe', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="autoClassify" className="text-sm font-medium">
                {t('ai.autoClassify')}
              </label>
              <p className="text-sm text-muted-foreground">
                {t('ai.autoClassifyDesc')}
              </p>
            </div>
            <Toggle
              id="autoClassify"
              checked={settings.autoClassify}
              onCheckedChange={(checked) => updateSetting('autoClassify', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Recording Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recordingSettings.title')}</CardTitle>
          <CardDescription>{t('recordingSettings.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="audioQuality" className="text-sm font-medium">
              {t('recordingSettings.audioQuality')}
            </label>
            <Select
              value={settings.audioQuality}
              onValueChange={(value) => value && updateSetting('audioQuality', value)}
            >
              <SelectTrigger id="audioQuality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('recordingSettings.standard')}</SelectItem>
                <SelectItem value="high">{t('recordingSettings.high')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="maxRecordingDuration" className="text-sm font-medium">
              {t('recordingSettings.maxDuration')}
            </label>
            <Input
              id="maxRecordingDuration"
              type="number"
              min={1}
              max={180}
              value={settings.maxRecordingDuration}
              onChange={(e) =>
                updateSetting('maxRecordingDuration', parseInt(e.target.value, 10) || 60)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.title')}</CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="emailNotifications" className="text-sm font-medium">
                {t('notifications.emailNotifications')}
              </label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.emailNotificationsDesc')}
              </p>
            </div>
            <Toggle
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          {settings.emailNotifications && (
            <div className="space-y-2">
              <label htmlFor="notificationEmail" className="text-sm font-medium">
                {t('notifications.notificationEmail')}
              </label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="example@email.com"
                value={settings.notificationEmail}
                onChange={(e) => updateSetting('notificationEmail', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('data.title')}</CardTitle>
          <CardDescription>{t('data.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{t('data.exportLabel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('data.exportDesc')}
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              {tCommon('export')}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-destructive">{t('data.deleteLabel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('data.deleteDesc')}
              </p>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger render={<Button variant="destructive" />}>
                {t('data.deleteAll')}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('data.deleteConfirmTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('data.deleteConfirmDesc')}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    {tCommon('cancel')}
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteAllData}>
                    {tCommon('delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
