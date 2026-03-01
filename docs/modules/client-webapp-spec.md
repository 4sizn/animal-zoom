# Client Webapp 모듈 스펙

## 목적

`client/webapp`의 범위, 요구사항, 전달 규칙을 정의합니다.

---

## 소유 범위와 경계

- **모듈 경로**: `client/webapp`
- **런타임**: React + Vite (TypeScript)
- **담당**: 앱 레벨 UI 구성, 참여자 그리드 렌더링, 하단 컨트롤 바, `@animal-zoom/share` 계약 소비
- **비담당**: 서버 동작 (`server/app`), 공통 계약 정의 (`client/share`)

---

## UI 구현 레퍼런스

아래 경로의 `code.html`과 `screen.png`를 기준으로 **동일하게** React로 구현합니다.

| 예제 | 경로 | 조건 |
|---|---|---|
| 4인 그리드 | `client/webapp/example/virtual_study_room_desktop_grid_4_participants/` | 참여자 1–4명 |
| 12인 그리드 | `client/webapp/example/virtual_study_room_desktop_grid_12_participants/` | 참여자 5–12명 |
| 스크롤 뷰 | `client/webapp/example/virtual_study_room_desktop_grid_scrollable_view/` | 참여자 13명 이상 |

> `screen.png`와 시각적으로 일치해야 합니다. 색상·클래스·구조를 임의로 변경하지 않습니다.

---

## 기능 요구사항

- **FR-WEB-1** 도메인 모델은 `@animal-zoom/share` 인터페이스를 사용합니다. 로컬 중복 정의 금지.
- **FR-WEB-2** 참여자 수에 따라 그리드 columns와 스크롤 여부를 자동 전환합니다.
- **FR-WEB-3** 마이크·카메라 상태를 배지로 표시합니다.
- **FR-WEB-4** zoom 이벤트는 RxJS Observable로 구독합니다 (구현 시).

---

## 비기능 요구사항

- `pnpm --filter @animal-zoom/webapp lint` 통과
- `pnpm --filter @animal-zoom/webapp typecheck` 통과
- 번들 변경 시 `pnpm --filter @animal-zoom/webapp build` 통과

---

## 에이전트 변경 규칙

1. 레이아웃 변경 시 `example/*/screen.png`와 비교하여 일치 여부를 확인합니다.
2. 데이터 형태가 바뀌면 `client/share`를 먼저 수정합니다.
3. 동작이 바뀌면 본 문서도 함께 갱신합니다.

---

## 완료 체크리스트

- [ ] `screen.png`와 시각적으로 동일한가
- [ ] 참여자 수에 따라 그리드/스크롤이 정확히 전환되는가
- [ ] 타입/린트/빌드가 통과하는가
