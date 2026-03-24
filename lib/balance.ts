import type { ScoreEntry, Trade } from './types'

export function getAvailableCarrots(childId: string, entries: ScoreEntry[], trades: Trade[]): number {
  const earned = entries.filter(e => e.child_id === childId).reduce((s, e) => s + e.points, 0)
  const spent = trades.filter(t => t.child_id === childId).reduce((s, t) => s + t.carrots_spent, 0)
  return earned - spent
}

export function getTotalEarned(childId: string, entries: ScoreEntry[]): number {
  return entries.filter(e => e.child_id === childId).reduce((s, e) => s + e.points, 0)
}
