// Row shapes stored in the GitHub-hosted data.json document.
// `created_by` is kept on rows only so data migrated out of Supabase round-trips
// cleanly; there are no accounts any more, so nothing reads it for access control.

export interface Child {
  id: string
  name: string
  bunny_color: string
  public_id: string
  created_by?: string
  created_at: string
}

export interface ScoreEntry {
  id: string
  child_id: string
  date: string
  points: number
  note?: string | null
  created_by?: string
  created_at: string
}

export interface RewardItem {
  id: string
  carrot_threshold: number
  reward_description: string
  created_by?: string
  created_at: string
}

export interface EarningRule {
  id: string
  carrots: number
  description: string
  created_by?: string
  created_at: string
}

export interface Trade {
  id: string
  child_id: string
  reward_item_id?: string | null
  reward_description: string
  carrots_spent: number
  date: string
  note?: string | null
  created_by?: string
  created_at: string
  collab_group_id?: string | null
}

export interface BugReport {
  id: string
  title: string
  description?: string | null
  created_at: string
}

/** The whole database: one JSON document in a private GitHub repo. */
export interface DataDoc {
  version: number
  updated_at: string
  children: Child[]
  score_entries: ScoreEntry[]
  trades: Trade[]
  reward_items: RewardItem[]
  earning_rules: EarningRule[]
  bug_reports: BugReport[]
}

/** Collections that ops can target. */
export type Table =
  | 'children'
  | 'score_entries'
  | 'trades'
  | 'reward_items'
  | 'earning_rules'
  | 'bug_reports'
