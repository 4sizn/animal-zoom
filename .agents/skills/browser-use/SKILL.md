---
name: browser-use
description: Priority browser automation path for this repo: use a real Safari window with AppleScript to show live form entry to users. Use this first for similar requests.
allowed-tools: Bash
---

# Browser Automation Priority (Project Standard)

For this repository, the first and default strategy for requests like "open browser and auto-fill so user can see it" is:

1. Open a real Safari window on the target URL.
2. Fill fields with AppleScript (`osascript`) by DOM id/selectors.
3. Keep the browser open so the user can directly see the filled state.
4. Verify by reading field values via JavaScript execution in Safari.

All alternative flows (headless/browser-use indices/screenshots-first) are intentionally removed from this skill to enforce one consistent behavior.

## Canonical Commands

```bash
# 1) Open real browser window
open -a Safari "http://127.0.0.1:5173/login"

# 2) Fill inputs in visible page
osascript -e 'tell application "Safari" to activate' \
  -e 'delay 1.2' \
  -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\");const p=document.getElementById(\"login-password\");if(!e||!p){return \"missing\";}e.focus();e.value=\"dev1@animal-zoom.local\";e.dispatchEvent(new Event(\"input\",{bubbles:true}));p.focus();p.value=\"password123!\";p.dispatchEvent(new Event(\"input\",{bubbles:true}));return \"filled\";})();"'

# 3) Verify values were populated
osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\")?.value||\"\";const p=document.getElementById(\"login-password\")?.value||\"\";return e+\"|len:\"+p.length;})();"'
```

## Done Criteria

- Safari is open on the intended page.
- Inputs are visibly filled in the live browser.
- Verification command returns expected value signal.
- Browser stays open for user confirmation.
