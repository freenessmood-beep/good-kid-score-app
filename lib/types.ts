export type Role = 'owner' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar_color: string
  created_at: string
}

export interface Child {
  id: string
  name: string
  bunny_color: string
  public_id: string
  created_by: string
  created_at: string
}

export interface ScoreEntry {
  id: string
  child_id: string
  date: string
  points: number
  note?: string
  created_by: string
  created_at: string
}

export interface RewardItem {
  id: string
  carrot_threshold: number
  reward_description: string
  created_by: string
  created_at: string
}

export interface Invitation {
  id: string
  code: string
  created_by: string
  used: boolean
  used_by_email?: string
  created_at: string
}

export interface EarningRule {
  id: string
  carrots: number
  description: string
  created_by: string
  created_at: string
}

export interface Trade {
  id: string
  child_id: string
  reward_item_id?: string
  reward_description: string
  carrots_spent: number
  date: string
  note?: string
  created_by: string
  created_at: string
}
