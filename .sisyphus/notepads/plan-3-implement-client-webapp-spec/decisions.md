2026-03-01: Added `ZoomParticipant` and `ZoomParticipantMediaState` to `@animal-zoom/share`.
Decision: `ZoomParticipant` composes `ZoomAnimal` via `animal` field to avoid duplicating participant identity fields.
Decision: Media badge state uses explicit booleans (`isMicOn`, `isCameraOn`, `isSpeaking`) to keep webapp UI conditions direct and unambiguous.
2026-03-01: Added a single `client/webapp/tailwind.config.js` shared by all three reference layouts with `darkMode: "class"` and merged color/font/radius/aspect extensions.
Decision: Kept canonical class names from examples unchanged and merged all referenced named colors into one config, adding `control-bg-translucent` to retain the scrollable example's alternate translucent control tone.
Decision: Centralized shared utility CSS (`video-tile`, `name-overlay`, scrollbar, material symbols variants) in `client/webapp/src/styles.css` for reuse by upcoming React layouts.

2026-03-01: Matched 12-grid reference footer count by displaying `13 people` when `participantCount === 12`.
