# Learnings


## 2026-03-05
- REST endpoints are mounted directly in `server/app/src/main.ts` via the Nest Express adapter (no `@Controller`, `@Get`, `@Post`, `@UseGuards` usage found under `server/app/src`).
- Auth/user/mail HTTP routes in `server/app/src/main.ts`: `POST /users/register`, `POST /auth/login`, `POST /auth/forgot-password`.
- JWT: `JwtAuthGuard` exists (`server/app/src/auth/jwt-auth.guard.ts`) but is not applied to any REST route; the Socket.IO gateway (`/zoom`) verifies JWT manually with `JwtService.verifyAsync`.
- DTOs: none; request bodies are parsed as `Record<string, unknown>` and validated inline; shared types are `PublicUser` (`server/app/src/users/users.service.ts`) and `JwtPayload` (`server/app/src/auth/auth.service.ts`).
- Forgot-password flow: generates token + 1h expiry, stores via `UsersService.setPasswordResetToken`, sends via `MailService.sendPasswordResetEmail`, and always returns `{ ok: true }`.
## 2026-03-05 (Dev/test seed discovery)
- No markdown doc in this repo specifies fixed dev/test seed users (email/username/roles/passwords).
- Auth manual verification uses runtime registration via `POST /users/register` (see `.sisyphus/notepads/plan-6-introduce-auth-kysely-postgres/learnings.md:23-26`).
- Existing documented seeding is for MinIO assets: `docker compose up minio-seed` mirrors `client/babylon-web/public/assets/` into MinIO bucket `assets` (see `docs/guides/minio-presigned-assets.md:9-15` and `docs/guides/minio-presigned-assets.md:34-42`).
- Credentials are documented for MinIO defaults in `docs/project-spec-for-agents.md:65-71` and `docs/guides/minio-presigned-assets.md:84-92` (treat as secrets; do not paste into logs/tickets).

- DB: `rooms` table migration added as `20260305_0002_create_rooms.ts` (text `id` generated in app code; FK `owner_user_id` -> `users.id`; `created_at`/`updated_at` default `now()`; index on `owner_user_id`).

## 2026-03-05 (Manual QA)
- Manual QA executed using local Postgres via Homebrew (`brew install postgresql@16`) because docker is unavailable in this environment.
- Verified via curl:
  - Login success returns `{ ok:true, accessToken, user }`.
  - `GET /dashboard` with bearer token returns `{ ok:true, user, rooms }` and without token returns `401 { ok:false, error:"unauthorized" }`.
  - `POST /rooms` rejects whitespace name with `400 { ok:false, error:"invalid name" }`.
  - `GET /rooms/:roomId` returns `200` when owned, `401` without auth, and `404 { ok:false, error:"not found" }` for unknown id.
