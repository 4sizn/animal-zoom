# Learnings

- `/my-room` already renders an `<aside>` with 2 `<select>` controls and change listeners via `registerMyRoomControls` in `client/babylon-web/src/main.ts`.
- `/my-room` scene currently uses `createSingleViewSceneBundle` (sync) and applies theme/avatar by mutating clearColor and the avatar proxy material.

- Updated `/my-room` to rebuild a PersonalSpace scene on select change; it uses `createSingleViewSceneBundleAsync` + `createPersonalSpaces`.
- For validation/debug, `window.__myRoomScene` is set to the active `/my-room` Babylon Scene.
