'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { RecordPanel, RecordPanelBackdrop } from '@/components/layout/record-panel'
import { AskAiPanel, AskAiPanelBackdrop } from '@/components/layout/ask-ai-panel'
import { OrgProvider } from '@/components/providers/org-provider'
import { RecordPanelProvider } from '@/components/providers/record-panel-provider'
import { AskAiPanelProvider } from '@/components/providers/ask-ai-panel-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OrgProvider>
      <RecordPanelProvider>
        <AskAiPanelProvider>
          <div className="flex h-screen flex-col bg-[#e8e8e8] p-3 dark:bg-[#2a2a2a]">
            <div className="flex items-center justify-end px-4 py-1">
              <TopBar />
            </div>
            <div className="flex flex-1 gap-3 min-h-0">
              <div className="relative">
                <Sidebar />
                <RecordPanel />
                <AskAiPanel />
              </div>
              <main className="relative flex-1 overflow-y-auto rounded-[28px] bg-white dark:bg-[#3a3a3a]">
                <div className="mx-auto max-w-7xl p-6">{children}</div>
                <RecordPanelBackdrop />
                <AskAiPanelBackdrop />
              </main>
            </div>
          </div>
        </AskAiPanelProvider>
      </RecordPanelProvider>
    </OrgProvider>
  )
}
