# Decisions

- Use a reusable `applyStudioArtDirection(scene)` in `client/babylon-web/src/scene/sceneFactory.ts` to unify clearColor, fog, and key/fill/rim lights across `/solo`, `/room`, and `/my-room`.

- Use `DefaultRenderingPipeline` + `scene.imageProcessingConfiguration` for a lightweight, built-in postprocess pass (ACES tonemapping + subtle bloom) without adding deps.
