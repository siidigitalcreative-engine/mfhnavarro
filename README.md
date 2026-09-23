# MF Navarro — Portfolio

Single-page portfolio built with Next.js (App Router).

## Run locally
```
npm install
npm run dev
```
Open http://localhost:3000

## Deploy (GitHub + Vercel)
1. Push this folder to a new GitHub repo.
2. Go to vercel.com → New Project → import that repo.
3. Framework preset is auto-detected as Next.js — no config needed.
4. Deploy. Vercel redeploys automatically on every push to `main`.

## Where to edit
- `app/page.tsx` — all homepage content (hero copy, work items, testimonials, clients, about, contact).
- `app/globals.css` — colors, type, spacing. Color tokens are at the top of the file under `:root`.
- `app/layout.tsx` — page title/description and fonts.

Replace the placeholder project names, testimonials, and client names in `page.tsx` with your real ones, and swap the email/social links.
