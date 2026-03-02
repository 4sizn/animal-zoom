# Learnings

- `client/babylon-web/src/main.ts` already uses an async scene init path for `/solo` via `createSingleViewSceneBundleAsync`.
- `tsconfig.base.json` enables `resolveJsonModule`, so `src/data/*.json` can be imported directly from TS.
- Manual QA can be automated via Playwright MCP: navigate to `http://localhost:5173/solo`, screenshot, and `browser_evaluate` to inspect `window.__soloScene`.
- `window.__soloScene.getTransformNodeByName('space-001')` exists and mutating `position.x += 1` updates to `1` (verified via Playwright eval).
