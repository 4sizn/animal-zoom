# Client Babylon Web 모듈 스펙

## 1) 목적

`client/babylon-web`의 요구사항과 운영 제약을 정의합니다.

이 모듈은 **Babylon.js multiCanvas(Views) 패턴**을 활용하여, 참가자 각자의 독립적인 3D 방 씬을 그리드 UI에 출력하는 렌더링 런타임을 담당합니다.

비전: Zoom과 유사한 그리드 UI에 Animal Crossing 스타일의 3D 방 아바타를 결합하여, 각 참가자가 자신만의 공간을 가지는 몰입형 화상회의를 구현합니다.

---

## 2) 소유 범위와 경계

- 모듈 경로: `client/babylon-web`
- 런타임: Babylon.js + Vite
- **담당:**
  - 하나의 Babylon.js 엔진 + multiCanvas Views로 참가자별 독립 3D 씬 렌더링
  - 씬 부트스트랩, 렌더 루프, 카메라/조명 기본값, 리사이즈 처리
  - 세 가지 데모 페이지의 3D 렌더링 컨텍스트 제공 (아래 §4 참조)
- **비담당:**
  - WebSocket 게이트웨이 전송 로직
  - 그리드 배치/레이아웃 HTML 구조 (상위 UI 모듈 담당)
  - 공통 도메인 계약의 권위 있는 정의 (`client/share` 담당)

---

## 3) 현재 기준선 (관찰 기반)

- 엔트리 포인트: `client/babylon-web/src/main.ts`
- 엔진, 씬, 카메라, 반구형 조명, 리사이즈 리스너를 초기화합니다.

---

## 4) 페이지 구조 및 렌더링 모드

### 4.1 개요

3개의 독립 데모 페이지로 구성되며, 각 페이지는 동일한 multiCanvas 엔진 위에서 동작합니다.

```
/my-room       → 내방 꾸미기 데모 (단일 씬, 편집 UX)
/room          → Room 그리드 뷰 (다중 씬, N명 참가자)
/solo          → 나만 출력 (단일 씬, 자기 아바타 집중)
```

### 4.2 내방 꾸미기 페이지 (`/my-room`)

- **목적:** 자신의 3D 방 테마·소품·아바타를 편집할 수 있는 프리조인/셋업 화면
- **렌더링:** 단일 캔버스, 편집 카메라(OrbitCamera) 사용
- **주요 기능:**
  - 방 테마(배경, 가구, 소품) 선택 및 실시간 미리보기
  - 아바타 종류 선택 및 애니메이션 미리보기
  - 저장 후 Room 참가 가능
- **씬 구성:** 편집 전용 씬 1개, `engine.registerView(canvas)` 단독 등록

### 4.3 Room 내 그리드 페이지 (`/room`)

- **목적:** 참가자 전원이 자신의 3D 방 안에 아바타로 보이는 Zoom-like 그리드
- **렌더링:** multiCanvas Views 패턴 — 참가자 1명당 캔버스 1개 + 씬 1개 + 카메라 1개
- **주요 기능:**
  - 참가자 수에 따라 그리드 칸(캔버스)을 동적 생성/제거
  - 각 캔버스에 `engine.registerView(canvas, camera)` 등록
  - 오프스크린 그리드 칸은 `view.enabled = false`로 렌더 비활성화
  - 참가자 이름 라벨 오버레이 (HTML 레이어)
  - 발화중(speaking) 하이라이트 테두리 표시
- **씬 전략:**
  - 옵션 A (주 전략): 참가자마다 독립 Scene + 독립 Camera → `engine.registerView(canvas, cam)` 등록
  - 옵션 B (대안): 단일 공유 Scene + 참가자별 Camera → 씬 복잡도 증가, 물리 분리 어려움
  - **권장:** 옵션 A (독립 씬)로 시작, 성능 임계치 도달 시 옵션 B로 전환 검토
- **렌더 루프 패턴:**
  ```typescript
  engine.runRenderLoop(() => {
    const view = engine.activeView;
    const participantScene = sceneMap.get(view?.target);
    participantScene?.render();
  });
  ```

### 4.4 나만 출력 페이지 (`/solo`)

- **목적:** 내 아바타와 방만 출력하는 집중 모드 (발표 중 자기 화면 확인, 테스트용)
- **렌더링:** 단일 캔버스, 단일 씬, 단일 카메라
- **주요 기능:**
  - 풀 화면 또는 대형 단일 뷰
  - 아바타 리액션(이모트)·상태(음소거, 발화 등) 시뮬레이션 가능
  - 성능 기준선 측정에 활용 (1 씬 기준)

---

## 5) 기능 요구사항

### FR-BAB-1 엔진 및 씬 초기화

- 숨김(offscreen) 마스터 캔버스로 엔진을 초기화합니다.
- 각 뷰(참가자 캔버스)에 `engine.registerView(canvas, camera)` 로 씬을 연결합니다.
- 씬이 없는 뷰는 `engine.registerView(canvas)` (카메라 미지정)로 등록합니다.

### FR-BAB-2 렌더 생명주기

- `engine.runRenderLoop`의 단일 루프에서 `engine.activeView`를 기반으로 해당 씬을 렌더링합니다.
- 뷰포트 크기 변경 시 엔진 리사이즈를 수행합니다.
- 성능 최적화: 모든 캔버스 크기를 동일하게 유지하여 마스터 캔버스 리사이즈를 최소화합니다.

### FR-BAB-3 참가자 뷰 동적 관리

- 참가자 입장: `engine.registerView(newCanvas, newCamera)` 추가
- 참가자 퇴장: `engine.unRegisterView(canvas)` 제거, 씬 dispose
- 오프스크린 칸: `view.enabled = false`로 렌더 중단

### FR-BAB-4 방(씬) 구성 요소

각 참가자 씬은 다음 요소로 구성됩니다:

| 요소 | 내용 |
|---|---|
| 배경 | 방 테마 배경 (색상 또는 TextureMesh) |
| 가구·소품 | 책장, 책상, 소품 등 (GLTF/GLB Mesh) |
| 아바타 | 참가자 동물 아바타 캐릭터 (GLTF/GLB) |
| 카메라 | ArcRotateCamera (고정 각도, 발화 시 지정 시야) |
| 조명 | HemisphericLight (기본) + PointLight (분위기 옵션) |

### FR-BAB-5 상호작용 (MVP 범위)

- 내방 꾸미기: 소품/테마 선택 시 씬 즉시 반영
- Room 그리드: 참가자 칸 클릭 → 스포트라이트(pinning) 전환 (해당 씬 확대)
- 이모트: 아바타 리액션 애니메이션 트리거

### FR-BAB-6 프리조인 호환성

- 씬 초기화 로직은 `/my-room`(편집)과 `/solo`(미리보기)에서 재사용 가능하도록 팩토리 함수로 추상화합니다.

---

## 6) 비기능 요구사항

### NFR-BAB-Build

- `pnpm --filter @animal-zoom/babylon-web lint` 통과
- `pnpm --filter @animal-zoom/babylon-web typecheck` 통과
- `pnpm --filter @animal-zoom/babylon-web build` 통과

### NFR-BAB-Perf

- **MVP 목표:** 참가자 2~4명 데모 품질, 데스크톱 기준 30 FPS 이상
- **성능 고위험 항목:** 다중 씬 렌더 실현 가능성을 1단계에서 검증 (4개 씬 동시 렌더 기준 FPS 측정)
- **캔버스 크기 통일:** 동일 크기 유지로 마스터 캔버스 리사이즈 오버헤드 제거
- 오프스크린 뷰 `view.enabled = false` 적용 필수

### NFR-BAB-Reliability

- 렌더 루프 내 불필요한 할당 방지
- 캔버스 미존재 시 런타임 크래시 방지 (방어적 초기화)
- 번들 크기 증가분은 PR 단위로 문서화

---

## 7) 의존성 및 선행조건

- **에셋 전략 결정 필요:** 아바타·가구·소품 GLTF 에셋 조달 방식 (직접 제작 / 마켓플레이스 / 혼합)
- **참가자·세션 모델 최소 스펙 정의 필요:** `client/share`의 `ZoomAnimal`, `ZoomState` 등 계약 확정
- **실시간 백엔드 계약 필요:** 씬 동기화에 필요한 상태 필드 (아바타 종류, 방 테마, 발화 여부 등)

---

## 8) 사용자 입력이 필요한 스펙 항목 (작성 필요)

에이전트가 가장 먼저 확인하는 항목입니다. 각 항목 값을 채워주세요.

### A) 씬/아바타 규칙

- 지원할 아바타 종류/스펙: `[TO_FILL]` (예: 고양이, 곰, 펭귄 등 N종)
- 방 테마 수: `[TO_FILL]` (예: 서재, 카페, 음악실 등 N종)
- 최소/최대 그래픽 품질 목표: `[TO_FILL]`

### B) 참가자 규모 및 성능 예산

- 단계별 목표 참가자 수 (MVP / Beta / GA): `[TO_FILL]` (MVP 기준 2~4명 예상)
- 디바이스 클래스별 FPS 목표 (데스크톱 기준): `[TO_FILL]`
- 메모리/CPU 예산 제약: `[TO_FILL]`

### C) 상호작용 및 UX

- 참가자 칸 클릭 시 동작 (스포트라이트/핀/없음): `[TO_FILL]`
- 지원할 이모트 종류: `[TO_FILL]`
- 접근성 요구사항 (키보드, 저모션, 대비 등): `[TO_FILL]`

### D) 데이터 및 동기화 계약

- 씬 업데이트에 필요한 실시간 입력 필드: `[TO_FILL]` (예: `avatarType`, `roomTheme`, `isSpeaking`)
- 업데이트 주기/지연 허용치: `[TO_FILL]`
- 지연 도착/역순 업데이트 충돌 처리 규칙: `[TO_FILL]`

### E) 에셋 및 파이프라인

- 에셋 조달 전략 (직접 제작 / 마켓플레이스 / 혼합): `[TO_FILL]`
- 허용 포맷 및 에셋 단위 용량 제한: `[TO_FILL]`
- 라이선스/컴플라이언스 제약: `[TO_FILL]`

### F) 운영 제약

- 브라우저 지원 매트릭스 (필수/권장): `[TO_FILL]`
- WebGL 미지원/로딩 실패 시 폴백 동작: `[TO_FILL]`
- 텔레메트리/진단 수집 요구사항: `[TO_FILL]`

---

## 9) 에이전트 변경 규칙

1. 씬 변경은 점진적으로 수행하고 매 단계 FPS를 측정하여 기록합니다.
2. 런타임 부작용(엔진, 씬, 뷰 등록)은 엔트리 또는 전용 씬 관리 파일에 국한합니다.
3. 신규 이벤트 페이로드 도입 시 `client/share` 계약과 정합시킵니다.
4. 참가자 뷰 추가/제거 시 반드시 `engine.unRegisterView` + `scene.dispose()`를 쌍으로 처리합니다.
5. 모든 캔버스 크기는 일관되게 유지하여 성능 저하를 방지합니다.

---

## 10) 완료 체크리스트

- [ ] 단일 씬이 오류 없이 시작 및 렌더링되는가 (solo 페이지 기준)
- [ ] multiCanvas Views로 4개 씬 동시 렌더링이 30 FPS 이상인가
- [ ] 참가자 입퇴장 시 뷰 동적 추가/제거가 정상 동작하는가
- [ ] 리사이즈 처리 동작이 정상인가
- [ ] 타입/린트/빌드 검증이 통과하는가
- [ ] 동작 변경 시 관련 문서가 갱신되었는가

---

## 11) 열린 질문 / 향후 작업

- 독립 씬(옵션 A)과 공유 씬(옵션 B)의 실제 성능 임계치 측정 후 전략 확정
- 방 테마·소품 에셋 파이프라인 구체화
- 씬 동기화 프로토콜 (WebSocket 페이로드 형태, 주기) 확정
- 씬 동작 검증 전략 (자동화 테스트/시각 회귀 테스트) 수립
- 이모트 애니메이션 트리거 방식 및 종류 구체화

---

## 참고

- [Babylon.js multiCanvas 공식 문서](https://doc.babylonjs.com/features/featuresDeepDive/scene/multiCanvas)
- [Babylon.js multiScene 공식 문서](https://doc.babylonjs.com/features/featuresDeepDive/scene/multiScenes)
- [Babylon.js Views 데모](https://www.babylonjs.com/Demos/Views/)
- 컨셉 이미지: `docs/concept/zoom-grid-1.png`, `zoom-grid-2.png`, `zoom-grid-3.png`
