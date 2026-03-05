# Learnings

- `/register` now reuses the same auth page layout + Tailwind tokens as `/login` and `/forgot-password` (charcoal background, centered card, input rows, primary button).
- Inputs follow the shared pattern: icon + `bg-charcoal-light/60` row + focus ring; `autoComplete=email` and `autoComplete=new-password`.
- Register success redirect keeps existing `window.location.href = "/login"` to avoid behavior changes.
