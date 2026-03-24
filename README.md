# Good Kid Score App 🐰🥕
## 乖寶寶記分

A cute candy-themed app for parents to track their children's good behavior using carrots as points.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration in `supabase/migrations/001_initial.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create your first owner account
1. Start the app: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "Sign Up" to create an account
4. After signing up, go to your Supabase dashboard > Table Editor > users
5. Find your user and change `role` from `viewer` to `owner`
6. Refresh the app — you now have owner (parent) access!

### 5. Invite others
As an owner, you can use the "Invite" button on the dashboard to add other family members.

## Features
- 🐰 Cute bunny characters for each child
- 🥕 Carrot-based point system
- 📅 Monthly score tracking
- 🎁 Customizable rewards table
- 📄 Export monthly PDF reports
- 👨‍👩‍👧 Multi-user with owner/viewer roles
- 📱 Mobile-friendly design

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)
- html2canvas + jsPDF
- lucide-react
