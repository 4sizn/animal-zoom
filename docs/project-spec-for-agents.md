# Animal Zoom Project Spec (Agent-Oriented)

## 1) Document Purpose

This document defines the current project baseline and execution requirements so coding agents can work safely and consistently.

- Scope: repository-level spec for architecture, requirements, interfaces, run/test rules, and delivery criteria.
- Audience: coding agents and maintainers.
- Source of truth: actual code in this repository takes precedence over assumptions.

## 2) Project Snapshot (Current State)

This is a PNPM monorepo with client and server packages.

- Workspace root scripts:
  - `pnpm build`
  - `pnpm dev`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm typecheck`
- Server:
  - `server/app` (NestJS + Socket.IO gateway)
  - `server/minio` (MinIO config loader module)
- Client:
  - `client/webapp` (React + Vite)
  - `client/babylon-web` (Babylon.js + Vite)
  - `client/share` (shared TypeScript interfaces)

## 3) Product Intent

Animal Zoom provides synchronized zoom interaction for animal-focused views.

- Shared model (`@animal-zoom/share`) defines zoom entities/state.
- Realtime channel (`server/app`) relays zoom updates over Socket.IO namespace `/zoom`.
- Web clients consume shared models and present UI/scene rendering.

## 4) Functional Requirements

### FR-1 Shared Domain Contracts

- Define and maintain shared interfaces in `client/share/src/index.ts`:
  - `ZoomAnimal`
  - `ZoomPosition`
  - `ZoomState`
- Any cross-package data shape change must be made in shared contracts first.

### FR-2 Realtime Zoom Broadcast

- Gateway listens on Socket.IO namespace `/zoom`.
- On `zoom:update` message, server broadcasts `zoom:updated` payload to other clients.
- Payload shape must include:
  - `animalId: string`
  - `x: number`
  - `y: number`
  - `scale: number`

### FR-3 Client Rendering Baseline

- `client/webapp` renders a basic animal list from shared types.
- `client/babylon-web` boots Babylon engine + scene + camera + light and render loop.

### FR-4 MinIO Configuration Baseline

- `server/minio` provides environment-based config parsing.
- Defaults currently expected:
  - `MINIO_ENDPOINT=localhost`
  - `MINIO_PORT=9000`
  - `MINIO_USE_SSL=false`
  - `MINIO_ACCESS_KEY=minioadmin`
  - `MINIO_SECRET_KEY=minioadmin`
  - `MINIO_BUCKET=animal-zoom`

## 5) Non-Functional Requirements

- Type safety first: strict TypeScript checks via package `lint`/`typecheck` scripts.
- Build integrity: root `pnpm build` should complete across all packages.
- Test policy: keep package test scripts executable, even if currently placeholder.
- Low coupling: share cross-package contracts via `@animal-zoom/share`.

## 6) Architecture and Responsibilities

### Module Responsibilities

- `server/app`
  - Owns websocket gateway behavior and connection lifecycle logging.
- `server/minio`
  - Owns MinIO connection configuration loading.
- `client/share`
  - Owns shared domain type contracts.
- `client/webapp`
  - Owns React UI entry and list-level presentation baseline.
- `client/babylon-web`
  - Owns Babylon runtime initialization and scene render loop.

### Data and Event Flow

1. Client emits `zoom:update` with zoom payload.
2. Gateway receives payload.
3. Gateway broadcasts `zoom:updated` to other clients.

## 7) Agent Implementation Rules

When agents implement changes, follow these rules:

1. Do not edit symlink mirrors directly (`.agent/skills`, `.claude/skills`, `.cline/skills`) when working on skill content.
2. Keep data contracts in `client/share` synchronized with event payload usage in server/client packages.
3. Avoid introducing breaking payload changes without updating all producers/consumers in the same change.
4. Prefer minimal, verifiable increments and keep scripts passing.
5. For docs/spec updates, only state behavior verified from repository code.
6. For OpenCode subagent delegation, use `task(..., run_in_background: boolean, ...)`; never use `run_background`.
7. For independent exploration/research subtasks, default to parallel background execution (`run_in_background: true`) and collect results later.
8. Use foreground execution (`run_in_background: false`) only when a task's output is required immediately for the next step.

## 8) Acceptance Criteria for Agent Tasks

A change is complete only when all are true:

- Relevant code and docs updated consistently.
- `pnpm lint` passes.
- `pnpm test` passes.
- `pnpm typecheck` passes.
- If build-impacting: `pnpm build` passes.

## 9) Known Gaps (Current)

- Most package tests are placeholder scripts (`no tests yet`).
- Product-level feature requirements beyond baseline scaffolding are not yet fully formalized in repo docs.

## 10) Suggested Next Documentation

For stronger agent execution quality, add:

- `docs/requirements.md`: prioritized user stories and acceptance tests.
- `docs/architecture.md`: system boundaries, sequence diagrams, deployment context.
- `docs/api-events.md`: websocket event contract versioning and examples.
- `docs/roadmap.md`: implementation milestones and definition of done.

## 10.1) Docs Workflow (Recommended)

- Start here: `docs/INDEX.md`
- Put user reference resources under: `docs/concept/INDEX.md`
- Keep evolving requirements under: `docs/requirements/INDEX.md`
- Write work plans under: `docs/plans/INDEX.md` (use templates in `docs/templates/`)

## 11) Module Specs (Templates)

Use these module-level templates for detailed, agent-friendly specs:

- `docs/modules/client-webapp-spec.md`
- `docs/modules/client-babylon-web-spec.md`
- `docs/modules/client-share-spec.md`
