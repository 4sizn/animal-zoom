# 개인공간 자동 생성 및 커스텀 배치 설계

## Goal Description
BabylonJS 기반 프로젝트에 **개인공간(Desk + Chair + Plant + Avatar)** 을 자동으로 생성하고, 사용자가 추후 **위치·구성**을 자유롭게 커스텀할 수 있도록 설계합니다. 또한 카메라가 **책상 중심**을 항상 비추도록 강조합니다.

## Proposed Changes

### 1️⃣ 데이터‑기반 설정 파일
- **파일:** `src/data/personalSpaces.json`
- **구조:** `PersonalSpace[]` 배열, 각 항목에 `id`, `name`, `position`, `size`, `assets` 포함.
- **AssetSpec (개별 오브젝트):**
  - `{ type: "avatar" | "mesh" | "light" | "background", key: string, id: string, position: Vector3, rotation: Vector3, scale: Vector3, options?: any }`
- **배열 구조:** 
  - **Thematic Backgrounds:** 각 셀마다 고유한 테마(예: 음악 작업실, 서재, 창가)를 위한 배경 벽면/바닥 에셋 포함.
  - **Local Lighting:** 각 셀의 분위기를 살릴 수 있는 개별 광원(PointLight, SpotLight) 정의 가능.
  - **UI Name Tag:** 3D 공간 내 혹은 2D 오버레이로 사용자 이름을 표시하는 라벨 기능 추가.

### 2️⃣ 씬 팩토리 확장 (`src/scene/sceneFactory.ts`)
- **함수:** `createPersonalSpaces(scene: Scene, config: PersonalSpace[])`
  - 각 `PersonalSpace`(공간) 마다 **TransformNode**를 생성하여 루트로 사용.
  - `assets` 배열을 순회하며 배경 → 가구 → 아바타 → 조명 → UI 순으로 생성 및 배치.
  - **테마별 에셋 패키징:** "Music", "Study" 등 컨셉 이미지(`zoom-grid-1.png`)에 부합하는 프리셋 에셋들을 팩토리에서 지원.
- **카메라 포커스:** `focusCameraOnDesk(scene, spaceNode)` 구현 – 책상 중심을 타깃으로 하고, 고정 거리/높이(예: 4 m 뒤, 2 m 위) 로 배치.

### 3️⃣ 그리드 자동 배치 (옵션)
- **헬퍼:** `generateGridPositions(count, cellSize, spacing)` → 격자 좌표 배열 반환.
- `personalSpaces.json` 의 `position` 필드를 자동 채워 **셀 간격**(예: width 5 m, depth 5 m, spacing 1 m) 으로 배치 가능.

### 4️⃣ Concrete Example: Music Studio Theme Preset
다른 AI가 참고할 수 있는 JSON 예시입니다.

```json
{
  "id": "space-music-01",
  "name": "뮤직 스튜디오 셀",
  "theme": "Music",
  "position": { "x": 0, "y": 0, "z": 0 },
  "assets": [
    { "type": "background", "key": "wooden_wall", "id": "wall_1", "position": {"x":0, "y":1.5, "z":2} },
    { "type": "mesh", "key": "desk_keyboard", "id": "desk_1", "position": {"x":0, "y":0, "z":0} },
    { "type": "avatar", "avatarType": "apollo", "id": "user_avatar", "position": {"x":0, "y":0, "z":0} },
    { "type": "light", "key": "spotlight", "id": "main_light", "position": {"x":0, "y":3, "z":-2}, "options": {"intensity": 1.5} },
    { "type": "ui", "key": "name_tag", "id": "label", "options": {"text": "K.K. Slider"} }
  ]
}
```

### 5️⃣ Custom UI & Interactive Mode (Future)
- `TransformNode.position`을 UI 슬라이더로 노출하여 사용자가 실시간으로 위치를 조정할 수 있게 합니다.
- `EditMode`를 추가하여 오브젝트 선택 및 기즈모(Gizmo) 노출을 고려합니다.

### 6️⃣ 파일·디렉터리 구조 (예시)
```
client/
 └─ babylon-web/
     ├─ src/
     │   ├─ data/
     │   │   └─ personalSpaces.json          # 공간 정의
     │   ├─ scene/
     │   │   ├─ assetLoader.ts               # 기존 캐릭터 로더
     │   │   └─ sceneFactory.ts              # 새로운 팩토리 구현
     │   └─ index.ts                         # 엔트리, createPersonalSpaces 호출
     └─ public/
         └─ assets/
             └─ characters/…                # 기존 glTF 에셋
```

## Verification Plan
1. **Manual Test** – `npm run dev` 로 BabylonJS 데모 실행 후, 각 개인공간이 JSON 정의대로 배치되는지 확인하고, 카메라가 책상 중심을 정확히 바라보는지 시각적으로 검증.
2. **Customisation Test** – 브라우저 콘솔에서 `scene.getTransformNodeByName('space-001').position.x = 10` 와 같이 직접 위치를 수정하고 화면에 즉시 반영되는지 확인.
3. **Future Automation** – 테스트 스크립트(예: Cypress) 로 `personalSpaces.json` 을 변경하고 페이지 리로드 시 자동 반영 여부 검증.

---

*이 문서는 구현을 위한 설계·계획만을 담고 있습니다. 실제 코드 변경은 아직 수행되지 않았습니다.*
