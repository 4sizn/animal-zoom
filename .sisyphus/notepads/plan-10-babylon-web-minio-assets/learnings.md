# Learnings

- `@animal-zoom/babylon-web` (Vite) serves `public/` at the origin root, so `client/babylon-web/public/assets/**` is loaded via absolute URLs like `/assets/...` (no env/config found yet).
- Avatar glTF base URLs are hardcoded in `client/babylon-web/src/scene/assetLoader.ts` as `AVATAR_ROOT_URL_BY_TYPE` mapping to `/assets/characters/<avatar>/model/` and then loads `scene.gltf`.
- Personal space mesh/background assets are referenced with hardcoded `/assets/...` URLs inside `client/babylon-web/src/main.ts` (e.g. `/assets/personal-space/.../*.gltf`, `/assets/personal-space/plant/Avocado.glb`).
- Repro grep: `grep -R "AVATAR_ROOT_URL_BY_TYPE" client/babylon-web/src` and `grep -R "\"/assets/" client/babylon-web/src`.

- `@animal-zoom/webapp` is also Vite; current env-driven URL is only API base: `client/webapp/src/auth/api.ts` uses `(import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000"`.
- In UI code, image/model URLs are not derived from an asset base yet; e.g. `client/webapp/src/main.tsx` uses `participant.animal.imageUrl` which is currently hardcoded to full `https://...` URLs.
- Repro grep: `grep -R "VITE_API_URL" client/webapp/src` and `grep -R "imageUrl" client/webapp/src`.

- MinIO is already provisioned for local dev in `docker-compose.yml` as service `minio` with persisted volume `minio_data` and ports `9000` (S3 API) / `9001` (console).
- Added one-shot `minio-init` service (`minio/mc`) to create bucket `assets` idempotently via `mc mb --ignore-existing local/assets` using `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`.
- Operational gotcha: `minio-init` is a separate one-shot service; run `docker compose up -d minio` and then run `docker compose up minio-init` (or `docker compose up -d minio minio-init`) to ensure bucket bootstrap executes.
- MinIO CORS config for local browser access is stored at `server/minio/cors.json`; `minio-init` mounts this file and applies it to `local/assets` via `mc cors set` during bootstrap.
- Server MinIO config now comes from `@animal-zoom/server-minio` `loadMinioConfig`; expected env vars are `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, and `MINIO_BUCKET`.

- Babylon demo/test stays local because `@animal-zoom/babylon-web` uses hardcoded `/assets/...` URLs that resolve to Vite `public/` (`client/babylon-web/public/assets/**`).

- Webapp asset convention: any image `src` starting with `asset:` or `asset://` is treated as an object key and resolved via `POST /assets/presign` (in `client/webapp/src/assets/AssetImage.tsx`).
- Added `POST /assets/presign` on server app; request body is `{ "key": string }` and responses are `{ ok: true, url: string }` on success or `{ ok: false, error: string }` with HTTP 400 on invalid/failed requests.
- `POST /assets/presign` validates key safety (`non-empty`, not starting with `/`, no `..`) and only allows object keys under `characters/` or `personal-space/` prefixes.
- Presign TTL defaults to `600` seconds and can be overridden with `ASSET_PRESIGN_TTL_SECONDS`; signing region defaults to `us-east-1` and can be overridden with `MINIO_REGION`.
- Added `GET /assets/meta` on server app; response shape is `{ ok: true, bucket: string, allowedPrefixes: string[], presignTtlSeconds: number }` and mirrors the same bucket/prefix/TTL values used by `POST /assets/presign`.

- MinIO seed: `docker-compose.yml` has a one-shot `minio-seed` service that mirrors `client/babylon-web/public/assets` into bucket `assets` (object keys match the directory structure).

- Manual QA (when Docker is available): `docker compose up -d minio && docker compose up minio-init && docker compose up minio-seed && pnpm --filter @animal-zoom/server-app dev && pnpm --filter @animal-zoom/webapp dev` then confirm `asset:` URLs resolve via `/assets/presign`.
