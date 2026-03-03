# Learnings

- Current character glTF assets under `client/babylon-web/public/assets/characters/*/model/scene.gltf` do not appear to contain an `animations` array (so `scene.animationGroups` is likely empty).
- To support reliable animation targeting, we should create a TransformNode per avatar asset id and parent loaded avatar meshes under it.
