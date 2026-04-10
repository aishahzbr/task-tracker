# ✅ Aishah's Task Tracker — Setup Guide

## What you need (all free)
- Supabase account → supabase.com
- Vercel account → vercel.com
- GitHub account → github.com (needed for Vercel)

---

## Step 1 — Supabase database

1. Go to **supabase.com** → sign up → click **New Project**
2. Name it `task-tracker`, set a password, pick your region → **Create project** (wait ~2 mins)
3. In the left sidebar click **SQL Editor** → paste this and click **Run**:

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  who text default 'Aishah',
  priority text default 'Medium',
  status text default 'To Do',
  pct integer default 0,
  due text,
  created_at timestamp with time zone default now()
);

alter table tasks enable row level security;
create policy "Public access" on tasks for all using (true);
```

4. Go to **Project Settings** (gear icon) → **API**
5. Copy your **Project URL** and **anon public key**

---

## Step 2 — Add your Supabase keys

Open the file `src/supabase.js` and replace:
- `YOUR_SUPABASE_URL` with your Project URL
- `YOUR_SUPABASE_ANON_KEY` with your anon key

It should look like:
```js
const SUPABASE_URL  = 'https://abcdefgh.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Step 3 — Upload to GitHub

1. Go to **github.com** → sign up / log in → click **New repository**
2. Name it `task-tracker` → **Create repository**
3. Upload all the project files (drag and drop the folder contents)

---

## Step 4 — Deploy on Vercel

1. Go to **vercel.com** → sign up with GitHub
2. Click **Add New Project** → select your `task-tracker` repo
3. Vercel auto-detects Vite → just click **Deploy**
4. In ~1 minute you get a live URL like `task-tracker-aishah.vercel.app`

---

## Done! 🎉

- Open the URL on your **phone** and **desktop** — same data everywhere
- Changes sync in **real time** across all devices
- Bookmark it on your phone's home screen for an app-like feel:
  - iPhone: Safari → Share → **Add to Home Screen**
  - Android: Chrome → menu → **Add to Home Screen**
