# Learnings (append-only)

Deps added (server/app): Kysely ^0.27.4 + pg ^8.12.0; auth stack @nestjs/jwt ^10.2.0, @nestjs/passport ^10.0.3, passport(-jwt), bcrypt, dotenv.

Biome parser rejects Nest param decorators; DB provider uses `provide: Kysely` token so constructors can inject without `@Inject(...)`.

Migration runner: `server/app/src/database/migrate.ts` loads `.env` via `dotenv/config` and uses `FileMigrationProvider` with `migrationFolder: path.join(__dirname, 'migrations')` (works for compiled `dist/`).

Automated verification: `node server/app/dist/database/migrate.js` successfully created tables `users`, `kysely_migration`, `kysely_migration_lock` in the compose Postgres.

Manual verification (non-browser): HTTP register/login works; WS `/zoom` connects with `auth.token` JWT and `zoom:update` ack returns `{ ok: true }`. Forgot-password logs token when Mailtrap creds missing.

Manual verification extras: MinIO health endpoint `/minio/health/live` returns 200; WS without token is disconnected (`io server disconnect`); forgot-password persists token+expiry in `users.reset_password_*`.

To verify Mailtrap inbox: set `MAILTRAP_USER`/`MAILTRAP_PASS` in `.env`, restart server, call `POST /auth/forgot-password` for an existing user, then confirm message arrives in Mailtrap sandbox inbox.

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
  - Root `.env` currently has empty `MAILTRAP_USER`/`MAILTRAP_PASS`, so inbox receipt cannot be verified.
  - If Mailtrap env vars are missing, server logs reset token and returns `{ ok: true }`.
