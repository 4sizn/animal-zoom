# Decisions

- Bucket name: `assets` (single bucket for now).
- Object key layout (mirror `client/babylon-web/public/assets/` so we can seed by copying that directory):
  - `characters/<avatarType>/model/scene.gltf` (+ referenced `scene.bin`, `textures/*`)
  - `personal-space/**` (glTF/glb + textures)
- Webapp requests presigned URLs by object key (e.g. `characters/apollo/model/scene.gltf`).

- Presign defaults (Approach B):
  - Method: `GET` only (read-only)
  - TTL: 10 minutes (dev), revisit for prod
  - Key allowlist: restrict to known prefixes (`characters/`, `personal-space/`) to avoid arbitrary object reads
