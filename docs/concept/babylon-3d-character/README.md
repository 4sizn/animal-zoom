# 작업기획서: Babylon.js 3D 캐릭터 씬 구현

> **목적:** `docs/concept/zoom-grid-1.png` 레퍼런스 이미지와 동일한 패턴으로, Babylon.js multiCanvas 기반의 3D 방+아바타 씬을 `client/babylon-web`에 구현한다.

---

## 1. 배경 및 목표

### 1.1 레퍼런스 이미지

- `docs/concept/zoom-grid-1.png` — Animal Crossing 스타일 3D 캐릭터+방이 Zoom 그리드 레이아웃으로 배치된 화면
- `docs/concept/zoom-grid-2.png` — 4x3 그리드, 각 참가자가 고유한 방(배경, 소품)을 가짐
- `docs/concept/zoom-grid-3.png` — 추가 레이아웃 참조

### 1.2 달성 목표

1. **Babylon.js 데모 페이지** (`client/babylon-web`)에서 glTF 에셋이 정상 렌더링되는지 단독 검증
2. **`/solo` 페이지**: 단일 캔버스에 glTF 캐릭터 1개 + 방 씬을 렌더링
3. **`/room` 페이지**: multiCanvas Views 패턴으로 참가자별 독립 캔버스에 동일 구조의 씬을 렌더링

---

## 2. 레퍼런스 에셋

기본 경로: `docs/concept/babylon-3d-character/assets/`

| 에셋 폴더 | 포맷 | 비고 |
|---|---|---|
| `animal_crossing_pocket_camp_apollo/` | glTF 2.0 (`model/scene.gltf` + `model/scene.bin` + `model/textures/`) | 앉은 포즈, 의상 텍스처 포함 |
| `animal_crossing_villager_oc/` | glTF 2.0 (`model/scene.gltf` + `model/scene.bin` + `model/textures/`) | 캐릭터 + 다수 텍스처 |
| `macchiato_animal_crossing_original_character/` | glTF 2.0 (`model/scene.gltf` + `model/scene.bin` + `model/textures/`) | 오리지널 OC 캐릭터 |
| `molly_the_duck/` | glTF 2.0 (`model/scene.gltf` + `model/scene.bin` + `model/textures/`) | 오리 캐릭터 |

> **라이선스:** 각 에셋 폴더의 `license.txt`를 반드시 확인하고, 상업적 사용 가능 여부를 기재된 조건에 따라 준수한다.

---

## 3. 현재 코드 구조 파악

### 3.1 진입점

- `client/babylon-web/src/main.ts` — 엔진, 라우터, 씬 생명주기 전체 관리
- `client/babylon-web/src/scene/sceneFactory.ts` — `createSingleViewSceneBundle`, `createParticipantViewSceneBundle` 팩토리 함수

### 3.2 현재 씬 구성 (변경 전 기준)

- 아바타: `StandardMaterial` 색상 기반 프록시 Mesh (primitive cylinder/box)
- 방 배경: `clearColor` 단순 색상 변경으로 표현
- 가구/소품: 없음 (빈 씬)

### 3.3 라우팅 및 페이지

```
/solo     → 단일 캔버스, 단일 씬 (SceneBundle 1개)
/room     → 멀티 캔버스, 참가자당 씬 1개 (동적 추가/제거)
/my-room  → 단일 캔버스, 편집 모드 씬 (테마·아바타 셀렉트 연동)
```

---

## 4. 구현 범위 및 요구사항

### 4.1 Phase 1 — glTF 로딩 검증 (데모 페이지 단독 테스트)

> Babylon.js Sandbox 또는 `client/babylon-web` `/solo` 페이지에서 에셋 로드 동작을 먼저 확인한다.

**작업 내용:**

- [ ] `SceneLoader.ImportMeshAsync`를 사용해 `docs/concept/.../scene.gltf` 로드 동작 확인
- [ ] 텍스처 경로 해석 정상 여부 확인 (`scene.bin` + `textures/` 상대 경로)
- [ ] 로드 후 월드 좌표 스케일 및 초기 포즈 확인
- [ ] 애니메이션 그룹 존재 여부 확인 (`scene.animationGroups`)

**검증 기준:**
```
- 캐릭터가 캔버스에 잘라내거나 짤리지 않고 전체 실루엣이 보여야 함
- 텍스처가 누락 없이 적용되어야 함 (회색 mesh 없음)
- 로딩 오류 없이 Promise resolve
```

---

### 4.2 Phase 2 — 단일 씬 캐릭터 통합 (`/solo`)

#### 4.2.1 씬 구성 목표

레퍼런스 이미지 기준, 각 그리드 칸이 가져야 하는 요소:

| 요소 | 구현 방법 | 비고 |
|---|---|---|
| **캐릭터 (아바타)** | glTF 로드 (`SceneLoader.ImportMeshAsync`) | 중앙 배치, 카메라 정면 |
| **방 배경** | `clearColor` 또는 배경 plane mesh + 텍스처 | 테마별 색조 변경 |
| **카메라** | `ArcRotateCamera` 고정 각도 | 정면 약간 위쪽, 패닝 비활성화 |
| **조명** | `HemisphericLight` (기본) | 방향: 위쪽, intensity 0.9 기준 |
| **이름 라벨** | HTML overlay (캔버스 위 absolute 배치) | 참가자 이름 텍스트 |

#### 4.2.2 `sceneFactory.ts` 수정 계획

```typescript
// 기존: primitive mesh 기반 아바타 프록시
// 변경 후: glTF 로드 기반 아바타

export async function createSingleViewSceneBundle(
  engine: Engine,
  options: SceneBundleOptions
): Promise<SceneBundle>
```

- `SceneLoader.ImportMeshAsync`는 비동기이므로, 팩토리 반환 타입을 `Promise<SceneBundle>`로 변경
- 로드 실패 시 fallback: 기존 primitive proxy mesh로 대체 (에러 로그 출력)

#### 4.2.3 카메라 설정 기준치

```typescript
const camera = new ArcRotateCamera(
  "participantCamera",
  -Math.PI / 2,  // alpha: 정면
  Math.PI / 3,   // beta: 위쪽 30도 내려다보기
  5,             // radius: 캐릭터 전체가 보이는 거리
  new Vector3(0, 1, 0), // 캐릭터 허리 높이 기준
  scene
);
camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius; // 줌 고정
camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta;       // 각도 고정
```

---

### 4.3 Phase 3 — 멀티 캔버스 씬 통합 (`/room`)

레퍼런스 이미지(`zoom-grid-1.png`, `zoom-grid-2.png`)를 기준으로:

- 각 그리드 칸 = 독립 캔버스 = 독립 Babylon.js Scene + Camera
- `engine.registerView(canvas, camera)` 로 각 뷰 등록
- 참가자마다 다른 배경색(테마) 적용 가능

**작업 내용:**

- [ ] `createParticipantViewSceneBundle`에 glTF 로드 로직 적용
- [ ] 각 참가자 씬마다 랜덤 또는 지정 avatarType에 맞는 에셋 로드
- [ ] `view.enabled = false` / `true` 가시성 최적화 유지
- [ ] 참가자 이름 HTML 라벨 오버레이 (캔버스 위치 기준 absolute 배치)
- [ ] 발화중(speaking) 테두리 하이라이트 CSS 클래스 토글

**그리드 레이아웃 기준 (레퍼런스 이미지 기반):**

| 참가자 수 | 그리드 |
|---|---|
| 1 | 1×1 (전체 화면) |
| 2~4 | 2×2 |
| 5~6 | 2×3 |
| 7~9 | 3×3 |
| 10~12 | 3×4 |

> CSS: `grid-template-columns: repeat(N, 1fr)` 동적 업데이트

---

### 4.4 에셋 로딩 전략

```
client/babylon-web/
  public/
    assets/
      characters/
        apollo/        ← scene.gltf, scene.bin, textures/
        villager_oc/
        macchiato/
        molly_duck/
```

- 빌드 시 `docs/concept/babylon-3d-character/assets/` 폴더를 `client/babylon-web/public/assets/characters/`로 복사 또는 심링크
- `vite.config.ts`의 `publicDir` 설정 또는 복사 스크립트 추가

**avatarType → 에셋 경로 매핑:**

```typescript
const AVATAR_ASSET_MAP: Record<AvatarType, string> = {
  apollo:     "/assets/characters/apollo/scene.gltf",
  villager:   "/assets/characters/villager_oc/scene.gltf",
  macchiato:  "/assets/characters/macchiato/scene.gltf",
  duck:       "/assets/characters/molly_duck/scene.gltf",
};
```

---

## 5. 레퍼런스 이미지 매칭 체크리스트

`docs/concept/zoom-grid-1.png` 기준:

- [ ] 각 그리드 칸에 Animal Crossing 스타일 캐릭터가 방 안에 위치해 있다
- [ ] 방 배경에 가구/소품류가 배치되어 있다 (책장, 악기 등) — Phase 2 이후 확장
- [ ] 참가자 이름이 캔버스 좌하단에 오버레이된다
- [ ] 그리드 칸의 비율이 레퍼런스와 유사하다 (가로:세로 약 4:3)
- [ ] 주요 배경색이 방별로 다르게 구분된다

---

## 6. 비기능 요구사항

### 6.1 성능

- MVP: 4개 씬 동시 렌더 기준 30 FPS 이상 (데스크톱 Chrome)
- glTF 로드 후 FPS 측정값을 PR 코멘트에 기록
- 캔버스 크기 동일 유지 (마스터 캔버스 리사이즈 최소화)

### 6.2 에러 처리

- glTF 로드 실패 시 → primitive fallback mesh 사용 + 콘솔 에러
- 씬 렌더 오류 시 → 해당 씬만 비활성화, 다른 씬 유지 (기존 로직 유지)

### 6.3 빌드

```sh
pnpm --filter @animal-zoom/babylon-web lint
pnpm --filter @animal-zoom/babylon-web typecheck
pnpm --filter @animal-zoom/babylon-web build
```

---

## 7. 구현 순서 (AI 에이전트 실행 순서)

```
Phase 1 → Phase 2 → Phase 3
```

### Step-by-step

1. **에셋 경로 설정**
   - `client/babylon-web/public/assets/characters/` 디렉토리 생성
   - `docs/concept/babylon-3d-character/assets/` 4개 에셋 폴더를 복사
   - `vite.config.ts` 확인 및 `publicDir` 설정 검토

2. **glTF 로드 유틸 작성** (`src/scene/assetLoader.ts`)
   - `loadCharacterAsync(engine, scene, avatarType): Promise<AbstractMesh[]>`
   - `AVATAR_ASSET_MAP` 정의
   - fallback primitive 생성 함수

3. **`sceneFactory.ts` 업데이트**
   - `createSingleViewSceneBundle` → `async`, glTF 로드 적용
   - `createParticipantViewSceneBundle` → `async`, glTF 로드 적용
   - 카메라 파라미터 기준치 적용

4. **`main.ts` 비동기 처리 대응**
   - `await` 적용, 로딩 중 UI 처리 (스피너 또는 빈 캔버스 유지)

5. **`/solo` 페이지 검증**
   - 캐릭터 렌더 확인
   - 카메라 각도 조정

6. **`/room` 페이지 검증**
   - 4명 동시 렌더 FPS 측정
   - 참가자 추가/제거 동작 확인
   - 이름 라벨 오버레이 위치 확인

7. **레퍼런스 이미지 비교**
   - 스크린샷 캡처 후 `zoom-grid-1.png`와 나란히 비교

---

## 8. 완료 체크리스트

### Phase 1 (로딩 검증)
- [ ] 4개 에셋 중 최소 1개 glTF가 Babylon.js에서 오류 없이 로드됨
- [ ] 캐릭터 텍스처가 정상 적용됨
- [ ] 애니메이션 그룹 여부 확인 및 기록

### Phase 2 (`/solo` 통합)
- [ ] `/solo` 페이지에서 glTF 캐릭터가 정상 렌더됨
- [ ] 카메라가 캐릭터 전체를 프레임 안에 잡음
- [ ] 빌드/타입/린트 통과

### Phase 3 (`/room` 멀티 씬)
- [ ] multiCanvas Views로 4개 씬 동시 렌더링 30 FPS 이상
- [ ] 참가자 입퇴장 시 씬 추가/제거 정상 동작
- [ ] 이름 라벨 오버레이 정상 표시
- [ ] 빌드/타입/린트 통과

### 최종
- [ ] 레퍼런스 이미지(`zoom-grid-1.png`)와 나란히 비교한 스크린샷이 `docs/concept/babylon-3d-character/` 에 저장됨
- [ ] 이 README의 체크리스트가 모두 완료 처리됨

---

## 9. 에이전트 변경 규칙

1. 씬 변경은 단계별로 수행하며, 매 Phase 완료 후 FPS를 측정·기록한다.
2. glTF 에셋을 수정하지 않는다. 로드 후 위치/스케일/회전만 코드로 조정한다.
3. `engine.unRegisterView` + `scene.dispose()`는 반드시 쌍으로 처리한다.
4. 비동기 로드 실패는 fallback으로 처리하고, 렌더 루프를 중단시키지 않는다.
5. 에셋 저작권 정보(`license.txt`)를 코드 주석 또는 별도 파일로 추적한다.

---

## 10. 참고 링크

- [Babylon.js SceneLoader 공식 문서](https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes)
- [Babylon.js multiCanvas 공식 문서](https://doc.babylonjs.com/features/featuresDeepDive/scene/multiCanvas)
- [Babylon.js Sandbox (에셋 빠른 테스트)](https://sandbox.babylonjs.com/)
- [Babylon.js Views 데모](https://www.babylonjs.com/Demos/Views/)
- 레퍼런스 이미지: `docs/concept/zoom-grid-1.png`, `zoom-grid-2.png`, `zoom-grid-3.png`
- 모듈 스펙: `docs/modules/client-babylon-web-spec.md`
