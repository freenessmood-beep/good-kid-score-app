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
import { commitOps, getRepo, getToken, hasCredentials, readDoc, setRepo, setToken, verify } from './gh'
import type { DataDoc, Table } from './types'

const CACHE_KEY = 'bunny-adventure-doc-v1'
const DEBOUNCE_MS = 600
const MAX_RETRIES = 3

export type SyncState = 'loading' | 'idle' | 'saving' | 'pending' | 'error'

interface StoreValue {
  doc: DataDoc
  /** True until the first load settles. Cached data may already be visible. */
  loading: boolean
  /** No token stored in this browser yet, so the setup screen should show. */
  needsSetup: boolean
  loadError: string | null
  sync: SyncState
  syncError: string | null
  insert: (table: Table, row: Record<string, unknown>) => string
  insertMany: (table: Table, rows: Record<string, unknown>[]) => string[]
  update: (table: Table, id: string, patch: Record<string, unknown>) => void
  remove: (table: Table, id: string) => void
  removeWhere: (table: Table, field: string, value: string) => void
  /** Checks the credentials against GitHub, stores them, then loads. */
  connect: (token: string, repo: string) => Promise<void>
  disconnect: () => void
  repo: string
  reload: () => Promise<void>
  retry: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<DataDoc>(emptyDoc)
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sync, setSync] = useState<SyncState>('loading')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [repo, setRepoState] = useState('')

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
    if (!hasCredentials()) return

    const sending = queue.current
    queue.current = []
    inFlight.current = true
    setSync('saving')

    try {
      const saved = await commitOps(sending)
      failures.current = 0
      setSyncError(null)
      // Ops queued while the request was in flight are not in the saved copy yet.
      commit(applyOps(saved, queue.current))
      setSync(queue.current.length > 0 ? 'pending' : 'idle')
    } catch (err) {
      // Nothing is dropped: put the unsaved ops back at the head of the queue.
      queue.current = [...sending, ...queue.current]
      failures.current += 1
      setSyncError(err instanceof Error ? err.message : 'Could not reach GitHub.')
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
    if (!hasCredentials()) {
      setNeedsSetup(true)
      setLoading(false)
      setSync('idle')
      return
    }
    setNeedsSetup(false)
    try {
      const { doc: remote } = await readDoc()
      // Local edits that have not reached GitHub yet must survive a reload.
      commit(applyOps(remote, queue.current))
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
    setRepoState(getRepo())
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) setDoc(normalizeDoc(JSON.parse(cached)))
    } catch {
      // ignore an unreadable cache
    }
    load()
  }, [load])

  // Best effort: get pending edits out before a mobile browser freezes the tab.
  // A beacon cannot carry the Authorization header, so this is a normal flush.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flush])

  const connect = useCallback(
    async (token: string, nextRepo: string) => {
      await verify(token.trim(), nextRepo.trim())
      setToken(token)
      setRepo(nextRepo)
      setRepoState(nextRepo.trim())
      setNeedsSetup(false)
      setLoading(true)
      await load()
    },
    [load]
  )

  const disconnect = useCallback(() => {
    setToken('')
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // ignore
    }
    queue.current = []
    setDoc(emptyDoc())
    setNeedsSetup(true)
    setSync('idle')
    setSyncError(null)
    setLoadError(null)
  }, [])

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

  const retry = useCallback(() => {
    failures.current = 0
    if (queue.current.length > 0) flush()
    else load()
  }, [flush, load])

  return (
    <StoreContext.Provider
      value={{
        doc,
        loading,
        needsSetup,
        loadError,
        sync,
        syncError,
        insert,
        insertMany,
        update,
        remove,
        removeWhere,
        connect,
        disconnect,
        repo,
        reload: load,
        retry,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

/** Re-exported so callers do not need to reach into lib/gh directly. */
export { getToken, hasCredentials }
