# Webapp Zoom Layout Theme

This document describes the current design theme for the Zoom-like layouts implemented in `client/webapp/src/main.tsx`.

Goal: make the theme understandable and reusable in prompts for a design agent.

## Where The Theme Lives

- Tailwind theme extensions: `client/webapp/tailwind.config.cjs`
- Layout + component usage (authoritative): `client/webapp/src/main.tsx`
- Global CSS utilities:
  - `client/webapp/src/styles.css` (`.video-tile`, `.name-overlay`, `.aspect-video-custom`, scrollbar)

## Design Direction

- Mood: quiet, dark, "video-call" UI; emphasis on content tiles with subtle chrome
- Visual hierarchy: tiles > participant name overlays > status badges > footer controls
- Shape language: large rounded corners, soft shadows, thin rings

## Typography

From `client/webapp/tailwind.config.cjs`:

- `font-display`: `Quicksand`, fallback `Inter`, `sans-serif`
- `font-body` and `font-sans`: `Inter`, `sans-serif`

Usage in layouts:

- `FourParticipantLayout`: `font-body`
- `TwelveParticipantLayout`: `font-sans`
- `ScrollableParticipantLayout`: `font-display`

## Color Tokens

From `client/webapp/tailwind.config.cjs` (key tokens):

- Primary: `primary` = `#EF4444`
- Backgrounds:
  - `charcoal` = `#1A1A1A`
  - `charcoal-dark` = `#181A1D`
  - `charcoal-light` = `#202327`
  - `background-dark` = `#202124`
- Surfaces:
  - `surface-dark` = `#27272A`
  - `tile-bg` = `#2C2C2C`
- Controls:
  - `control-bg` = `#2D3136`
  - `control-bg-translucent` = `rgba(60, 64, 67, 0.9)`
- Overlay:
  - `overlay-plate` = `rgba(0, 0, 0, 0.4)`

Hard-coded colors used in `client/webapp/src/main.tsx`:

- Layout backgrounds: `#1a1a1a`, `#202124`
- Control buttons: `#EA4335`, `#3C4043`, `#4a4e52`, `#5F6368`
- Rings: `ring-white/5`, `ring-white/10`
- Borders: `border-white/5`

## Radius / Shadows / Rings

From `client/webapp/tailwind.config.cjs`:

- Default radius: `12px`
- Larger radii: `lg 16px`, `xl 24px`, `2xl 32px`

Usage patterns:

- Tiles: `rounded-xl` or `rounded-2xl`, `shadow-lg` or `shadow-2xl`, `ring-1 ring-white/5` or `/10`
- Status badges: small `rounded-full` with `backdrop-blur-*`
- Footer shadow: `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]`

## Icon System

Two icon families are used:

- Material Symbols:
  - Class: `.material-symbols-outlined`
  - Optional filled style: `.material-symbols-outlined.filled`
  - CSS lives in `client/webapp/src/styles.css`
- Material Icons Round:
  - Class: `.material-icons-round`

Do not mix new icon sets into the layout without a deliberate migration.

## Layout Variants

All variants render full-height and assume a dark theme.

### Variant A: FourParticipantLayout

File: `client/webapp/src/main.tsx`.

- Background: `bg-[#1a1a1a]`
- Grid: 1 column mobile, 2 columns desktop (`md:grid-cols-2`)
- Tiles:
  - `rounded-2xl`, `shadow-2xl`, `aspect-video-custom`, `bg-[#2c2c2c]`
  - Name label: bottom-left text only
  - Speaking indicator: top-right pulse badge (`bg-blue-600/90`, `animate-pulse`)
- Footer:
  - Center control cluster of circular buttons
  - Leave + mic use red accent

### Variant B: TwelveParticipantLayout

- Background: `bg-charcoal-dark`
- Grid: 2/3/4 columns (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)
- Tiles:
  - `aspect-video`, `rounded-xl`, `bg-charcoal-light`, `ring-1 ring-white/5`, `shadow-lg`
  - Overlays:
    - soft top-to-bottom gradient (`from-black/40`)
    - name plate: `bg-overlay-plate` + light blur
- Footer:
  - Compact control buttons; uses `bg-primary` and `bg-control-bg`
  - Accessible focus rings are present via Tailwind focus classes

### Variant C: ScrollableParticipantLayout

- Background: `bg-[#202124]`
- Main region scrolls; custom scrollbar styling in `client/webapp/src/styles.css`
- Tiles:
  - `.video-tile` utility + `bg-surface-dark` + `rounded-2xl` + `ring-1 ring-white/10`
  - Name overlay uses `.name-overlay` gradient
- Footer:
  - Controls centered (absolute centering)
  - Red badges for mic-off

## Tile Anatomy (Reusable Rules)

- Always keep 16:9 (`aspect-video` or `.aspect-video-custom` / `.video-tile`)
- Image always uses `object-cover`
- Prefer a subtle ring (`ring-1 ring-white/5` or `/10`) instead of heavy borders
- Name overlay should be readable on any background:
  - either a gradient overlay (`.name-overlay`) or a translucent plate (`bg-overlay-plate`)

## Interaction / Motion

- Hover zoom on tile image: `transition-transform duration-500 group-hover:scale-105`
- Speaking indicator uses `animate-pulse`
- Buttons use `transition-colors` and optional `active:scale-95`

Avoid adding additional motion unless it supports call-state feedback.

## Prompt Block (Copy/Paste)

Use this in a design agent prompt to preserve the current theme:

```
Design theme for Zoom-like layouts:
- Dark, quiet video-call UI with content-first tiles.
- Tailwind tokens: primary=#EF4444; charcoal-dark=#181A1D; charcoal-light=#202327; surface-dark=#27272A; overlay-plate=rgba(0,0,0,0.4).
- Typography: Inter for body, Quicksand for display (font-display).
- Shape: large rounded corners (rounded-xl/2xl), soft shadows (shadow-lg/2xl), thin rings (ring-1 ring-white/5 or /10).
- Tile rules: 16:9 aspect, object-cover imagery, name overlay via gradient (.name-overlay) or plate (bg-overlay-plate + blur).
- Controls: circular buttons; red accent for mic/leave; subtle gray for other controls.
- Icons: Material Symbols Outlined (optionally filled) and Material Icons Round; do not introduce new icon families.
- Motion: hover zoom scale-105, duration-500; speaking badge pulse.
```
