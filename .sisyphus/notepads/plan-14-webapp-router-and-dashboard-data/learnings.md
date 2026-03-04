
- `@animal-zoom/webapp` currently uses a manual router in `client/webapp/src/main.tsx` (switch on `window.location.pathname` + `popstate`).
- No router library is currently installed in `client/webapp/package.json`.
- Anchor-based navigation is used in pages:
  - `client/webapp/src/pages/login/index.tsx` links to `/register`, `/dashboard`, `/forgot-password`
  - `client/webapp/src/pages/register/index.tsx` links to `/login`
  - `client/webapp/src/pages/forgot-password/index.tsx` links to `/login`, `/register`
- Router migration works cleanly with `BrowserRouter` + `Routes` + `Route` in `client/webapp/src/main.tsx`, and a `*` fallback route can use `Navigate` to keep unknown paths on `/`.
- Replacing auth-page `<a href>` with `Link` in `login/register/forgot-password` preserves UI while enabling client-side SPA navigation for those flows.
- Dashboard mock content can be isolated into `client/webapp/src/pages/dashboard/data.ts` with exported domain types and an async `loadDashboardData()` that simulates backend latency (`250ms`) while returning cloned mock objects.
