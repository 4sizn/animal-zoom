# Live Browser Auto-Control (Priority Standard)

This guide defines the highest-priority implementation for requests such as:

- "Open the browser and type values automatically"
- "Show it in the browser, not as PNG"

## Priority Strategy (Default)

Use a real Safari browser window and AppleScript automation first.

Do not prioritize screenshot-only, headless-first, or abstract-only flows for this request type.

## Standard Procedure

1. Open target page in Safari.
2. Fill target inputs by DOM selectors/ids via AppleScript JavaScript execution.
3. Verify values through a JavaScript return value.
4. Keep browser window open for the user.

## Reference Commands

```bash
open -a Safari "http://127.0.0.1:5173/login"

osascript -e 'tell application "Safari" to activate' \
  -e 'delay 1.2' \
  -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\");const p=document.getElementById(\"login-password\");if(!e||!p){return \"missing\";}e.focus();e.value=\"dev1@animal-zoom.local\";e.dispatchEvent(new Event(\"input\",{bubbles:true}));p.focus();p.value=\"password123!\";p.dispatchEvent(new Event(\"input\",{bubbles:true}));return \"filled\";})();"'

osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\")?.value||\"\";const p=document.getElementById(\"login-password\")?.value||\"\";return e+\"|len:\"+p.length;})();"'
```

## Scope of Deletion

For related browser-control docs in this repository, alternative method descriptions were removed to keep one default path.
