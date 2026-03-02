# Learnings (append-only)

2026-03-02
- Manual verification can be done headless via curl + node socket.io-client (without browser automation).
- Commands used:
  - docker: `docker compose up -d`
  - migrate: `node server/app/dist/database/migrate.js`
  - DB check: `docker exec -i animal-zoom-postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\\dt"'`
  - register: `POST /users/register`
  - login: `POST /auth/login`
  - ws: node script with `io('http://localhost:3000/zoom', { transports: ['websocket'], auth: { token } })`
  - forgot-password: `POST /auth/forgot-password`
- Observed behavior:
  - Postgres/MinIO start cleanly; migration creates `users` table.
  - Unauthorized WS connects then immediately gets `io server disconnect`.
  - Authorized WS can emit `zoom:update` and receives ack `{ ok: true }`.
  - If Mailtrap env vars are missing, server logs reset token and returns `{ ok: true }`.
