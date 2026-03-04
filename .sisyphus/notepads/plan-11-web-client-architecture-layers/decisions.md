# Decisions

- Target scope: `client/webapp` in this repo.
- Target layers (allowed dependency directions):
  - `system` -> no imports from other layers
  - `network` -> may import `system` only
  - `domain` -> may import `system` only (prefer none)
  - `ui` -> may import `domain` only
  - `features`/`pages` -> may import `ui`, `domain`, `network` (composition root)
- Keep existing route/page structure for now; migrate internals incrementally.

- Barrel exports:
  - `client/webapp/src/system/index.ts`, `client/webapp/src/network/index.ts`, `client/webapp/src/domain/index.ts`, `client/webapp/src/ui/index.ts`.
- Avoid a single mega barrel at `src/index.ts` for now.

- Env config:
  - Centralize Vite env access in `client/webapp/src/system/env.ts`.
  - Export `API_BASE_URL` and derived URLs (e.g. `ZOOM_SOCKET_URL`).
