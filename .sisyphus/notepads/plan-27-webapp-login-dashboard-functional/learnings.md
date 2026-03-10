
2026-03-10
- Backend `GET /dashboard` returns `{ ok: true, user: { id, email, createdAt }, rooms: [{ id, name, createdAt }] }`; room/user `createdAt` serialize as ISO strings over JSON.
- Backend `POST /rooms` returns `{ ok: true, room }`; `GET /rooms/:roomId` returns `{ ok: true, room }` (or `{ ok: false, error }` with 4xx).

- Dashboard API room -> UI room mapping (webapp):
  - `tone`: deterministic `sum(charCodeAt) % 3` on `room.id`
  - `description`: `${room.name} room`
  - `participants`: `[{ name: "You" }]` placeholder

- Login redirect: `/login` reads `next` query param; after successful login navigates to `next` (must start with `/` and not `//`) else falls back to `/dashboard`.

- Study route: when `token` is present, `/room/study/:roomId` attempts `GET /rooms/:roomId`; if found, participant count defaults to 1 (or `?participants=` override) instead of mock dashboard demo participant list.

- Verification note: Safari automation exercised login -> dashboard -> create room -> join room -> study; also checked no Vite error overlay (`document.querySelector('vite-error-overlay') === null`).

- Search-mode run: direct-tool exhaustive search confirmed stable selectors/ids (`#login-email`, `#login-password`, button text for `Sign in`, `View all`, `Start your own session`, and title attributes `Notifications`/`Settings`).
- Live browser demo rerun in Safari ended on `/room/study/<roomId>` with `hasOverlay: false`, confirming visible step flow remains healthy.
