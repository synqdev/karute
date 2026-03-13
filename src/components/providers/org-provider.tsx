'use client'

import { createContext, useContext, useState } from 'react'
import type { Organization, Staff } from '@/lib/types/org'

interface OrgContextValue {
  org: Organization
  staff: Staff
  allStaff: Staff[]
  switchStaff: (id: string) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

const MOCK_ORG: Organization = {
  id: '5842c10a-c58b-45ea-a820-104720de3f25',
  name: 'さくら整体院',
  plan: 'PRO',
}

const MOCK_ALL_STAFF: Staff[] = [
  { id: 'c9bb76b0-28c0-4002-83fb-5d7390c19eeb', name: 'Anthony', role: 'OWNER', initials: 'AL' },
  { id: 'adb5b48e-813c-44f6-96f6-2c1997773c2f', name: 'Jon', role: 'STYLIST', initials: 'JC' },
  { id: '01c50220-b653-43ee-842e-9fb06fe8677c', name: 'Liam', role: 'STYLIST', initials: 'LM' },
]

export function OrgProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeStaffId, setActiveStaffId] = useState(MOCK_ALL_STAFF[0].id)

  const staff = MOCK_ALL_STAFF.find((s) => s.id === activeStaffId) ?? MOCK_ALL_STAFF[0]

  return (
    <OrgContext.Provider
      value={{
        org: MOCK_ORG,
        staff,
        allStaff: MOCK_ALL_STAFF,
        switchStaff: setActiveStaffId,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
