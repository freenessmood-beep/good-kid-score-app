'use client'

// Browser-side GitHub storage. There is no server in a GitHub Pages deployment,
// so the token is supplied by the person using the app and kept in this browser
// only - never in the bundle, never in a repo.

import { applyOps, normalizeDoc, type Op } from './doc'
import type { DataDoc } from './types'

const API = 'https://api.github.com'
const TOKEN_KEY = 'bunny-adventure-github-token'
const REPO_KEY = 'bunny-adventure-github-repo'

const DEFAULT_REPO = process.env.NEXT_PUBLIC_GITHUB_DATA_REPO || ''
const BRANCH = 'main'
const PATH = 'data.json'

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

// ---------- credentials ----------

export function getToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token.trim())
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked; the app will ask again next visit.
  }
}

export function getRepo(): string {
  try {
    return localStorage.getItem(REPO_KEY) || DEFAULT_REPO
  } catch {
    return DEFAULT_REPO
  }
}

export function setRepo(repo: string) {
  try {
    if (repo && repo !== DEFAULT_REPO) localStorage.setItem(REPO_KEY, repo.trim())
    else localStorage.removeItem(REPO_KEY)
  } catch {
    // ignore
  }
}

export function hasCredentials(): boolean {
  return Boolean(getToken() && getRepo())
}

/** Confirms a token can actually read the data file, for the setup screen. */
export async function verify(token: string, repo: string): Promise<void> {
  const res = await fetch(contentsUrl(repo) + '?ref=' + BRANCH, { headers: headers(token) })
  // 404 is fine: the repo is reachable and data.json simply is not there yet.
  if (res.ok || res.status === 404) return
  throw new GitHubError(await describe(res, repo), res.status)
}

// ---------- reads and writes ----------

export async function readDoc(): Promise<{ doc: DataDoc; sha: string | null }> {
  const token = getToken()
  const repo = getRepo()
  const res = await fetch(contentsUrl(repo) + '?ref=' + BRANCH, {
    headers: headers(token),
    cache: 'no-store',
  })

  if (res.status === 404) return { doc: normalizeDoc(null), sha: null }
  if (!res.ok) throw new GitHubError(await describe(res, repo), res.status)

  const json = (await res.json()) as { content?: string; sha: string }
  if (!json.content) return { doc: normalizeDoc(null), sha: json.sha }

  let parsed: unknown
  try {
    parsed = JSON.parse(decodeBase64(json.content))
  } catch {
    throw new GitHubError(PATH + ' in ' + repo + ' is not valid JSON.', 502)
  }
  return { doc: normalizeDoc(parsed), sha: json.sha }
}

/**
 * Read-apply-write against the live file. A conflict means another device
 * committed in between, so re-read and replay the same ops onto the newer
 * document rather than overwriting it.
 */
export async function commitOps(ops: Op[]): Promise<DataDoc> {
  let lastError: unknown = null

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const { doc, sha } = await readDoc()
      const updated = applyOps(doc, ops)
      await writeDoc(updated, sha, commitMessage(ops))
      return updated
    } catch (err) {
      const conflict = err instanceof GitHubError && (err.status === 409 || err.status === 422)
      if (!conflict) throw err
      lastError = err
      await new Promise(r => setTimeout(r, 150 * (attempt + 1)))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Could not save after several attempts.')
}

async function writeDoc(doc: DataDoc, sha: string | null, message: string): Promise<void> {
  const token = getToken()
  const repo = getRepo()
  const body: Record<string, unknown> = {
    message,
    content: encodeBase64(JSON.stringify(doc, null, 2) + '\n'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha

  const res = await fetch(contentsUrl(repo), {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new GitHubError(await describe(res, repo), res.status)
}

// ---------- helpers ----------

function contentsUrl(repo: string) {
  return API + '/repos/' + repo + '/contents/' + PATH
}

function headers(token: string) {
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

function commitMessage(ops: Op[]): string {
  const summary = ops
    .map(op => (op.type === 'settings' ? 'settings' : op.type + ' ' + op.table))
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ')
  const count = ops.length === 1 ? '1 change' : ops.length + ' changes'
  return 'Bunny Adventure: ' + count + ' (' + summary + ')'
}

// btoa/atob are byte-oriented, so round-trip UTF-8 explicitly - names and notes
// are often Chinese.
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function describe(res: Response, repo: string): Promise<string> {
  let detail = ''
  try {
    const j = (await res.json()) as { message?: string }
    detail = j.message ?? ''
  } catch {
    /* non-JSON body */
  }
  if (res.status === 401) return 'GitHub rejected the token. It may be expired or mistyped.'
  if (res.status === 403) {
    return 'GitHub denied access. The token needs Contents: Read and write on ' + repo + '. ' + detail
  }
  if (res.status === 404) {
    return 'Could not find ' + repo + '. Check the name, and that the token can see that repo.'
  }
  return 'GitHub API ' + res.status + (detail ? ': ' + detail : '')
}
