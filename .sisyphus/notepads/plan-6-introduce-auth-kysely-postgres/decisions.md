# Decisions (append-only)

2026-03-02: Avoid Nest HTTP parameter decorators due to Biome LSP parse errors; HTTP endpoints are registered directly on the underlying adapter in `server/app/src/main.ts`.

2026-03-02: Added `@nestjs/platform-express` + `express` to support HTTP routes required by the webapp auth flow.
