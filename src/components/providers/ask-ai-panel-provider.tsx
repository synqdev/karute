'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface AskAiPanelContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AskAiPanelContext = createContext<AskAiPanelContextValue>({
  open: false,
  setOpen: () => {},
})

export function AskAiPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <AskAiPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </AskAiPanelContext.Provider>
  )
}

export function useAskAiPanel() {
  return useContext(AskAiPanelContext)
}
