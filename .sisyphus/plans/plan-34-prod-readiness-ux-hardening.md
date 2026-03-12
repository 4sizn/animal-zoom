# Prod Readiness UX Hardening (Real User Audit)

## TL;DR
> **Summary**: Fix the highest-risk real-user issues found in Safari manual QA: remove dev/debug UI exposure, correct auth UI state/flows, make room create + chat reliable, and fix study-room copy + mobile layout clipping.
> **Deliverables**: Webapp + server fixes (no new features), plus a repeatable manual QA checklist and build/typecheck gates.
> **Effort**: Deep
> **Parallel**: NO (sequential to reduce regressions)
> **Critical Path**: Login/auth UI trust -> room create success path -> chat send/receive -> study-room mobile polish -> final full-flow QA

## Context
This plan is derived from a real-user Safari walkthrough of the localhost demo (see `docs/guides/localhost-demo-room.md`).

### Observed issues (scope)
1) `/login` exposes dev/debug UI: `Token: none`, `WebSocket: disconnected`, and copy `UI only for now; backend wiring comes later.`
2) `/login` shows `Logout` and an odd `Dashboard` link while logged out.
3) Mobile demo login sometimes leaves login UI visible until reload (URL becomes `/dashboard`).
4) `/room/create` submit path is broken: input value entered but UI still shows `Room name is required.`; empty submit shows native required tooltip in Korean while UI copy is English.
5) `/room/study/*` chat send does not render messages; empty state persists with no visible error.
6) `/room/study/*` shows `1 people` (grammar) and mobile layout clips/overlaps text.

### Constraints
- No new dependencies.
- No redesign / new features.
- Keep copy and behavior production-appropriate (no dev telemetry in user UI).

## Work Objectives
- Remove any dev-only status/telemetry from user-facing pages.
- Make auth UI state consistent (header/actions must reflect login state reliably, including on mobile).
- Ensure room create has a clear success path (loading/success/error) and consistent validation behavior.
- Ensure chat send/receive updates UI deterministically (empty state disappears, messages render, failure is visible).
- Fix study-room copy and mobile layout clipping/overlap.

## Verification Strategy
### Mandatory commands
- `pnpm --filter @animal-zoom/webapp typecheck`
- `pnpm --filter @animal-zoom/webapp build`
- `pnpm --filter @animal-zoom/server-app typecheck`
- `pnpm --filter @animal-zoom/server-app build`

### Mandatory manual QA (Safari)
- Desktop width: validate happy paths + no console errors.
- Mobile width (narrow window): validate layout + flows.
URLs:
- `http://localhost:5173/login`
- `http://localhost:5173/dashboard`
- `http://localhost:5173/room/create`
- `http://localhost:5173/room/study/<roomId>`

## TODOs

- [x] 1. Reproduce and capture evidence for each issue
  - Start local demo per `docs/guides/localhost-demo-room.md`.
  - Record: exact steps, expected vs actual, any visible on-screen error text, and browser console errors.
  - Keep a short reproduction checklist for each issue (desktop + mobile).

- [x] 2. Locate sources of dev/debug UI on `/login`
  - Use `Grep` in `client/webapp/src` for:
    - `Token:`
    - `WebSocket:`
    - `UI only for now`
  - Identify the component(s) rendering these lines and whether they are intended for dev-only visibility.

- [x] 3. Remove dev/debug UI exposure on `/login` (production behavior)
  - Remove or hide the dev-only status UI from user-facing render path.
  - Ensure no user-facing copy suggests incomplete wiring.
  - Verify `/login` has only auth-relevant UI.

- [x] 4. Fix auth layout so logged-out pages do not show logged-in actions
  - Locate where the header/nav is rendered (likely app shell/layout) and how auth state is derived.
  - Ensure `Logout` does not render when unauthenticated.
  - Ensure `/login` does not include confusing navigation links (e.g. `Dashboard`) unless clearly intentional and gated.
  - Verify: open `/login` in a fresh session (no token) -> no `Logout`.

- [x] 5. Root-cause the mobile demo login "stuck UI until reload"
  - Reproduce on narrow width.
  - Capture: whether token/state actually changes (localStorage/cookie), whether route changes, whether UI state updates.
  - Hypothesis-driven checks:
    - auth state store not re-rendering
    - navigation occurs before auth state commit
    - stale query/cache preventing dashboard mount
  - Implement the minimal fix so the post-demo-login UI always matches route/auth state without requiring reload.

- [x] 6. Locate `/room/create` submission + validation logic
  - `Grep` in `client/webapp/src` for:
    - `Room name is required.`
    - route path `/room/create`
    - API call to `POST /rooms`
  - Identify: form state shape, validation trigger conditions, and submit handler behavior.

- [x] 7. Fix room create validation consistency (no native tooltip mismatch)
  - Decide: either fully native validation or fully custom; do not mix.
  - Ensure required validation messaging is consistent with UI language/copy.
  - Verify:
    - empty submit shows the intended UI error message
    - filled submit clears the error and proceeds

- [x] 8. Fix room create success path (loading, success navigation, failure visibility)
  - Ensure submit triggers exactly one API request.
  - Show a clear loading state, and on success navigate to `/room/study/<roomId>`.
  - On failure, show a user-facing error (not silent) and keep input value intact.
  - Verify via manual QA: create room with a name -> lands in study room.

- [x] 9. Locate study-room chat send/receive wiring
  - `Grep` in `client/webapp/src` for:
    - `No messages yet.`
    - socket event names for room chat (e.g. `room:message`, `room:history`)
  - Identify:
    - where messages state is stored
    - how send is invoked
    - how receive updates state
    - what happens if socket is disconnected

- [x] 10. Fix chat send/receive so messages render deterministically
  - On send: optimistic add or wait-for-ack, but ensure the UI updates reliably.
  - Ensure empty state disappears once a message exists.
  - Ensure failures are visible (e.g. toast/inline error) rather than silent.
  - Verify:
    - send message -> message appears in list
    - refresh/rejoin -> history loads (if implemented)

- [x] 11. Fix study-room copy and presence grammar
  - Replace `1 people` with correct singular/plural logic.
  - Verify: 1 participant -> "1 person"; N participants -> "N people".

- [x] 12. Fix mobile layout clipping/overlap on `/room/study/*`
  - Reproduce clipping/overlap at narrow width.
  - Identify the specific elements that clip (participant tile title, bottom-left room text).
  - Implement minimal layout fixes (safe-area margins, text truncation, spacing).
  - Verify: no clipped text, no overlapping controls on mobile width.

- [x] 13. Run build/typecheck gates (webapp + server)
  - Run the mandatory commands from Verification Strategy.
  - Address any new diagnostics; do not ship with warnings/errors introduced.

- [x] 14. Final end-to-end Safari QA (desktop + mobile)
  - Desktop:
    - `/login` has no dev/debug text
    - demo login -> dashboard renders immediately
    - create room -> navigates to study room
    - chat send -> message renders
  - Mobile width:
    - demo login -> dashboard renders immediately
    - study room layout has no clipping/overlap
  - Confirm no console errors during the flow.

## Production-ready gate (must all be true)
- No dev/debug status text visible on user pages.
- Logged-out UI never shows logged-in actions.
- Demo login works without requiring reload (desktop + mobile).
- Room create reliably reaches study room and shows errors when it cannot.
- Chat send updates UI and failures are visible.
- Study room mobile layout has no clipping/overlap; presence copy is correct.
- `typecheck` + `build` pass for both webapp and server.
