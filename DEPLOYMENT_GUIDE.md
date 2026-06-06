# 🐄 PRD.143 Thondapadi Milk Co-op — Deployment Guide

## What You're Getting
A full production website with:
- ✅ Real database (Supabase — free PostgreSQL)  
- ✅ Secure login (Admin + Data Entry roles)
- ✅ All 20 members pre-loaded from your PDF
- ✅ Daily milk entry with auto-amount calculation
- ✅ Company Report (PDF + Excel) with dynamic price
- ✅ Bank Report (PDF + Excel) with column selector
- ✅ Hosted free on Vercel with your own URL

---

## STEP 1 — Set Up Supabase Database (10 minutes)

1. Go to **https://supabase.com** → Sign Up (free)
2. Click **"New Project"**
   - Name: `milk-coop-prd143`
   - Database Password: (save this somewhere safe)
   - Region: **Southeast Asia (Singapore)** — closest to India
3. Wait ~2 minutes for project to start
4. Click **"SQL Editor"** in left menu → **"New Query"**
5. Open the file `supabase-schema.sql` from this folder
6. **Copy the entire content** and paste into the SQL Editor
7. Click **"Run"** (green button)
8. You should see: "Success. No rows returned"

> ✅ This creates all tables + loads all 20 Thondapadi members automatically!

---

## STEP 2 — Create Admin User (5 minutes)

1. In Supabase, go to **Authentication → Users** (left menu)
2. Click **"Add User"** → **"Create New User"**
   - Email: `admin@thondapadi.com` (or any email you want)
   - Password: Choose a strong password
   - Click **"Create User"**
3. You'll see the new user. Click on their row to see their **UUID** (looks like: `a1b2c3d4-...`)
4. Copy that UUID
5. Go back to **SQL Editor** → New Query, paste and run this (replace YOUR-UUID):

```sql
INSERT INTO user_roles (user_id, role, full_name)
VALUES ('YOUR-UUID-HERE', 'admin', 'Admin');
```

**To add a Data Entry user** (for your village helper):
1. Add another user in Authentication → Users
2. Run:
```sql
INSERT INTO user_roles (user_id, role, full_name)
VALUES ('THEIR-UUID', 'data_entry', 'Helper Name');
```

---

## STEP 3 — Get Your API Keys (2 minutes)

1. In Supabase, go to **Settings → API** (left menu)
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## STEP 4 — Deploy to Vercel (5 minutes)

### Option A: GitHub (Recommended)

1. Create a free account at **https://github.com**
2. Create a new repository called `milk-coop`
3. Upload all files from this folder to that repository
4. Go to **https://vercel.com** → Sign up with GitHub
5. Click **"Add New Project"** → Import your `milk-coop` repo
6. In **"Environment Variables"** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL from Step 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key from Step 3
7. Click **"Deploy"**
8. Wait ~2 minutes → Your site is live! 🎉

### Option B: Vercel CLI (If you know terminal)

```bash
npm install -g vercel
cd milk-coop
cp .env.local.example .env.local
# Edit .env.local with your Supabase keys
vercel
# Follow prompts, then:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

---

## STEP 5 — Test Your Live Website

1. Open your Vercel URL (e.g., `https://milk-coop-xyz.vercel.app`)
2. Log in with the admin email/password you created
3. Go to **Dashboard** — you'll see it's empty (no entries yet)
4. Go to **Members** — all 20 Thondapadi members are there!
5. Go to **Daily Entry** → add a test entry
6. Go to **Company Report** → type `33` for rate → Download Excel / PDF

---

## STEP 6 — Get a Custom Domain (Optional, free via Freenom)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Type your domain name → Follow instructions
3. Or get a free `.ml` or `.tk` domain from **freenom.com**

---

## File Structure Reference

```
milk-coop/
├── src/
│   ├── components/
│   │   ├── App.tsx          ← Main app shell
│   │   ├── Sidebar.tsx      ← Navigation sidebar
│   │   └── ui.tsx           ← Reusable UI components
│   ├── hooks/
│   │   ├── useAuth.tsx      ← Login/logout/session
│   │   └── useData.ts       ← Database queries
│   ├── lib/
│   │   ├── supabase.ts      ← Supabase client
│   │   ├── types.ts         ← TypeScript types
│   │   └── export.ts        ← Excel + PDF export
│   ├── pages/
│   │   ├── index.tsx        ← Home (Next.js entry)
│   │   ├── _app.tsx         ← App wrapper
│   │   ├── LoginPage.tsx    ← Login screen
│   │   ├── Dashboard.tsx    ← Dashboard
│   │   ├── DailyEntry.tsx   ← Add entries
│   │   ├── RecordsPage.tsx  ← View all records
│   │   ├── MembersPage.tsx  ← Manage members
│   │   ├── ReportPage.tsx   ← Company + Bank reports
│   │   └── UsersPage.tsx    ← User management
│   └── styles/
│       └── globals.css      ← Global styles
├── supabase-schema.sql      ← Run this in Supabase SQL Editor
├── .env.local.example       ← Copy to .env.local, add your keys
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

---

## Roles Explained

| Feature | Admin | Data Entry |
|---------|-------|------------|
| View Dashboard | ✅ | ✅ |
| Add daily entries | ✅ | ✅ |
| View all records | ✅ | ✅ |
| View members | ✅ | ✅ |
| Edit/delete members | ✅ | ❌ |
| Delete entries | ✅ | ❌ |
| Company Report + Export | ✅ | ❌ |
| Bank Report + Export | ✅ | ❌ |
| Change milk price | ✅ | ❌ |
| User Management | ✅ | ❌ |

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs

**Your site will be free forever** as long as:
- Supabase free tier: up to 500MB database, 50,000 rows
- Vercel free tier: unlimited deployments, 100GB bandwidth/month
