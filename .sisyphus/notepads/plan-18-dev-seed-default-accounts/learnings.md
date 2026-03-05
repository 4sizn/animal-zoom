# Learnings

## 2026-03-05
- Dev accounts doc: `server/app/docs/dev-accounts.md`.
- Seed runner default fallback: if `DEV_SEED_USERS_JSON` is missing/empty, `server/app/src/database/seed.ts` seeds 3 default users (dev1/dev2/admin) and logs which source was used (no password logging).
- Manual QA: confirmed `pnpm --filter @animal-zoom/server-app seed` (with `DEV_SEED_USERS_JSON` unset) inserts defaults and `POST /auth/login` works for `dev1@animal-zoom.local`.
