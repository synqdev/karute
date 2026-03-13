export type StaffRole = 'OWNER' | 'ADMIN' | 'STYLIST' | 'ASSISTANT'

export type Organization = {
  id: string
  name: string
  plan: 'FREE' | 'PRO'
}

export type Staff = {
  id: string
  name: string
  role: StaffRole
  initials: string
  avatarUrl?: string
}
