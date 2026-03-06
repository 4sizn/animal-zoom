# Learnings

- `@animal-zoom/webapp` routes are defined inline in `client/webapp/src/main.tsx` via `<Routes>` / `<Route>`.
- Current router is flat (no nested `<Route>` and no `<Outlet>` layouts).
- Catch-all route uses `<Navigate replace to="/" />` (unknown paths redirect to `/`).
- Auth is handled via `AuthProvider` (token storage + socket connection), not router-level guards.
