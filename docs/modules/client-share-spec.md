# Client Share 모듈 스펙 (템플릿)

## 1) 목적

`client/share`의 공통 도메인 계약 운영 정책을 정의합니다.

## 2) 소유 범위와 경계

- 모듈 경로: `client/share`
- 런타임: TypeScript 라이브러리 패키지
- 담당:
  - 클라이언트/서버 패키지 전반에서 사용하는 공통 인터페이스 및 타입 계약
- 비담당:
  - UI 구현 상세
  - 서버 런타임 전송 로직

## 3) 현재 기준선 (관찰 기반)

- 엔트리 포인트: `client/share/src/index.ts`
- 노출 타입:
  - `ZoomAnimal`
  - `ZoomPosition`
  - `ZoomState`

## 4) 기능 요구사항

### FR-SHARE-1 계약 권위

- 패키지 간에 공유되는 zoom 관련 타입 형태는 모두 이 모듈에 정의합니다.
- 하위 패키지는 이 모듈에서 계약을 import 해야 합니다.

### FR-SHARE-2 하위 호환성

- 조정 없는 필드 삭제/이름 변경 같은 파괴적 변경을 피합니다.
- 계약 변경과 영향 모듈을 문서화합니다.

### FR-SHARE-3 버전 진화 (권장)

- 향후 비호환 변경이 필요하면 우선 가산형(additive) 마이그레이션 패턴을 사용합니다.

## 5) 비기능 요구사항

- `pnpm --filter @animal-zoom/share lint` 통과
- `pnpm --filter @animal-zoom/share typecheck` 통과
- `pnpm --filter @animal-zoom/share build` 통과

## 6) 계약 변경 워크플로우

1. `client/share/src/index.ts`의 인터페이스 정의를 갱신합니다.
2. 모든 소비자(`client/webapp`, `client/babylon-web`, `server/app`, 기타)를 함께 갱신합니다.
3. 페이로드 형태를 설명하는 문서/예시를 갱신합니다.
4. 워크스페이스 검증을 실행합니다.

## 7) 에이전트 변경 규칙

1. 이 모듈을 계약의 정본(canonical source)으로 취급합니다.
2. 파괴적 변경보다 가산형 변경을 우선합니다.
3. 필드 의미가 바뀌면 마이그레이션 노트를 포함합니다.

## 8) 완료 체크리스트

- [ ] 공통 인터페이스가 올바르게 갱신되었는가
- [ ] 소비자 모듈이 같은 변경 내에서 함께 갱신되었는가
- [ ] 타입/린트/빌드 검증이 통과하는가
- [ ] 문서가 갱신되었는가

## 9) 열린 질문 / 향후 작업

- 스키마 검증 전략 도입(런타임 가드 또는 검증 라이브러리)
- 호환성 정책(major/minor 계약 변경) 섹션 추가
