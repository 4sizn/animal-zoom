# Localhost Demo Room

This guide explains how to run the always-on localhost demo environment end-to-end:

- DB seeded data (Postgres)
- REST API (NestJS)
- Web UI (Vite + React)

Related docs:

- Dev accounts: `server/app/docs/dev-accounts.md`
- REST endpoints: `server/app/docs/rest-api.md`

## Prerequisites

- Docker (for Postgres/MinIO)
- pnpm (repo uses `pnpm -r` and workspace filters)

## Environment

The repo root `.env` contains local-dev defaults (ports, DB, JWT secret, MinIO config).

You generally do not need to change anything to run the demo, but the key variables are:

- `PORT` (server)
- `POSTGRES_*` / `DATABASE_URL`
- `JWT_SECRET`
- `MINIO_*`

## Start (3 terminals)

1) Start dependencies:

```bash
docker compose up -d
```

2) Start backend (auto runs migrate + seed before starting):

```bash
pnpm --filter @animal-zoom/server-app dev
```

3) Start webapp:

```bash
pnpm --filter @animal-zoom/webapp dev
```

## URLs

- Webapp: `http://localhost:5173/login`
- Server: `http://localhost:3000`

## Demo flow (expected)

1) Open `http://localhost:5173/login`
2) Click `Continue as demo`
3) You should land on `/dashboard` and see an always-seeded room:
   - id: `demo-room`
   - name: `Demo room`
4) Create a room via the dashboard UI (or `/room/create`)
5) You should be routed to `/room/study/<roomId>` and the room should be persisted via `POST /rooms`

## Troubleshooting

### Docker not running / DB connection errors

- Confirm containers are up:

```bash
docker compose ps
```

### Ports already in use

- Server defaults to `PORT=3000`
- Webapp defaults to `5173`
- Postgres defaults to `5432`

Stop conflicting processes or change ports in `.env` (server) / Vite options (webapp).

### Demo login fails

- Ensure seed ran (server dev script runs migrate + seed).
- Verify the dev accounts list in `server/app/docs/dev-accounts.md`.
- You can test login via curl (see `server/app/docs/rest-api.md`).
