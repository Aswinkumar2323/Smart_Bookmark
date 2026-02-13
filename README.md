# 🔖 Smart Bookmark

A real-time bookmark manager where users sign in with Google, save private bookmarks, and see them sync instantly across tabs.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase PostgreSQL + Row Level Security |
| Realtime | Supabase Realtime (Postgres Changes) |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Features

- **Google-only Auth** — One-click sign in, no email/password
- **Private Bookmarks** — Row Level Security ensures users only see their own data
- **Real-time Sync** — Add a bookmark in one tab, it appears in the other instantly
- **Add & Delete** — Simple CRUD with URL validation
- **Dark Glassmorphism UI** — Modern design with gradient accents and micro-animations

---

## Run Locally

```bash
git clone https://github.com/<your-username>/smart-bookmark.git
cd smart-bookmark
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Google OAuth Setup

1. Create a Google Cloud OAuth 2.0 Client ID
2. In Supabase Dashboard → **Authentication → Providers → Google** — enable and paste Client ID + Secret
3. In Supabase → **Authentication → URL Configuration** — add `http://localhost:3000/auth/callback` to Redirect URLs

---

## Problems Encountered & Solutions

### 1. npm rejected the project directory name

**Problem**: `npx create-next-app@latest ./` failed because the folder `Smart_Bookmark` contains capital letters, which violates npm naming rules.

**Solution**: Created `package.json` manually with a lowercase name (`smart-bookmark`) and installed Next.js, React, and all dependencies separately via `npm install`.

### 2. OAuth redirect went nowhere after Google sign-in

**Problem**: After signing in with Google, the app stayed on the same page and never redirected to the dashboard. The `redirectTo` parameter was incorrectly set to Supabase's internal callback URL (`https://xxx.supabase.co/auth/v1/callback`).

**Solution**: Changed `redirectTo` to the **app's own** `/auth/callback` route: `${window.location.origin}/auth/callback`. Supabase handles the Google ↔ Supabase callback internally — `redirectTo` is where Supabase sends the user back to *our* app with an auth code. Also had to whitelist the app URL in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.

### 3. Bookmarks didn't update in real-time across tabs

**Problem**: After adding a bookmark, it only appeared in the current tab — other open tabs didn't show the new bookmark until manually refreshed. Deletion worked cross-tab, but insertion did not.

**Solution**: Applied a three-part fix:
- Stabilized the Supabase client with `useMemo(() => createClient(), [])` and removed it from `useEffect` deps
- Switched to a **wildcard** (`event: "*"`) postgres_changes subscription with client-side `user_id` filtering
- Added a **Supabase Broadcast channel** (`bookmarks-sync-{userId}`) as a secondary cross-tab sync mechanism — `AddBookmarkForm` and `BookmarkCard` broadcast add/delete events, and `BookmarkList` listens on the same channel. This guarantees instant cross-tab updates even if `postgres_changes` is unreliable.
- Created a `DashboardClient.tsx` wrapper that passes newly added bookmarks from the form to the list via React state for **optimistic same-tab updates**

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts & metadata
│   ├── page.tsx                # Landing page (redirects if logged in)
│   ├── globals.css             # Theme tokens & global styles
│   ├── auth/callback/route.ts  # OAuth code → session exchange
│   └── dashboard/page.tsx      # Protected bookmark dashboard
├── components/
│   ├── AuthButton.tsx          # Google sign-in button
│   ├── Header.tsx              # Sticky nav with user info
│   ├── DashboardClient.tsx     # Client wrapper for realtime state
│   ├── AddBookmarkForm.tsx     # Title + URL form + broadcast
│   ├── BookmarkCard.tsx        # Single bookmark display + broadcast
│   └── BookmarkList.tsx        # Real-time list with dual-channel sync
├── lib/
│   ├── supabase/client.ts      # Browser Supabase client
│   ├── supabase/server.ts      # Server Supabase client
│   └── types.ts                # Bookmark type definition
└── middleware.ts               # Session refresh on every request
```


