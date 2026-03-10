---
name: "playwright-interactive"
description: "Persistent browser automation for iterative UI debugging and QA using Playwright MCP tools (keep tabs alive; reload and re-check quickly)."
---

# Playwright Interactive (OpenCode)

Use a persistent Playwright browser tab/session to debug a local web app, iterate quickly after code changes, and collect QA evidence (snapshots, screenshots, console + network logs) without restarting the whole flow.

This skill is inspired by `openai/skills` `playwright-interactive`, but adapted to OpenCode's Playwright MCP tools.

## Core Ideas

- Keep the same tab alive across iterations.
- Reload after renderer-only changes; restart only when needed.
- Capture evidence continuously: a11y snapshot, screenshot, console errors/warnings, and key network requests.

## Tooling (OpenCode)

Browser session:

- `MCP_DOCKER_browser_navigate` - open URL
- `MCP_DOCKER_browser_tabs` - keep/close/select tabs
- `MCP_DOCKER_browser_click`, `MCP_DOCKER_browser_type`, `MCP_DOCKER_browser_fill_form`, `MCP_DOCKER_browser_select_option` - interactions
- `MCP_DOCKER_browser_snapshot` - accessibility-tree snapshot (preferred over screenshots for interaction targeting)
- `MCP_DOCKER_browser_take_screenshot` - visual evidence
- `MCP_DOCKER_browser_console_messages` - check console errors/warnings
- `MCP_DOCKER_browser_network_requests` - check XHR/fetch requests
- `MCP_DOCKER_browser_wait_for` - wait for UI text or time

Dev server (persistent terminal):

- `interactive_bash` (tmux) - run dev server and keep it running

## Workflow

1. Start the dev server in a persistent tmux session.
2. Open the target URL once.
3. Do a functional pass (click/type through the main flow).
4. Do a visual pass (screenshots of key states).
5. After each code change:
   - Prefer reload (navigate again) and re-run the minimal checks.
   - Only fully restart if the process ownership changed or the app needs a clean boot.

## Minimal Example

### 1) Start dev server

```text
interactive_bash: new-session -d -s dev
interactive_bash: send-keys -t dev "npm run dev -- --host 0.0.0.0 --port 5173" Enter
```

### 2) Navigate and verify load

```text
MCP_DOCKER_browser_navigate: { "url": "http://host.docker.internal:5173/" }
MCP_DOCKER_browser_console_messages: { "level": "error" }
MCP_DOCKER_browser_snapshot: {}
```

### 3) Interact + capture evidence

```text
MCP_DOCKER_browser_click: { "ref": "...", "element": "Primary button" }
MCP_DOCKER_browser_console_messages: { "level": "warning" }
MCP_DOCKER_browser_network_requests: { "includeStatic": false }
MCP_DOCKER_browser_take_screenshot: { "type": "png" }
```

### 4) Iterate after code change

Renderer-only change:

```text
MCP_DOCKER_browser_navigate: { "url": "http://host.docker.internal:5173/" }
MCP_DOCKER_browser_console_messages: { "level": "error" }
```

## What Counts As "Done" QA

- No new console errors for the main flows you touched.
- Key network requests are successful (no 4xx/5xx) for the flow.
- Screenshots captured for the states you claim are correct.
- At least one off-happy-path check (invalid input, empty state, or refresh).

## Common Pitfalls

- 404s like `/favicon.ico` are noise; fix if they hide real errors.
- If navigation fails (`net::ERR_ABORTED`), try clicking route links inside the app instead of direct goto, or reload once.
- Prefer `browser_snapshot` for actionable UI targeting; screenshots are best for visual proof.
