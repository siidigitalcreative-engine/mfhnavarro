# MF Navarro — Portfolio

Single-page portfolio built with Next.js (App Router), with a password-protected
`/admin` page for editing content and uploading work images/videos. All content
and media are stored in Vercel Blob — no database, no local files, no
browser-side storage.

## Set up Vercel Blob (once)
1. In your Vercel project → **Storage** → **Create Database** → **Blob**.
2. Connect it to this project. Vercel then injects `BLOB_READ_WRITE_TOKEN`
   into your deployment automatically.
3. For local dev, copy that token from the store's `.env.local` tab in Vercel
   into your own `.env.local` (see `.env.example`).

## Environment variables
Copy `.env.example` to `.env.local` and fill in:
- `ADMIN_PASSWORD` — the password you'll use to log into `/admin`.
- `AUTH_SECRET` — random string used to sign the login session
  (`openssl rand -base64 32`).
- `BLOB_READ_WRITE_TOKEN` — from the Blob store, as above.

Add the same three variables in Vercel → Project → Settings → Environment
Variables before deploying.

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000 for the site, http://localhost:3000/admin to edit.

## Deploy (GitHub + Vercel)
1. Push this folder to a new GitHub repo.
2. Vercel → New Project → import that repo → add the env vars above.
3. Deploy. Every push to `main` redeploys automatically.

## How editing works
- Visit `/admin`, log in with `ADMIN_PASSWORD`.
- Edit hero text, work items (with image/video upload), testimonials, clients,
  about text, and your contact email.
- **Save changes** writes a `content.json` file to Blob storage; the homepage
  reads it fresh on every request, so edits show up immediately — no
  redeploy needed.
- Uploaded images/videos go straight to Blob and are referenced by URL in
  that same file.
- The login itself is a single stateless signed cookie (12h expiry) — there's
  no session database and nothing is kept in the browser's local/session
  storage.

## Where things live in code
- `app/page.tsx` — public homepage, renders whatever is in `content.json`.
- `app/admin/page.tsx` — the editing dashboard.
- `lib/types.ts` — the content shape, plus the fallback copy used before you
  save anything.
- `lib/content.ts` — reads/writes `content.json` in Blob.
- `lib/auth.ts` + `middleware.ts` — the password check and route protection.
