
## Learnings (2026-03-12)
- `client/webapp/src/pages/login/index.tsx` rendered production-visible debug status (Token/WebSocket) and placeholder footer copy; removing them is low-risk and immediately improves trust.
- Keeping debug telemetry out of primary UI avoids confusing auth state perception and reduces "product feels unfinished" risk.
- Gate navigational affordances on auth state: hide `/dashboard` link on `/login` when logged out, and hide Logout action in dashboard header when token is missing to avoid confusing flashes during redirects.
- Post-login navigation should be driven by `token` presence (effect-based) to avoid race conditions where route changes before auth context re-renders on slower/mobile environments.
- `client/webapp/src/pages/room/create/index.tsx` mixed native `required` validation with custom error state; removing `required`, clearing error on input change, and using a single submit guard makes validation consistent and avoids locale-mismatched browser tooltips.
- Chat UX relied on server broadcast; appending the ack-returned message on `room:message` makes send deterministic even if broadcast/join timing is flaky.
- Socket.IO websocket-only transport is brittle on some local/dev setups; allowing polling fallback improves connection reliability.
- Presence copy should be plural-aware; centralized `formatPeople()` avoids repeated `"{n} people"` strings and fixes obvious grammar slips.
- Avoid absolute-centered control clusters on mobile footers; make the center controls flow in normal flex layout for small widths and use absolute centering only on md+ to prevent overlap with room title/count.
