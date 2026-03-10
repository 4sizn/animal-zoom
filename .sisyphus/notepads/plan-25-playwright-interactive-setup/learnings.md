# Learnings

- Upstream skill location: `openai/skills` -> `skills/.curated/playwright-interactive/`.
- Upstream contents (via GitHub contents API):
  - `SKILL.md` (Codex `js_repl`-based persistent Playwright session workflow)
  - `LICENSE.txt`, `NOTICE.txt`
  - `agents/openai.yaml`
  - `assets/playwright-small.svg`, `assets/playwright.png` (binary)

- Local vendoring decision: copied `LICENSE.txt`, `NOTICE.txt`, `agents/openai.yaml`, and `assets/playwright-small.svg`; skipped `assets/playwright.png` (binary).
