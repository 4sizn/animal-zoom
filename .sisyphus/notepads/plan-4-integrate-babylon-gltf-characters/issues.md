# Issues

- `pnpm --filter @animal-zoom/babylon-web build` currently fails in this worktree with `ENOENT` for `client/babylon-web/public/assets/characters/apollo` during Vite public dir copy. This is an environment/assets-link issue, not a TypeScript compile issue.

- Resolved: the `public/assets/characters/*` symlinks were broken (too few `../`); after relinking to `../../../../../docs/concept/babylon-3d-character/assets/...`, `pnpm --filter @animal-zoom/babylon-web build` passes.
- No new blocking issue in Phase 2 utility implementation; loader fallback path now handles glTF failures without surfacing uncaught promise rejections.
- No new blocking issue in Phase 2 `main.ts` async integration; `/solo` route transitions stayed crash-safe by invalidating pending loads and disposing stale bundles.
