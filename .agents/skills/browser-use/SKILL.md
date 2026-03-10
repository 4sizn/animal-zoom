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

# 2) Fill React-controlled inputs in visible page (state-safe)
osascript -e 'tell application "Safari" to activate' \
  -e 'delay 1.2' \
  -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\");const p=document.getElementById(\"login-password\");if(!e||!p){return \"missing\";}const setVal=(el,val)=>{const proto=Object.getPrototypeOf(el);const desc=Object.getOwnPropertyDescriptor(proto,\"value\");desc.set.call(el,val);el.dispatchEvent(new Event(\"input\",{bubbles:true}));el.dispatchEvent(new Event(\"change\",{bubbles:true}));};setVal(e,\"dev1@animal-zoom.local\");setVal(p,\"password123!\");return \"filled\";})();"'

# 2.5) Click submit button after state update
osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const btn=[...document.querySelectorAll(\"button\")].find(b=>b.textContent&&b.textContent.includes(\"Sign in\"));if(!btn){return \"no-button\";}btn.click();return \"clicked\";})();"'

# 3) Verify values were populated
osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\")?.value||\"\";const p=document.getElementById(\"login-password\")?.value||\"\";return e+\"|len:\"+p.length;})();"'
```

## Done Criteria

- Safari is open on the intended page.
- Inputs are visibly filled in the live browser and submit click is performed after state-safe update.
- Verification command returns expected value signal.
- Browser stays open for user confirmation.
