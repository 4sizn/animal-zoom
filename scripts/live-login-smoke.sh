#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBAPP_URL="${WEBAPP_URL:-http://127.0.0.1:5173/login}"
EMAIL="${LOGIN_EMAIL:-dev1@animal-zoom.local}"
PASSWORD="${LOGIN_PASSWORD:-password123!}"

mkdir -p "$ROOT_DIR/test-results"
STAMP="$(date +%Y%m%d-%H%M%S)"
PNG_TS="$ROOT_DIR/test-results/live-login-success-${STAMP}.png"
PNG_LATEST="$ROOT_DIR/test-results/live-login-success-latest.png"
JSON_LATEST="$ROOT_DIR/test-results/live-login-success-latest.json"
HTML_TS="$ROOT_DIR/test-results/live-login-success-${STAMP}.html"
HTML_LATEST="$ROOT_DIR/test-results/live-login-success-latest.html"

osascript \
  -e 'tell application "Safari" to activate' \
  -e "tell application \"Safari\" to set URL of front document to \"${WEBAPP_URL}\"" \
  -e 'delay 1.6' \
  -e "tell application \"Safari\" to tell front document to do JavaScript \"(function(){const email=document.getElementById('login-email');const pw=document.getElementById('login-password');if(!email||!pw){return 'missing';}const setVal=(el,val)=>{const proto=Object.getPrototypeOf(el);const desc=Object.getOwnPropertyDescriptor(proto,'value');desc.set.call(el,val);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};setVal(email,'${EMAIL}');setVal(pw,'${PASSWORD}');return 'filled';})();\"" \
  -e 'delay 0.25' \
  -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const btn=[...document.querySelectorAll(\"button\")].find((b)=>b.textContent&&b.textContent.includes(\"Sign in\"));if(!btn){return \"no-button\";}btn.click();return \"clicked\";})();"' \
  -e 'delay 1.6'

STATUS_JSON="$(osascript -e 'tell application "Safari" to tell front document to do JavaScript "(function(){const err=document.body.innerText.includes(\"invalid credentials\");const token=localStorage.getItem(\"auth_token\");const statusText=document.body.innerText.includes(\"Token: present\");return JSON.stringify({ok:!err&&!!token&&statusText,err,hasToken:!!token,statusText,url:location.href,at:new Date().toISOString()});})();"')"

printf '%s\n' "$STATUS_JSON" > "$JSON_LATEST"

if [[ "$STATUS_JSON" != *'"ok":true'* ]]; then
  echo "Login smoke failed: $STATUS_JSON"
  exit 1
fi

PAGE_HTML="$(osascript -e 'tell application "Safari" to tell front document to do JavaScript "document.documentElement.outerHTML"')"
printf '%s\n' "$PAGE_HTML" > "$HTML_TS"
cp "$HTML_TS" "$HTML_LATEST"

if screencapture -x "$PNG_TS"; then
  cp "$PNG_TS" "$PNG_LATEST"
else
  echo "WARN: PNG capture unavailable in current environment; HTML snapshot saved instead."
fi

echo "OK: $STATUS_JSON"
echo "Snapshot (png): $PNG_TS"
echo "Latest   (png): $PNG_LATEST"
echo "Snapshot (html): $HTML_TS"
echo "Latest   (html): $HTML_LATEST"
echo "Status:   $JSON_LATEST"
