'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { applyOps, emptyDoc, newId, normalizeDoc, type Op } from './doc'
import type { DataDoc, Settings, Table } from './types'

const CACHE_KEY = 'bunny-adventure-doc-v1'
const DEBOUNCE_MS = 800
const MAX_RETRIES = 3

export type SyncState = 'loading' | 'idle' | 'saving' | 'pending' | 'error'

interface StoreValue {
  doc: DataDoc
  /** True until the first load settles. Cached data may already be visible. */
  loading: boolean
  /** Set when the initial load failed outright. */
  loadError: string | null
  sync: SyncState
  syncError: string | null
  insert: (table: Table, row: Record<string, unknown>) => string
  insertMany: (table: Table, rows: Record<string, unknown>[]) => string[]
  update: (table: Table, id: string, patch: Record<string, unknown>) => void
  remove: (table: Table, id: string) => void
  removeWhere: (table: Table, field: string, value: string) => void
  saveSettings: (patch: Partial<Settings>) => void
  reload: () => Promise<void>
  retry: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

/** Convenience: the settings object on its own. */
export function useSettings(): Settings {
  return useStore().doc.settings
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<DataDoc>(emptyDoc)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sync, setSync] = useState<SyncState>('loading')
  const [syncError, setSyncError] = useState<string | null>(null)

  const queue = useRef<Op[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef(false)
  const failures = useRef(0)

  const cache = useCallback((next: DataDoc) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(next))
    } catch {
      // Private mode or a full quota: the cache is only an optimisation.
    }
  }, [])

  const commit = useCallback(
    (next: DataDoc) => {
      setDoc(next)
      cache(next)
    },
    [cache]
  )

  const flush = useCallback(async () => {
    if (inFlight.current || queue.current.length === 0) return

    const sending = queue.current
    queue.current = []
    inFlight.current = true
    setSync('saving')

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops: sending }),
      })
      const json = (await res.json().catch(() => ({}))) as { doc?: unknown; error?: string }
      if (!res.ok) throw new Error(json.error || 'Save failed (' + res.status + ')')

      failures.current = 0
      setSyncError(null)
      // Ops queued while this request was in flight are not in the server copy yet.
      commit(applyOps(normalizeDoc(json.doc), queue.current))
      setSync(queue.current.length > 0 ? 'pending' : 'idle')
    } catch (err) {
      // Nothing is dropped: put the unsaved ops back at the head of the queue.
      queue.current = [...sending, ...queue.current]
      failures.current += 1
      setSyncError(err instanceof Error ? err.message : 'Could not reach storage.')
      setSync('error')
    } finally {
      inFlight.current = false
    }

    if (queue.current.length > 0 && failures.current <= MAX_RETRIES) {
      timer.current = setTimeout(flush, DEBOUNCE_MS * Math.pow(2, failures.current))
    }
  }, [commit])

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(flush, DEBOUNCE_MS)
  }, [flush])

  const enqueue = useCallback(
    (ops: Op[]) => {
      queue.current = [...queue.current, ...ops]
      failures.current = 0
      setDoc(prev => {
        const next = applyOps(prev, ops)
        cache(next)
        return next
      })
      setSync('pending')
      schedule()
    },
    [cache, schedule]
  )

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' })
      const json = (await res.json().catch(() => ({}))) as { doc?: unknown; error?: string }
      if (!res.ok) throw new Error(json.error || 'Load failed (' + res.status + ')')
      // Local edits that have not reached GitHub yet must survive a reload.
      commit(applyOps(normalizeDoc(json.doc), queue.current))
      setLoadError(null)
      setSync(queue.current.length > 0 ? 'pending' : 'idle')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load data.'
      setLoadError(message)
      setSyncError(message)
      setSync('error')
    } finally {
      setLoading(false)
    }
  }, [commit])

  // Paint from cache first so the app is usable immediately, and offline.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) setDoc(normalizeDoc(JSON.parse(cached)))
    } catch {
      // ignore an unreadable cache
    }
    load()
  }, [load])

  // Best effort: get pending edits out before a mobile browser freezes the tab.
  useEffect(() => {
    const handler = () => {
      if (queue.current.length === 0 || inFlight.current) return
      const body = new Blob([JSON.stringify({ ops: queue.current })], { type: 'application/json' })
      if (navigator.sendBeacon && navigator.sendBeacon('/api/data', body)) queue.current = []
      else flush()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') handler()
    }
    window.addEventListener('pagehide', handler)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', handler)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [flush])

  const insert = useCallback(
    (table: Table, row: Record<string, unknown>) => {
      const id = (row.id as string) || newId()
      enqueue([
        { type: 'insert', table, row: { created_at: new Date().toISOString(), ...row, id } },
      ])
      return id
    },
    [enqueue]
  )

  const insertMany = useCallback(
    (table: Table, rows: Record<string, unknown>[]) => {
      const created_at = new Date().toISOString()
      const prepared = rows.map(row => ({ created_at, ...row, id: (row.id as string) || newId() }))
      enqueue(prepared.map(row => ({ type: 'insert' as const, table, row })))
      return prepared.map(row => row.id as string)
    },
    [enqueue]
  )

  const update = useCallback(
    (table: Table, id: string, patch: Record<string, unknown>) =>
      enqueue([{ type: 'update', table, id, patch }]),
    [enqueue]
  )

  const remove = useCallback(
    (table: Table, id: string) => enqueue([{ type: 'delete', table, id }]),
    [enqueue]
  )

  const removeWhere = useCallback(
    (table: Table, field: string, value: string) =>
      enqueue([{ type: 'deleteWhere', table, field, value }]),
    [enqueue]
  )

  const saveSettings = useCallback(
    (patch: Partial<Settings>) =>
      enqueue([{ type: 'settings', patch: patch as Record<string, unknown> }]),
    [enqueue]
  )

  const retry = useCallback(() => {
    failures.current = 0
    flush()
  }, [flush])

  return (
    <StoreContext.Provider
      value={{
        doc,
        loading,
        loadError,
        sync,
        syncError,
        insert,
        insertMany,
        update,
        remove,
        removeWhere,
        saveSettings,
        reload: load,
        retry,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
