# Issues

## 2026-03-05
- Manual QA blocked in this environment: `docker` command not available and no local Postgres on `localhost:5432` (migration run fails with ECONNREFUSED).

## 2026-03-05 (Resolved)
- Worked around by installing and running local Postgres via Homebrew (`postgresql@16`) for manual QA.
