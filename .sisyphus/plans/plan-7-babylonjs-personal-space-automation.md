# plan-7-babylonjs-personal-space-automation

- [x] Read and align scope with `docs/plans/2026-03-02-babylonjs-personal-space-automation.md`
- [x] Add JSON config scaffold at `client/babylon-web/src/data/personalSpaces.json` (one or more PersonalSpace entries)
- [x] Add types/helpers for PersonalSpace + AssetSpec under `client/babylon-web/src/scene/` (new file ok)
- [x] Implement `createPersonalSpaces(scene, config)` in `client/babylon-web/src/scene/sceneFactory.ts` (TransformNode root per space; asset order: background -> furniture -> avatar -> light -> ui)
- [x] Implement `focusCameraOnDesk(scene, spaceNode)` in `client/babylon-web/src/scene/sceneFactory.ts` (target desk center or space center; fixed distance/height)
- [x] Implement `generateGridPositions(count, cellSize, spacing)` helper (new file ok) and use it when config positions are missing
- [x] Implement minimal asset creators (placeholders) for: background (wall/floor planes), desk/chair/plant (primitive meshes), local lights (point/spot), name tag (plane + DynamicTexture)
- [x] Wire `personalSpaces.json` into an existing route (recommended: `/solo`) via `client/babylon-web/src/main.ts` so manual verification is possible
- [x] Manual verification: run `pnpm --filter @animal-zoom/babylon-web dev` and confirm spaces spawn + camera focus is correct
- [x] Manual customization verification: in browser console, update `window.__soloScene.getTransformNodeByName(<space-id>).position.x += 1` and confirm immediate visual movement
- [x] Automated verification:
- [x] Run `pnpm --filter @animal-zoom/babylon-web lint`
- [x] Run `pnpm --filter @animal-zoom/babylon-web typecheck`
- [x] Run `pnpm --filter @animal-zoom/babylon-web build`
