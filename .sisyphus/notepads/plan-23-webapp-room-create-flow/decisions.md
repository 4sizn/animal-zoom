# Decisions

- 2026-03-06: /room/create becomes an interactive page (not auto-redirect). Primary path uses POST /rooms with auth token; unauth users get a login CTA plus an optional "demo room" fallback.
- 2026-03-06: Keep create-room API payload minimal: `{ name }` only (matches server controller).
