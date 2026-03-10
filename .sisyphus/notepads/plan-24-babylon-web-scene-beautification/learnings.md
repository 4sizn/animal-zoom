# Learnings

- Entry: `client/babylon-web/src/main.ts` creates Engine + routes: `/solo`, `/room`, `/my-room`.
- Scene construction: `client/babylon-web/src/scene/sceneFactory.ts` (`createSingleViewSceneBase`, `createParticipantViewSceneBundle`, `createPersonalSpaces`, `createBackgroundAssets`).
- Object placement sources: `/solo` uses `client/babylon-web/src/data/personalSpaces.json`; `/my-room` builds config inline in `client/babylon-web/src/main.ts`.

- Added `applyStudioArtDirection(scene)` in `client/babylon-web/src/scene/sceneFactory.ts` to standardize clearColor + fog + key/fill/rim lighting.

- Shadows: `enableStudioShadows(scene, studioLights.key)` uses `ShadowGenerator` + `scene.onNewMeshAddedObservable` to auto-assign receivers (ground/floor/wall) and casters (everything else).

- Background geometry: `createBackgroundAssets` now uses a background root node (applies asset transform once) and builds an L-corner (back + side wall) with separate floor vs wall materials.

- Object placement tuned in both:
  - `client/babylon-web/src/data/personalSpaces.json`
  - `client/babylon-web/src/main.ts` (my-room config)

- Dev console noise: add `<link rel="icon" href="data:," />` to `client/babylon-web/index.html` to avoid `/favicon.ico` 404.
