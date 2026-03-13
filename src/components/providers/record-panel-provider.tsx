'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface RecordPanelContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const RecordPanelContext = createContext<RecordPanelContextValue>({
  open: false,
  setOpen: () => {},
})

export function RecordPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <RecordPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </RecordPanelContext.Provider>
  )
}

export function useRecordPanel() {
  return useContext(RecordPanelContext)
}
