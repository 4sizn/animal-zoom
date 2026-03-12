## plan-34 Task 1 - prod-readiness UX evidence (2026-03-12)

### 1) `/login` shows dev/debug UI and "UI only for now; backend wiring comes later."
- Repro steps:
  1. Open `http://localhost:5173/login` (desktop viewport).
  2. If previously logged in, click `Logout` once.
  3. Confirm debug/status and footer copy are visible in the login card.
- Expected vs actual:
  - Expected: production login view should not expose debug status or placeholder copy.
  - Actual: debug/status and placeholder copy are visible in primary UI.
- Visible on-screen strings:
  - `Token: none`
  - `WebSocket: disconnected`
  - `UI only for now; backend wiring comes later.`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue1-login-debug-ui-desktop.png`

### 2) `/login` shows `Logout` / confusing `Dashboard` affordance while logged out
- Repro steps:
  1. Open `http://localhost:5173/login`.
  2. Confirm logged-out indicators (`Token: none`, `WebSocket: disconnected`).
  3. Observe bottom navigation/action links.
- Expected vs actual:
  - Expected: logged-out login page should avoid privileged/confusing routes.
  - Actual: `Dashboard` link is visible in logged-out state; `Logout` was observed only when token was present earlier in same session.
- Visible on-screen strings:
  - `Dashboard`
  - `Create account`
  - `Forgot password`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue2-login-logout-dashboard-while-logged-out.png`

### 3) Mobile demo login can leave login UI visible (requires retry/reload behavior)
- Repro steps:
  1. Open `http://localhost:5173/login`.
  2. Resize to mobile width (Safari window ~`390px` wide).
  3. Click `Continue as demo`.
  4. Observe route and on-screen state.
- Expected vs actual:
  - Expected: successful demo login should navigate to dashboard/study flow and replace login UI.
  - Actual: page stays on `/login` with login UI still visible; `invalid credentials` appears.
- Visible on-screen strings:
  - `Continue as demo`
  - `invalid credentials`
  - `Welcome back.`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue3-mobile-demo-login-stuck-ui.png`

### 4) `/room/create` validation inconsistency (filled submit still shows required; empty submit native Korean tooltip)
- Repro steps:
  1. Open `http://localhost:5173/room/create`.
  2. Click `Create demo room` with empty input.
  3. Capture native validation message from input (`validationMessage`) and tooltip.
  4. Enter `My demo room` in `Room name`.
  5. Click `Continue as demo`.
  6. Observe in-page validation text.
- Expected vs actual:
  - Expected: empty submit shows consistent product-level validation; filled submit should proceed.
  - Actual: empty submit triggers native browser required prompt in Korean; filled submit still shows `Room name is required.` in-page.
- Visible on-screen strings:
  - `Room name is required.`
  - Native validation message: `이 필드를 채우십시오.`
  - `Create demo room`
  - `Continue as demo`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue4-empty-submit-native-required-korean.png`
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue4-filled-input-still-required-error.png`

### 5) `/room/study/*` chat send path does not yield visible message result
- Repro steps:
  1. Open `http://localhost:5173/room/study/demo-room`.
  2. Open chat panel (already visible in current layout).
  3. Attempt to use message/send controls.
- Expected vs actual:
  - Expected: message send path should provide visible message feedback in chat timeline.
  - Actual: unauthenticated state blocks interaction (`Sign in to join live room chat.` and disabled send), so message rendering path cannot be completed; no in-UI error surfaced explaining send failure path beyond sign-in gate.
- Visible on-screen strings:
  - `Sign in to join live room chat.`
  - `Message`
  - `send`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue5-study-chat-send-no-render.png`

### 6) `/room/study/*` pluralization/layout issue (`1 people`) + mobile clipping/overlap
- Repro steps:
  1. Open `http://localhost:5173/room/study/demo-room` (desktop then mobile width).
  2. Check participant-count label text.
  3. Resize to mobile width (~`390px`) and observe room/chrome overlap behavior.
- Expected vs actual:
  - Expected: correct singular/plural grammar and non-overlapping mobile layout.
  - Actual: mobile viewport shows dense/clipped stacking in the participant/video/chrome region; in this run pluralization rendered as `17 people` (target `1 people` text was not observed with available room data).
- Visible on-screen strings:
  - `17 people`
  - `Chat`
  - `close`
- Console errors (if any):
  - Captured runtime error events via Safari JS hooks: none (`[]`).
- Screenshot file path(s):
  - `.sisyphus/notepads/plan-34-prod-readiness-ux-hardening/screenshots/issue6-study-mobile-layout-clipping-overlap.png`

### URL verification notes
- `http://localhost:5173/login`: directly reachable and reproducible.
- `http://localhost:5173/dashboard`: redirects to `http://localhost:5173/login?next=%2Fdashboard` in current auth state.
- `http://localhost:5173/room/create`: directly reachable and reproducible.
- `http://localhost:5173/room/study/demo-room`: directly reachable and reproducible.
