
- 2026-02-27: Many items in `docs/modules/client-babylon-web-spec.md` are assumptions for MVP; revisit after we can measure FPS/memory and decide real asset pipeline + browser support.

- 2026-02-28: Automated browser route verification was blocked in this environment (chrome-devtools Target closed), so runtime route checks beyond dev-server startup still need local manual validation on /solo, /room, /my-room.

- 2026-02-28: Verified routes render via Playwright MCP against Vite dev server; remaining minor console error is missing `/favicon.ico` (404).

- 2026-02-28: Babylon `engine.activeView` canvas access is not strongly typed in our local usage, so `/room` uses guarded runtime extraction of `activeView.target` to stay crash-safe if Babylon internals or typings differ.
