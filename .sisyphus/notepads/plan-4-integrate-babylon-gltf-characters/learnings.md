# Learnings

- Phase 1 proof can stay localized to `src/main.ts` by keeping scene bundle creation synchronous and kicking off an async `SceneLoader.ImportMeshAsync` only in the `/solo` route branch.
- Using `SceneLoader.ImportMeshAsync("", "/assets/characters/apollo/", "scene.gltf", scene)` preserves relative texture resolution under the character asset root URL.
- A simple camera fit works well by computing world-space min/max over imported visible meshes and setting ArcRotateCamera target/radius from that bounding box.
- `@babylonjs/loaders` import registration is required in the runtime path (`import "@babylonjs/loaders/glTF";`) for glTF import plugin activation.

- `/room` participant name overlay works best by wrapping each `canvas.room-canvas` in a `div.room-tile` (position: relative) and rendering an absolutely-positioned label inside the wrapper; keep IntersectionObserver targeting the canvas.

- Speaking highlight can be a pure CSS hook on the tile wrapper (e.g. `.room-tile-speaking` with outline/box-shadow); demo toggling can be static or driven by state later.
- Phase 2 loader utility can avoid unhandled rejections by containing `SceneLoader.ImportMeshAsync` in `try/catch` and always returning either imported meshes or fallback proxy meshes.
- Mapping `AvatarType` directly to character asset root URLs (not full file paths) keeps `ImportMeshAsync("", rootUrl, "scene.gltf", scene)` compatible with relative texture/bin references.
- In `main.ts`, route-safe async solo initialization works best by request-token gating plus route checks before registration; stale resolved bundles must be disposed immediately to avoid scene leaks.
- Keeping `engine.registerView` deferred until after `createSingleViewSceneBundleAsync` resolves prevents invalid-camera registration during load and keeps `/solo` crash-safe with an empty canvas interim state.
- Participant view scenes can keep a synchronous factory API by creating the existing `${participantId}-avatar-proxy` mesh immediately, then starting `loadCharacterByAvatarType` in the background and hiding the proxy only when the resolved mesh set is not the loader's fallback proxy pair and the scene is still live.

- Hands-on QA can be automated headlessly via Playwright without adding repo deps: `pnpm dlx --package=playwright@<ver> playwright install chromium`, then run Node with `NODE_PATH` pointing at the dlx `node_modules` to `require('playwright')`.

- Participant camera framing needs an explicit clamp; current heuristic uses `radius = clamp(maxSize * 0.8, 1.2, 2.8)` and sets `alpha=-PI/2`, `beta=PI/3` after load.
- For `/room` readability in small tiles, recomputing world-space bounds on enabled, vertex-bearing loaded meshes (`computeWorldMatrix(true)` first) and fitting participant `ArcRotateCamera` target/radius to that box gives a much tighter avatar silhouette than a fixed radius.
- For 12-tile `/room` layouts, a tighter participant fit works better with `camera.radius` clamped to `Math.min(Math.max(maxSize * 0.8, 1.2), 2.8)` and fixed `alpha/beta` (`-PI/2`, `PI/3`) to avoid distant framing drift.
