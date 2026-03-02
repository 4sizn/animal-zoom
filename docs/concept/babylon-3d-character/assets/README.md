# Babylon 3D Character Assets (Source)

`docs/concept/babylon-3d-character/assets/` is the *source* bundle for character assets used in the Babylon concept work.

This directory is intentionally organized so that an AI (and humans) can reliably answer:
- What is the runtime-loadable model entrypoint?
- Where are rigging/animation notes stored?
- Where would character sounds live?
- What is the license/provenance for each asset?

## Directory Layout

Each character folder follows this layout:

```
<character-id>/
  manifest.json
  license.txt
  model/
    scene.gltf
    scene.bin
    textures/
  rig/
    README.md
  sound/
    README.md
```

### model/

- Runtime-loadable glTF content.
- Keep `scene.gltf`, `scene.bin`, and `textures/` together to preserve relative paths.

### rig/

- Authoring/rigging notes (and optionally source files like `.blend`/`.fbx` in the future).
- If the runtime model has a skeleton but no animation clips, capture that in `rig/README.md`.

### sound/

- Character SFX/voice assets (planned).
- Keep audio files in this folder and register them in `manifest.json`.

## manifest.json (Per Character)

`manifest.json` is the primary index for AI tooling. Minimal required fields:

- `id`: stable folder id (must match directory name)
- `displayName`: human-friendly name
- `source`: where it came from (URL or note)
- `license.file`: path to `license.txt`
- `model.entry`: runtime entrypoint (usually `model/scene.gltf`)
- `animation.hasAnimations`: whether the glTF has an `animations` array

The schema is intentionally small; add fields only when they are genuinely needed.
