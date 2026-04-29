# RentNowPk

Car-rental marketplace for Pakistan. v1 is a lead-generation product — customers WhatsApp/call vendors directly; every click is logged server-side as a lead and vendors are billed monthly.

Full build plan lives at `C:\Users\Rehan\.claude\plans\floating-shimmying-wave.md`.

## Stack
Next.js 16 (App Router, TS) · Supabase · Cloudinary · Brevo · Shadcn · Tailwind v4 · Framer Motion.


## Run locally
```bash
cp .env.local.example .env.local   # fill in secrets
npm run dev                        # http://localhost:3000
```

## Scripts
- `npm run dev` — Next.js dev server on :3000
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript `--noEmit` check
- `npm run db:types` — regenerate `types/database.ts` from local Supabase

## Phase status
- [x] **Phase 1** — Scaffold & tooling
- [ ] Phase 2 — Design system & Shadcn primitives
- [ ] Phase 3 — Supabase + magic-link auth
- [ ] Phase 4 — Roles, active-mode switch, route groups
- [ ] Phase 5 — Public shell & home page
- [ ] Phase 6 — Reference data sync (makes/models/features)
- [ ] Phase 7 — Listings schema + public search
- [ ] Phase 8 — Single car detail page
- [ ] Phase 9 — Single business detail page
- [ ] Phase 10 — Vendor dashboard: listings CRUD
- [ ] Phase 11 — Vendor KYC + admin approval queues
- [ ] Phase 12 — Lead tracking: `wa.me` + call loggers
- [ ] Phase 13 — Admin CSV import + business claims
- [ ] Phase 14 — Leads ledger, billing export, reports, polish
