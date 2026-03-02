# Work Plan: <title>

## Goal

Describe the deliverable in one sentence.

## References (Must Read)

| Ref | Path | Why it matters | Non-negotiables extracted |
|---|---|---|---|
| 1 | `docs/concept/<slug>/README.md` | | |
| 2 | `docs/concept/<slug>/assets/screen.png` | | |
| 3 | `docs/requirements/<area>.md` | | |

## Scope

- In scope:
- Out of scope:

## Requirements

- Functional:
- Non-functional:

## Verification

- Local commands that must pass:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`

## Work Items

- [ ] Task 1:
- [ ] Task 2:
- [ ] Task 3:

## Notes

Anything the implementer must not miss.

- OpenCode delegation guard: in any `task()` call, use `run_in_background` (boolean). Do not use `run_background`.
- Parallel-first guard: if subtasks are independent, run them in parallel with `run_in_background: true`.
- Sequential exception: use `run_in_background: false` only for dependency-ordered steps.
