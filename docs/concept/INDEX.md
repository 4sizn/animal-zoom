# Concept Index

This folder stores user-provided reference resources that implementations must match.

## Current Resources

- `docs/concept/zoom-grid-1.png`
- `docs/concept/zoom-grid-2.png`
- `docs/concept/zoom-grid-3.png`

## Upcoming

- `docs/concept/babylon-3d-character/README.md`

## How To Add A New Concept

Create a new folder under `docs/concept/`:

- `docs/concept/<slug>/README.md`
- `docs/concept/<slug>/assets/` (screenshots, diagrams, exported HTML, etc)
- Optional: `docs/concept/<slug>/links.md` (URLs with context)

Use `docs/templates/concept.md` as the starting point.

## Referencing Rules (For Work Plans)

When you ask the agent to implement something based on concept resources:

- Always cite exact paths (and optional line numbers/sections)
- List the acceptance criteria in the plan as checkboxes
- If there are multiple references (e.g. multiple screens), enumerate them explicitly
