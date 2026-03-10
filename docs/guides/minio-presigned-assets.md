# MinIO Presigned Assets (Webapp)

This repo uses "Approach B": the webapp asks the server for a presigned URL, then the browser loads the object from MinIO using that URL.

Babylon demo/test stays local (Vite `public/` -> `/assets/...`).

## Quick Start (Local)

1) Start MinIO

```bash
docker compose up -d minio
docker compose up minio-init
docker compose up minio-seed
```

2) Start server

```bash
pnpm --filter @animal-zoom/server-app build
pnpm --filter @animal-zoom/server-app start
```

3) Start webapp

```bash
pnpm --filter @animal-zoom/webapp dev
```

4) Open the printed webapp URL (Vite "Local")

## How It Works

### Seeded Assets

`docker compose up minio-seed` mirrors the local directory into MinIO:

- Source: `client/babylon-web/public/assets/`
- Bucket: `assets`
- Keys: match the directory structure (example: `personal-space/greenchair/textures/GreenChair_01_diff_1k.jpg`)

Note: `client/babylon-web/public/assets/characters/` currently contains symlinks; depending on your Docker/OS, mirroring symlinks may not copy the actual files. The seeded set is reliable for `personal-space/**`.

### Server Endpoints

The server is `@animal-zoom/server-app`.

- `GET /assets/meta`
  - Response:
    - `{ ok: true, bucket: string, allowedPrefixes: string[], presignTtlSeconds: number }`

- `POST /assets/presign`
  - Request body:
    - `{ "key": string }`
  - Success:
    - `{ ok: true, url: string }`
  - Failure (HTTP 400):
    - `{ ok: false, error: string }`
  - Validation rules:
    - key is non-empty
    - key does not start with `/`
    - key does not contain `..`
    - key prefix is allowlisted (`characters/`, `personal-space/`)

#### Presign TTL

- Default: 600 seconds
- Override:
  - `ASSET_PRESIGN_TTL_SECONDS=<number>`

#### Presign Public Origin Override

- Default: disabled (server returns MinIO client's native presigned URL origin)
- Override:
  - `ASSET_PRESIGN_PUBLIC_ORIGIN=http://host.docker.internal:9000`
- Notes:
  - Must be a valid `http`/`https` origin (protocol + host + optional port)
  - When set and valid, only the origin is rewritten; path/query/signature are unchanged
  - If malformed, the override is ignored and default behavior is preserved

### Webapp `asset:` Convention

In `@animal-zoom/webapp`, image `src` can use an object key instead of a public URL:

- `asset:personal-space/greenchair/textures/GreenChair_01_diff_1k.jpg`
- `asset://personal-space/greenchair/textures/GreenChair_01_diff_1k.jpg`

When `src` starts with `asset:`/`asset://`, the webapp calls `POST /assets/presign` and then uses the returned `url` as the actual `<img src=...>`.

## Configuration

### Server

MinIO config env vars (loaded by `@animal-zoom/server-minio`):

- `MINIO_ENDPOINT` (default `localhost`)
- `MINIO_PORT` (default `9000`)
- `MINIO_USE_SSL` (default `false`)
- `MINIO_ACCESS_KEY` (default `minioadmin`)
- `MINIO_SECRET_KEY` (default `minioadmin`)
- `MINIO_BUCKET` (default `assets`)
- `ASSET_PRESIGN_PUBLIC_ORIGIN` (optional public origin override for returned presigned URLs)

### Webapp

- `VITE_API_URL` (default `http://localhost:3000`)

## Troubleshooting

### Ports already in use

- Webapp (Vite) will auto-pick another port and print it.
- Server uses `PORT` (default 3000). If 3000 is busy, stop the old process or set `PORT`.

### Docker not running

All MinIO-related commands require a running Docker daemon.

### MinIO init logs show CORS errors

`minio-init` applies CORS best-effort.

Even if CORS setup fails, a presigned URL can still work for plain `<img>` loading (CORS is primarily required when JavaScript needs to read the response).
