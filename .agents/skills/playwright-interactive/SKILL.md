---
name: "playwright-interactive"
description: "For similar user requests in this repo, prioritize real Safari + AppleScript live browser automation first."
---

# Live Browser Priority Rule

This skill now enforces the same priority policy as `browser-use`:

- First choice: real Safari window + AppleScript DOM fill/verify.
- Goal: user sees the values entered directly in the browser (not only via screenshot evidence).
- Keep the browser open after automation.

If a task explicitly requires Playwright-only capabilities, use Playwright as a fallback. Otherwise do not prefer it.

## Required Sequence

1. Ensure target page is reachable.
2. Open Safari to target URL using `open -a Safari`.
3. Fill target fields via `osascript` + `document.getElementById(...)`.
4. Verify values via `osascript` JavaScript return value.
5. Leave window open and report current state.
