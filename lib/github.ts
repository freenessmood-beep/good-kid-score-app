// Server-only GitHub storage. The token never leaves the server: the browser
// talks to /api/data, which talks to GitHub.
import { normalizeDoc } from './doc'
import type { DataDoc } from './types'

const API = 'https://api.github.com'

export interface GitHubConfig {
  token: string
  repo: string
  branch: string
  path: string
}

export function githubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_DATA_REPO
  if (!token || !repo) return null
  return {
    token,
    repo,
    branch: process.env.GITHUB_DATA_BRANCH || 'main',
    path: process.env.GITHUB_DATA_PATH || 'data.json',
  }
}

function headers(cfg: GitHubConfig) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

function contentsUrl(cfg: GitHubConfig) {
  return `${API}/repos/${cfg.repo}/contents/${encodeURIComponent(cfg.path)}`
}

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

/** sha is null when the file does not exist yet. */
export async function readDoc(cfg: GitHubConfig): Promise<{ doc: DataDoc; sha: string | null }> {
  const res = await fetch(`${contentsUrl(cfg)}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: headers(cfg),
    cache: 'no-store',
  })

  if (res.status === 404) return { doc: normalizeDoc(null), sha: null }
  if (!res.ok) throw new GitHubError(await describe(res), res.status)

  const json = (await res.json()) as { content?: string; sha: string; encoding?: string }
  if (!json.content) return { doc: normalizeDoc(null), sha: json.sha }

  const text = Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf8')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GitHubError(`${cfg.path} in ${cfg.repo} is not valid JSON`, 502)
  }
  return { doc: normalizeDoc(parsed), sha: json.sha }
}

/** Throws GitHubError(409) if sha is stale — the caller retries. */
export async function writeDoc(
  cfg: GitHubConfig,
  doc: DataDoc,
  sha: string | null,
  message: string
): Promise<string> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(JSON.stringify(doc, null, 2), 'utf8').toString('base64'),
    branch: cfg.branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(contentsUrl(cfg), {
    method: 'PUT',
    headers: headers(cfg),
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) throw new GitHubError(await describe(res), res.status)
  const json = (await res.json()) as { content: { sha: string } }
  return json.content.sha
}

async function describe(res: Response): Promise<string> {
  let detail = ''
  try {
    const j = (await res.json()) as { message?: string }
    detail = j.message ?? ''
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 401) return 'GitHub rejected the token (401). Check GITHUB_TOKEN.'
  if (res.status === 403) return `GitHub denied access (403). The token needs Contents: read & write. ${detail}`
  if (res.status === 404) return 'Repo or branch not found (404). Check GITHUB_DATA_REPO and GITHUB_DATA_BRANCH.'
  return `GitHub API ${res.status}: ${detail || res.statusText}`
}
