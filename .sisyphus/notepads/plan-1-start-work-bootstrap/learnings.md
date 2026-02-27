# Learnings

- The active plan continuation flow expects `.sisyphus/boulder.json` to include `worktree_path` before execution work.
- Current repo baseline is a PNPM monorepo with minimal but valid build/lint/typecheck scripts across packages.
- Shared domain contract in `client/share/src/index.ts` is the safest anchor for cross-package feature documentation.
- Full verification now passes (`pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`) after dependency installation.
