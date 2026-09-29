# Good Kid Score App 🐰🥕
## 乖寶寶記分

A cute candy-themed app for parents to track their children's good behavior using carrots as points.

Everything runs on GitHub: the site is a static build on **GitHub Pages**, and all
data lives as a single `data.json` in a **separate private repo**. No server, no
database, no accounts, no hosting bill.

## How storage works

```
Browser ──► api.github.com ──► data.json  (private repo)
   │
   └─ token entered once per device, kept in that browser's localStorage
```

- **The token is never in the build.** A Pages site is publicly readable, so
  anything compiled in would be public. Instead the app asks for a token on first
  visit and keeps it in that browser only. You do this once per device.
- A consequence worth knowing: the site URL shows **nothing** to anyone without a
  token. That is stricter than a hosted version with no login.
- Edits apply instantly, then sync to GitHub after ~0.6s. The header shows a dot
  while a save is pending and a retry button if one fails.
- Every save is a normal git commit, so `data.json`'s history is a full audit
  trail and any bad change can be reverted from GitHub.
- Mutations are sent as small ops (insert / update / delete) replayed onto the
  newest version of the file, so an edit on a phone and one on a laptop merge
  instead of overwriting each other.
- The last load is cached in `localStorage`, so the app still renders offline and
  queues changes until the connection returns.

## Setup

### 1. The data repo
A **private** repo holding a single `data.json`, separate from this one:

```bash
gh repo create good-kid-score-data --private
```

If its name is not `good-kid-score-data`, set `NEXT_PUBLIC_GITHUB_DATA_REPO` in
`next.config.js` — or just type the right name on the app's setup screen.

### 2. Turn on Pages
**Settings → Pages → Build and deployment → Source: GitHub Actions.**

Pages requires a public repo unless you are on a paid plan. Publishing this repo
is safe — it holds no secrets — and your children's data stays in the private
data repo.

### 3. Push
`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
The site lands at `https://<your-username>.github.io/good-kid-score-app/`.

### 4. Open it and connect
On each device you use, the app shows a setup screen. Create a **fine-grained**
token at <https://github.com/settings/personal-access-tokens/new>:

- **Repository access:** Only select repositories → your data repo
- **Permissions:** Repository permissions → **Contents** → **Read and write**

Paste it in. That device is then set up for good.

> If you set an expiry on the token, the app stops saving when it lapses and the
> setup screen returns. Choose the lifetime deliberately.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and connect with a token the same way. No `.env`
file is needed — nothing secret is involved at build time.

To check a production build the way Pages serves it:

```bash
GITHUB_PAGES=true npm run build   # writes ./out with the /good-kid-score-app prefix
```

## Migrating from Supabase

Earlier versions stored everything in Supabase. To bring that data across:

```bash
# put SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migrate,
# plus GITHUB_TOKEN and GITHUB_DATA_REPO
node scripts/migrate-from-supabase.mjs --dry-run   # writes migrated-data.json to inspect
node scripts/migrate-from-supabase.mjs             # publishes it to the data repo
```

The script header lists every option. It refuses to overwrite a `data.json` that
already has rows unless you pass `--force`. The old SQL schema is kept in
`supabase/migrations/` for reference only; nothing runs it.

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
- 📱 Mobile-friendly, works offline

## Tech Stack
- Next.js 14 (App Router, static export)
- TypeScript
- Tailwind CSS
- GitHub Contents API for storage
- GitHub Actions + Pages for hosting
- html2canvas + jsPDF
- lucide-react
