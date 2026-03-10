# Live Browser Auto-Control (Priority Standard)

This guide defines the highest-priority implementation for requests such as:

- "Open the browser and type values automatically"
- "Show it in the browser, not as PNG"

## Priority Strategy (Default)

Use a real Safari browser window and AppleScript automation first.

Do not prioritize screenshot-only, headless-first, or abstract-only flows for this request type.

## Standard Procedure

1. Open target page in Safari.
2. Fill target inputs by DOM selectors/ids via native value setter + `input/change` event dispatch (React-safe).
3. Click submit after state update.
4. Verify values through a JavaScript return value.
5. Keep browser window open for the user.

## Reference Commands

```bash
open -a Safari "http://127.0.0.1:5173/login"

osascript -e 'tell application "Safari" to activate' \
  -e 'delay 1.2' \
  -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\");const p=document.getElementById(\"login-password\");if(!e||!p){return \"missing\";}const setVal=(el,val)=>{const proto=Object.getPrototypeOf(el);const desc=Object.getOwnPropertyDescriptor(proto,\"value\");desc.set.call(el,val);el.dispatchEvent(new Event(\"input\",{bubbles:true}));el.dispatchEvent(new Event(\"change\",{bubbles:true}));};setVal(e,\"dev1@animal-zoom.local\");setVal(p,\"password123!\");return \"filled\";})();"'

osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const btn=[...document.querySelectorAll(\"button\")].find(b=>b.textContent&&b.textContent.includes(\"Sign in\"));if(!btn){return \"no-button\";}btn.click();return \"clicked\";})();"'

osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const e=document.getElementById(\"login-email\")?.value||\"\";const p=document.getElementById(\"login-password\")?.value||\"\";return e+\"|len:\"+p.length;})();"'
```

## Scope of Deletion

For related browser-control docs in this repository, alternative method descriptions were removed to keep one default path.

## Instant Smoke Test Command

Run this to perform live login automation and save a success snapshot for future requests:

```bash
./scripts/live-login-smoke.sh
```

Artifacts:

- Latest snapshot: `test-results/live-login-success-latest.png`
- Timestamped snapshot: `test-results/live-login-success-YYYYMMDD-HHMMSS.png`
- Latest status JSON: `test-results/live-login-success-latest.json`
