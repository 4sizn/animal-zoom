# Learnings

## 2026-03-05
- `server/app/src/database/seed.ts` now ALWAYS includes default dev accounts; `DEV_SEED_USERS_JSON` only adds extra unique emails.
- `server/app/package.json` `dev` script runs build -> migrate -> seed -> watch, so dev accounts are guaranteed on `pnpm --filter @animal-zoom/server-app dev`.
- Manual QA: started local Postgres (Homebrew) and confirmed login works for `dev1@animal-zoom.local` after running dev.
