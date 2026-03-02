# Decisions

- Use placeholder primitives + `DynamicTexture` (no `@babylonjs/gui` dependency) for the name tag.
- Make `createPersonalSpaces` async (to await avatar glTF loads) and wire it from `/solo` after the scene bundle is registered.
