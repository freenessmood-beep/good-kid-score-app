#!/usr/bin/env node
/**
 * One-time migration: Supabase -> the GitHub-hosted data.json.
 *
 * Usage:
 *   node scripts/migrate-from-supabase.mjs [--dry-run] [--force] [--owner <uuid>]
 *
 * Reads configuration from the environment (or .env.local / .env.migrate):
 *   SUPABASE_URL                  e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     preferred - bypasses row level security
 *     ...or, to sign in as yourself instead of using the service key:
 *   SUPABASE_ANON_KEY, SUPABASE_EMAIL, SUPABASE_PASSWORD
 *
 *   GITHUB_TOKEN                  needs Contents: read & write on the data repo
 *   GITHUB_DATA_REPO              owner/repo holding data.json
 *   GITHUB_DATA_BRANCH            optional, default main
 *   GITHUB_DATA_PATH              optional, default data.json
 *
 * --dry-run writes ./migrated-data.json locally and does not touch GitHub.
 * --force overwrites a data.json that already has rows in it.
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')
const OWNER = args[args.indexOf('--owner') + 1] && args.includes('--owner')
  ? args[args.indexOf('--owner') + 1]
  : null

loadEnvFiles(['.env.migrate', '.env.local'])

// Resolved in main() so a missing value prints a clean message, not a stack trace.
let SUPABASE_URL = ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const TABLES = ['children', 'score_entries', 'trades', 'reward_items', 'earning_rules']

main().catch(err => {
  console.error('\n✖ ' + (err instanceof Error ? err.message : String(err)))
  process.exit(1)
})

async function main() {
  SUPABASE_URL = trimSlash(
    need('SUPABASE_URL', process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  )
  const { apiKey, accessToken } = await resolveAuth()

  console.log('Reading from ' + SUPABASE_URL)
  const fetched = {}
  for (const table of TABLES) {
    fetched[table] = await selectAll(table, apiKey, accessToken)
    console.log('  ' + table.padEnd(14) + fetched[table].length + ' rows')
  }

  // The old schema kept the passcode and daily cap on the users row.
  let users = []
  try {
    users = await selectAll('users', apiKey, accessToken)
    console.log('  ' + 'users'.padEnd(14) + users.length + ' rows')
  } catch (err) {
    console.log('  users         (skipped: ' + short(err) + ')')
  }

  const doc = buildDoc(fetched, users)
  const counts = TABLES.map(t => t + '=' + doc[t].length).join(' ')
  console.log('\nBuilt document: ' + counts)
  console.log('Settings: ' + JSON.stringify(doc.settings))

  if (doc.children.length === 0 && doc.score_entries.length === 0) {
    console.warn('\n⚠ Nothing was read from Supabase. Not writing an empty document.')
    console.warn('  If row level security blocked the read, supply SUPABASE_SERVICE_ROLE_KEY.')
    process.exit(1)
  }

  if (DRY_RUN) {
    const out = path.resolve('migrated-data.json')
    fs.writeFileSync(out, JSON.stringify(doc, null, 2) + '\n')
    console.log('\n✔ Dry run. Wrote ' + out)
    console.log('  Review it, then re-run without --dry-run to publish to GitHub.')
    return
  }

  await publish(doc)
}

// ---------- Supabase ----------

async function resolveAuth() {
  if (SERVICE_KEY) {
    console.log('Auth: service role key')
    return { apiKey: SERVICE_KEY, accessToken: SERVICE_KEY }
  }

  const email = process.env.SUPABASE_EMAIL
  const password = process.env.SUPABASE_PASSWORD
  if (!ANON_KEY) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ANON_KEY plus SUPABASE_EMAIL and SUPABASE_PASSWORD.')
  }
  if (!email || !password) {
    console.log('Auth: anonymous (row level security will likely return 0 rows)')
    return { apiKey: ANON_KEY, accessToken: ANON_KEY }
  }

  console.log('Auth: signing in as ' + email)
  const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.access_token) {
    throw new Error('Supabase sign-in failed: ' + (json.error_description || json.msg || res.status))
  }
  return { apiKey: ANON_KEY, accessToken: json.access_token }
}

async function selectAll(table, apiKey, accessToken) {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?select=*', {
      headers: {
        apikey: apiKey,
        Authorization: 'Bearer ' + accessToken,
        Range: from + '-' + (from + pageSize - 1),
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error('GET ' + table + ' -> ' + res.status + ' ' + body.slice(0, 200))
    }
    const page = await res.json()
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

// ---------- Document ----------

function buildDoc(fetched, users) {
  const owned = row => !OWNER || row.created_by === OWNER

  const children = fetched.children.filter(owned).map(c => ({
    id: c.id,
    name: c.name,
    bunny_color: c.bunny_color,
    public_id: c.public_id || makePublicId(c.name),
    created_by: c.created_by,
    created_at: c.created_at,
  }))

  // Keep only rows belonging to the bunnies we migrated.
  const childIds = new Set(children.map(c => c.id))

  const score_entries = fetched.score_entries
    .filter(e => childIds.has(e.child_id))
    .map(e => ({
      id: e.id,
      child_id: e.child_id,
      date: e.date,
      points: e.points,
      note: e.note ?? null,
      created_by: e.created_by,
      created_at: e.created_at,
    }))

  const trades = fetched.trades
    .filter(t => childIds.has(t.child_id))
    .map(t => ({
      id: t.id,
      child_id: t.child_id,
      reward_item_id: t.reward_item_id ?? null,
      reward_description: t.reward_description,
      carrots_spent: t.carrots_spent,
      date: t.date,
      note: t.note ?? null,
      created_by: t.created_by,
      created_at: t.created_at,
      collab_group_id: t.collab_group_id ?? null,
    }))

  const reward_items = fetched.reward_items.filter(owned).map(r => ({
    id: r.id,
    carrot_threshold: r.carrot_threshold,
    reward_description: r.reward_description,
    created_by: r.created_by,
    created_at: r.created_at,
  }))

  const earning_rules = fetched.earning_rules.filter(owned).map(r => ({
    id: r.id,
    carrots: r.carrots,
    description: r.description,
    created_by: r.created_by,
    created_at: r.created_at,
  }))

  return {
    version: 1,
    updated_at: new Date().toISOString(),
    children,
    score_entries,
    trades,
    reward_items,
    earning_rules,
    bug_reports: [],
    settings: pickSettings(users, children),
  }
}

/** The passcode and cap used to live on the owning user's row. */
function pickSettings(users, children) {
  const ownerIds = new Set(children.map(c => c.created_by).filter(Boolean))
  const candidates = [
    ...(OWNER ? users.filter(u => u.id === OWNER) : []),
    ...users.filter(u => ownerIds.has(u.id) && !u.main_admin_id),
    ...users.filter(u => ownerIds.has(u.id)),
    ...users.filter(u => u.role === 'owner' && !u.main_admin_id),
  ]
  const source =
    candidates.find(u => u.passcode || u.max_carrots_cap != null) ?? candidates[0] ?? null

  return {
    passcode: source?.passcode ?? null,
    max_carrots_cap: source?.max_carrots_cap ?? null,
  }
}

function makePublicId(name) {
  const base = String(name || '').replace(/[^a-zA-Z0-9]/g, '') || 'bunny'
  return base + String(Math.floor(1000 + Math.random() * 9000))
}

// ---------- GitHub ----------

async function publish(doc) {
  const token = need('GITHUB_TOKEN', process.env.GITHUB_TOKEN)
  const repo = need('GITHUB_DATA_REPO', process.env.GITHUB_DATA_REPO)
  const branch = process.env.GITHUB_DATA_BRANCH || 'main'
  const filePath = process.env.GITHUB_DATA_PATH || 'data.json'

  const url = 'https://api.github.com/repos/' + repo + '/contents/' + encodeURIComponent(filePath)
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }

  console.log('\nWriting to ' + repo + '/' + filePath + ' (' + branch + ')')

  let sha = null
  const existing = await fetch(url + '?ref=' + encodeURIComponent(branch), { headers })
  if (existing.ok) {
    const json = await existing.json()
    sha = json.sha
    const current = JSON.parse(Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf8'))
    const rows =
      (current.children?.length ?? 0) +
      (current.score_entries?.length ?? 0) +
      (current.trades?.length ?? 0)
    if (rows > 0 && !FORCE) {
      throw new Error(
        filePath + ' already holds ' + rows + ' rows. Re-run with --force to overwrite it, ' +
        'or use --dry-run to inspect the migration first.'
      )
    }
  } else if (existing.status !== 404) {
    throw new Error('Could not read ' + filePath + ': ' + existing.status)
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Migrate data from Supabase',
      content: Buffer.from(JSON.stringify(doc, null, 2) + '\n', 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error('GitHub write failed: ' + res.status + ' ' + body.slice(0, 300))
  }
  const json = await res.json()
  console.log('✔ Migrated. Commit ' + json.commit.sha.slice(0, 8))
}

// ---------- helpers ----------

function loadEnvFiles(files) {
  for (const file of files) {
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (!m) continue
      const value = m[2].replace(/^['"]|['"]$/g, '')
      if (!(m[1] in process.env)) process.env[m[1]] = value
    }
  }
}

function need(name, value) {
  if (!value) throw new Error('Missing ' + name + '. See the header of this script.')
  return value
}

function trimSlash(s) {
  return s.replace(/\/+$/, '')
}

function short(err) {
  return (err instanceof Error ? err.message : String(err)).slice(0, 80)
}
