# Issues (append-only)

2026-03-02: task() subagent runs repeatedly timed out / did not apply requested changes; proceeding with direct edits to unblock plan.

2026-03-02: Docker daemon not running; `docker compose up -d` fails, blocking Postgres/MinIO startup and migration/manual auth flow verification.

2026-03-02: Server failed to start: missing `@nestjs/platform-express` (required for HTTP routes used by webapp auth flow).

2026-03-02: Manual verification: Mailtrap inbox cannot be verified without MAILTRAP_USER/MAILTRAP_PASS (currently blank); fallback logs reset token to server stdout.

2026-03-02: Web/manual verification performed via curl + node socket.io-client + docker exec SQL; browser automation tools (chrome-devtools) are unavailable (Target closed).

2026-03-02: Final manual checkbox still blocked on Mailtrap inbox verification; need valid `MAILTRAP_USER`/`MAILTRAP_PASS` (or Mailtrap API access) to confirm delivery.

2026-03-02: No `MAILTRAP_*` env vars present in shell; `chrome-devtools_*` browser automation consistently fails with `Target closed`, so UI-based inbox verification cannot be automated here.

2026-03-02: Still blocked on final plan checkbox until Mailtrap inbox receipt can be confirmed (needs creds or human confirmation).

2026-03-02
- Browser automation via chrome-devtools tools failed locally with: `Protocol error (Target.setDiscoverTargets): Target closed`.
- Root `.env` has empty `MAILTRAP_USER`/`MAILTRAP_PASS`.
- Mailtrap not configured in local `.env` (server logs `mailtrap not configured; reset token: ...`).

2026-03-02
- Tried browser automation via `browser-use` skill; CLI is not installed in this environment (`command not found`), so Mailtrap inbox cannot be checked here.
