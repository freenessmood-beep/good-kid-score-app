import type { DataDoc, Table } from './types'

export const DOC_VERSION = 1

export function emptyDoc(): DataDoc {
  return {
    version: DOC_VERSION,
    updated_at: new Date().toISOString(),
    children: [],
    score_entries: [],
    trades: [],
    reward_items: [],
    earning_rules: [],
    bug_reports: [],
  }
}

/** Fill in anything a hand-edited or older document is missing. */
export function normalizeDoc(raw: unknown): DataDoc {
  const base = emptyDoc()
  if (!raw || typeof raw !== 'object') return base
  const d = raw as Partial<DataDoc>
  return {
    ...base,
    ...d,
    children: d.children ?? [],
    score_entries: d.score_entries ?? [],
    trades: d.trades ?? [],
    reward_items: d.reward_items ?? [],
    earning_rules: d.earning_rules ?? [],
    bug_reports: d.bug_reports ?? [],
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

// Mutations travel as small ops rather than whole-document snapshots. The server
// replays them onto whatever is currently in GitHub, so an edit made on a phone
// and an edit made on a laptop merge instead of overwriting each other.
export type Op =
  | { type: 'insert'; table: Table; row: Record<string, unknown> }
  | { type: 'update'; table: Table; id: string; patch: Record<string, unknown> }
  | { type: 'delete'; table: Table; id: string }
  | { type: 'deleteWhere'; table: Table; field: string; value: string }

type Row = Record<string, unknown> & { id: string }

/** Apply one op to a document, returning a new document. Pure. */
export function applyOp(doc: DataDoc, op: Op): DataDoc {
  const next: DataDoc = { ...doc, updated_at: new Date().toISOString() }

  const rows = (doc[op.table] ?? []) as unknown as Row[]

  switch (op.type) {
    case 'insert': {
      const row = op.row as Row
      // Replaying the same op twice (a retried commit) must not duplicate a row.
      if (rows.some(r => r.id === row.id)) return next
      assign(next, op.table, [...rows, row])
      return next
    }
    case 'update':
      assign(next, op.table, rows.map(r => (r.id === op.id ? { ...r, ...op.patch } : r)))
      return next
    case 'delete':
      assign(next, op.table, rows.filter(r => r.id !== op.id))
      return next
    case 'deleteWhere':
      assign(next, op.table, rows.filter(r => r[op.field] !== op.value))
      return next
  }
}

export function applyOps(doc: DataDoc, ops: Op[]): DataDoc {
  return ops.reduce(applyOp, doc)
}

function assign(doc: DataDoc, table: Table, rows: Row[]) {
  // Each collection has its own row type; the op layer is deliberately untyped here.
  ;(doc as unknown as Record<Table, unknown>)[table] = rows
}

/** Cheap shape check so a corrupt fetch can't wipe the store. */
export function isOp(v: unknown): v is Op {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  const tables = ['children', 'score_entries', 'trades', 'reward_items', 'earning_rules', 'bug_reports']
  switch (o.type) {
    case 'insert':
      return tables.includes(o.table as string) && typeof o.row === 'object' && o.row !== null
        && typeof (o.row as Record<string, unknown>).id === 'string'
    case 'update':
      return tables.includes(o.table as string) && typeof o.id === 'string'
        && typeof o.patch === 'object' && o.patch !== null
    case 'delete':
      return tables.includes(o.table as string) && typeof o.id === 'string'
    case 'deleteWhere':
      return tables.includes(o.table as string) && typeof o.field === 'string' && typeof o.value === 'string'
    default:
      return false
  }
}
