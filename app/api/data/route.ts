import { NextResponse } from 'next/server'
import { applyOps, isOp, type Op } from '@/lib/doc'
import { GitHubError, githubConfig, readDoc, writeDoc } from '@/lib/github'

export const dynamic = 'force-dynamic'

const MISSING_CONFIG =
  'Storage is not configured. Set GITHUB_TOKEN and GITHUB_DATA_REPO (owner/repo) in .env.local, or in Vercel project settings.'

export async function GET() {
  const cfg = githubConfig()
  if (!cfg) return NextResponse.json({ error: MISSING_CONFIG }, { status: 503 })

  try {
    const { doc } = await readDoc(cfg)
    return NextResponse.json({ doc })
  } catch (err) {
    return fail(err)
  }
}

export async function POST(request: Request) {
  const cfg = githubConfig()
  if (!cfg) return NextResponse.json({ error: MISSING_CONFIG }, { status: 503 })

  let ops: Op[]
  try {
    const body = (await request.json()) as { ops?: unknown }
    if (!Array.isArray(body.ops) || body.ops.length === 0) {
      return NextResponse.json({ error: 'No ops supplied.' }, { status: 400 })
    }
    if (!body.ops.every(isOp)) {
      return NextResponse.json({ error: 'Malformed op in request.' }, { status: 400 })
    }
    ops = body.ops
  } catch {
    return NextResponse.json({ error: 'Request body is not valid JSON.' }, { status: 400 })
  }

  // Read-apply-write against the live file. A 409 means something else committed
  // in between, so re-read and replay the same ops onto the newer document.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const { doc, sha } = await readDoc(cfg)
      const updated = applyOps(doc, ops)
      await writeDoc(cfg, updated, sha, commitMessage(ops))
      return NextResponse.json({ doc: updated })
    } catch (err) {
      const conflict = err instanceof GitHubError && (err.status === 409 || err.status === 422)
      if (!conflict || attempt === 3) return fail(err)
      await new Promise(r => setTimeout(r, 150 * (attempt + 1)))
    }
  }

  return NextResponse.json({ error: 'Could not save after several attempts.' }, { status: 503 })
}

function commitMessage(ops: Op[]): string {
  const summary = ops
    .map(op => (op.type === 'settings' ? 'settings' : `${op.type} ${op.table}`))
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ')
  const count = ops.length === 1 ? '1 change' : `${ops.length} changes`
  return `Bunny Adventure: ${count} (${summary})`
}

function fail(err: unknown) {
  const status = err instanceof GitHubError ? err.status : 500
  const message = err instanceof Error ? err.message : 'Unknown storage error.'
  return NextResponse.json({ error: message }, { status: status >= 400 && status < 600 ? status : 500 })
}
