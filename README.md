# Good Kid Score App 🐰🥕
## 乖寶寶記分

A cute candy-themed app for parents to track their children's good behavior using carrots as points.

**All data lives in a private GitHub repo** as a single `data.json` file. There are no
accounts and no database — open the app and it is ready to use, on any device.

## How storage works

```
Browser  ──►  /api/data (server route)  ──►  GitHub Contents API  ──►  data.json
   ▲                                                                      │
   └──────────────────── loaded on start, cached in localStorage ◄────────┘
```

- The GitHub token stays on the server. It is never sent to the browser.
- Edits apply instantly in the UI, then sync to GitHub about a second later.
  The header shows a dot while a save is pending and a retry button if one fails.
- Every save is a normal git commit, so `data.json`'s history is a full audit trail
  and any bad change can be reverted from GitHub.
- Mutations are sent as small ops (insert / update / delete) which the server replays
  onto the newest version of the file. An edit made on a phone and one made on a
  laptop merge instead of overwriting each other.
- The last loaded copy is cached in `localStorage`, so the app still renders offline.
  Changes made offline are queued and flushed when the connection returns.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create the data repo
A **private** repo holding a single `data.json`. Keep it separate from this one, so
saving a score does not trigger a redeploy.

```bash
gh repo create good-kid-score-data --private
```

### 3. Create a GitHub token
Create a **fine-grained** personal access token at
<https://github.com/settings/personal-access-tokens/new>:

- **Repository access:** Only select repositories → your data repo
- **Permissions:** Repository permissions → **Contents** → **Read and write**

### 4. Configure environment
```bash
cp .env.local.example .env.local
```
```
GITHUB_TOKEN=github_pat_xxxxxxxx
GITHUB_DATA_REPO=your-username/good-kid-score-data
```

### 5. Run it
```bash
npm run dev
```
Open <http://localhost:3000>. The first save creates `data.json` if it is missing.

### 6. Deploy
Add the same variables in **Vercel → Project → Settings → Environment Variables**,
then redeploy. The phone and the laptop then read and write the same file.

> **The deployed URL has no login.** Anyone who has the link can view *and* edit.
> Set a 4-digit passcode on the dashboard to gate adding scores, and/or turn on
> Vercel's Password Protection (Settings → Deployment Protection) to gate the
> whole site.

## Migrating from Supabase

Earlier versions stored everything in Supabase. To bring that data across:

```bash
# put SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migrate
node scripts/migrate-from-supabase.mjs --dry-run   # writes migrated-data.json to inspect
node scripts/migrate-from-supabase.mjs             # publishes it to the data repo
```

The script header lists every option. It refuses to overwrite a `data.json` that
already has rows unless you pass `--force`. The old SQL schema is kept in
`supabase/migrations/` for reference only; nothing runs it any more.

## Backups

`data.json` is versioned by git, so history is automatic. For an off-GitHub copy:

```bash
gh api repos/<you>/good-kid-score-data/contents/data.json \
  --jq '.content' | tr -d '\n' | base64 -d > backup.json
```

## Features
- 🐰 Cute bunny characters for each child
- 🥕 Carrot-based point system
- 📅 Monthly score tracking
- 🎁 Customizable rewards and earning rules
- 🤝 Collaborative trades (several bunnies pooling carrots for one reward)
- 🔐 Optional 4-digit passcode on adding scores
- 📄 Export monthly PDF reports
- 📱 Mobile-friendly design

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- GitHub Contents API for storage
- html2canvas + jsPDF
- lucide-react
