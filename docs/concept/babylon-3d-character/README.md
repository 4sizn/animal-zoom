# Concept: babylon-3d-character

## Intent

Define the concept resources and acceptance checklist for a 3D character that runs in Babylon (`client/babylon-web`).

## Reference Assets

Base directory: `docs/concept/babylon-3d-character/assets/`

| Asset | Files | Notes |
|---|---|---|
| `animal_crossing_pocket_camp_apollo/` | `scene.gltf`, `scene.bin`, `textures/`, `license.txt` | glTF 2.0 export |
| `animal_crossing_villager_oc/` | `scene.gltf`, `scene.bin`, `textures/`, `license.txt` | glTF 2.0 export |
| `macchiato_animal_crossing_original_character/` | `scene.gltf`, `scene.bin`, `textures/`, `license.txt` | glTF 2.0 export |
| `molly_the_duck/` | `scene.gltf`, `scene.bin`, `textures/`, `license.txt` | glTF 2.0 export |

## Must-Match Details

- Visuals:
- Animations:
- Interactions:
- Performance constraints:
- Data shape / contracts:

## Constraints

- Do not change:
- Allowed to change:

## Acceptance Checklist

- [ ] Model/assets referenced and checked into `docs/concept/babylon-3d-character/assets/`
- [ ] Babylon runtime can load and render the character in `client/babylon-web`
- [ ] Animation plays and matches the concept references
- [ ] `pnpm --filter @animal-zoom/babylon-web lint`, `typecheck`, `build` pass
