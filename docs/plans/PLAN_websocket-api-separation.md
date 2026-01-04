# Feature Plan: WebSocket과 API 서버 분리 및 nginx 프록시 구성

**Status**: ⏸️ POSTPONED
**Priority**: Low (성능 최적화 필요 시)
**Created**: 2026-01-03
**Last Updated**: 2026-01-04

---

## Overview

대규모 트래픽에 대비하여 WebSocket 서버와 REST API 서버를 분리하고, nginx reverse proxy를 통해 트래픽을 라우팅하는 인프라 확장 작업입니다.

### Objectives

- WebSocket과 REST API 트래픽을 독립적으로 관리
- 각 서버를 독립적으로 스케일링 가능하도록 구성
- nginx를 통한 로드 밸런싱 및 SSL 종단 처리
- 무중단 배포 가능한 구조 구축
- 프론트엔드 코드 변경 없이 인프라만 확장

---

## Current Architecture

```
Frontend (5173)
    ↓
NestJS Server (3000)
    ├── REST API
    └── WebSocket (Socket.IO)
```

**특징**:
- 단일 포트로 모든 트래픽 처리
- 개발 및 배포 간편
- 소규모~중규모 트래픽에 적합

---

## Target Architecture

```
Frontend (443/HTTPS)
    ↓
nginx Reverse Proxy (443)
    ├── /api/*          → API Server Pool (3000, 3002, 3004...)
    └── /socket.io/*    → WebSocket Server Pool (3001, 3003, 3005...)
```

**특징**:
- 트래픽 유형별 독립적인 서버 풀
- 수평 확장 용이
- 장애 격리 및 독립적 모니터링
- Sticky session을 통한 WebSocket 연결 유지

---

## Phase Breakdown

### Phase 1: 서버 분리 준비 (2-3시간)

**Goal**: WebSocket 서버를 별도 프로세스로 실행할 수 있도록 코드 구조 변경

**Tasks**:
- [ ] WebSocket 전용 entry point 생성 (`main-ws.ts`)
- [ ] API 전용 entry point 생성 (`main-api.ts`)
- [ ] 공통 모듈 분리 (Database, Auth, Config)
- [ ] 환경 변수 분리 (`WS_PORT`, `API_PORT`)
- [ ] Docker Compose에 websocket 서비스 추가

**Quality Gate**:
- [ ] 두 서버가 독립적으로 실행됨
- [ ] API 서버 단독 실행 시 REST API 정상 작동
- [ ] WebSocket 서버 단독 실행 시 Socket.IO 정상 작동
- [ ] 모든 테스트 통과

**Test Strategy**:
- Unit: 각 entry point의 초기화 로직 테스트
- Integration: API와 WebSocket이 독립적으로 Database 접근 가능한지 테스트

---

### Phase 2: nginx 프록시 구성 (2-3시간)

**Goal**: nginx를 통한 트래픽 라우팅 설정

**Tasks**:
- [ ] nginx Docker 컨테이너 추가
- [ ] nginx 설정 파일 작성 (`nginx.conf`)
  - API 라우팅 규칙 (`/api/*`)
  - WebSocket 라우팅 규칙 (`/socket.io/*`)
  - WebSocket upgrade 헤더 설정
  - Sticky session 설정 (ip_hash)
- [ ] SSL/TLS 인증서 설정 (개발: self-signed)
- [ ] 헬스체크 엔드포인트 추가

**Quality Gate**:
- [ ] nginx를 통한 API 요청 정상 작동
- [ ] nginx를 통한 WebSocket 연결 정상 작동
- [ ] WebSocket 연결이 올바른 서버로 sticky
- [ ] 헬스체크로 서버 상태 확인 가능

**nginx 설정 예시**:
```nginx
upstream api_backend {
    server api:3000;
    # 향후 추가: server api2:3000;
}

upstream websocket_backend {
    ip_hash;  # Sticky session
    server websocket:3001;
    # 향후 추가: server websocket2:3001;
}

server {
    listen 443 ssl http2;
    server_name localhost;

    # SSL 설정
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # API 라우팅
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 라우팅
    location /socket.io/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # 헬스체크
    location /health {
        access_log off;
        return 200 "OK";
    }
}
```

---

### Phase 3: 프론트엔드 URL 업데이트 (1시간)

**Goal**: 프론트엔드가 nginx 프록시를 통해 접속하도록 설정

**Tasks**:
- [ ] 환경 변수 업데이트
  - `VITE_API_URL`: `https://localhost` (or domain)
  - `VITE_WS_URL`: `https://localhost` (동일 도메인)
  - `VITE_API_PREFIX`: `/api`
- [ ] API 클라이언트 Base URL 업데이트
- [ ] WebSocket 클라이언트 URL 업데이트
- [ ] HTTPS 자체 서명 인증서 신뢰 설정 (개발용)

**Quality Gate**:
- [ ] 프론트엔드에서 API 호출 성공
- [ ] 프론트엔드에서 WebSocket 연결 성공
- [ ] 방 생성 및 참여 플로우 정상 작동
- [ ] 브라우저 콘솔에 CORS 에러 없음

---

### Phase 4: 로드 밸런싱 및 확장성 테스트 (2-3시간)

**Goal**: 여러 인스턴스로 확장하고 로드 밸런싱 검증

**Tasks**:
- [ ] API 서버 인스턴스 추가 (3000, 3002)
- [ ] WebSocket 서버 인스턴스 추가 (3001, 3003)
- [ ] nginx upstream에 추가 서버 등록
- [ ] 로드 밸런싱 알고리즘 테스트 (round-robin, least_conn)
- [ ] 부하 테스트 도구 설정 (k6, artillery)
- [ ] 동시 접속 1000명 시뮬레이션

**Quality Gate**:
- [ ] 여러 인스턴스에 트래픽 분산 확인
- [ ] WebSocket 연결이 한 서버에 유지됨 (sticky)
- [ ] 한 서버 다운 시 다른 서버로 자동 전환
- [ ] 부하 테스트에서 에러율 1% 미만

**부하 테스트 스크립트 예시**:
```javascript
// k6 load test
import http from 'k6/http';
import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  // API 테스트
  const res = http.get('https://localhost/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });

  // WebSocket 테스트
  ws.connect('wss://localhost/socket.io/', function (socket) {
    socket.on('open', () => console.log('connected'));
    socket.on('message', (data) => console.log('Message:', data));
    socket.setTimeout(() => socket.close(), 30000);
  });
}
```

---

### Phase 5: 모니터링 및 로깅 구성 (2시간)

**Goal**: 각 서버의 상태를 모니터링하고 로그를 중앙 집중화

**Tasks**:
- [ ] Prometheus 메트릭 수집 설정
- [ ] Grafana 대시보드 구성
  - API 서버 메트릭 (요청 수, 응답 시간, 에러율)
  - WebSocket 서버 메트릭 (연결 수, 메시지 처리량)
  - nginx 메트릭 (트래픽, upstream 상태)
- [ ] ELK/Loki 로그 집계 (선택사항)
- [ ] 알람 규칙 설정 (서버 다운, 높은 에러율)

**Quality Gate**:
- [ ] 대시보드에서 실시간 메트릭 확인 가능
- [ ] 서버 다운 시 알람 발생
- [ ] 로그에서 특정 요청 추적 가능

---

### Phase 6: 프로덕션 배포 준비 (2-3시간)

**Goal**: 프로덕션 환경에 안전하게 배포할 수 있도록 준비

**Tasks**:
- [ ] 실제 SSL 인증서 적용 (Let's Encrypt)
- [ ] 환경 변수 프로덕션 설정
- [ ] 보안 헤더 추가 (HSTS, CSP)
- [ ] Rate limiting 설정
- [ ] 무중단 배포 스크립트 작성
- [ ] 롤백 절차 문서화

**Quality Gate**:
- [ ] SSL Labs에서 A+ 등급
- [ ] 보안 헤더 검증 통과
- [ ] 무중단 배포 테스트 성공
- [ ] 롤백 테스트 성공

**무중단 배포 절차**:
1. 새 버전 컨테이너 시작
2. 헬스체크 통과 대기
3. nginx upstream에 새 서버 추가
4. 구버전 서버에 새 연결 차단
5. 기존 연결 처리 완료 대기 (drain)
6. 구버전 서버 종료

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebSocket sticky session 실패 | Medium | High | ip_hash + 테스트 자동화, fallback 메커니즘 |
| 서버 간 상태 동기화 문제 | Medium | Medium | Redis pub/sub 또는 DB 기반 상태 관리 |
| nginx 단일 장애점 | Low | High | nginx HA 구성, keepalived 사용 |
| SSL 인증서 갱신 실패 | Low | Medium | 자동 갱신 스크립트, 만료 알람 |
| 부하 테스트 미비로 병목 발견 못함 | Medium | High | 실제 트래픽 패턴 시뮬레이션, 점진적 롤아웃 |

---

## Rollback Strategy

### Phase별 롤백

**Phase 1-2**:
- Docker Compose의 websocket 서비스 제거
- 기존 단일 서버 구성으로 복원

**Phase 3-4**:
- 프론트엔드 환경 변수를 이전 값으로 복원
- nginx 프록시 비활성화

**Phase 5-6**:
- 구버전 Docker 이미지로 롤백
- nginx 설정을 이전 버전으로 복원

**긴급 롤백 (전체)**:
```bash
# 1. 프론트엔드 환경 변수 복원
cd web_core
git checkout .env.local .env.development

# 2. 백엔드를 단일 서버 모드로 복원
cd ../apiServer
git checkout src/main.ts

# 3. Docker Compose 복원
cd ..
git checkout docker-compose.yml

# 4. 서비스 재시작
docker compose down
docker compose up -d

# 5. 프론트엔드 재시작
cd web_core
npm run dev
```

---

## Performance Targets

| Metric | Current | Target (분리 후) |
|--------|---------|-----------------|
| 동시 WebSocket 연결 | ~100 | 1,000+ |
| API 응답 시간 (P95) | <200ms | <150ms |
| WebSocket 메시지 지연 | <50ms | <30ms |
| 서버 CPU 사용률 | 40-60% | <70% (peak) |
| 가용성 (uptime) | 99% | 99.9% |

---

## Dependencies

**Infrastructure**:
- Docker & Docker Compose
- nginx 1.24+
- Let's Encrypt (certbot)

**Monitoring** (optional):
- Prometheus
- Grafana
- k6 or Artillery (부하 테스트)

**Development**:
- NestJS 10+
- Socket.IO 4+

---

## When to Execute This Plan

이 계획은 다음 상황에서 실행을 고려하세요:

✅ **실행 권장**:
- 동시 접속자 500명 초과 시
- WebSocket 연결로 인한 API 응답 지연 발생 시
- 독립적인 스케일링이 필요할 때
- 프로덕션 배포 전 인프라 안정화 필요 시

⚠️ **실행 보류**:
- 동시 접속자 100명 미만
- 현재 성능에 문제 없음
- 개발 초기 단계
- 리소스가 제한적일 때

---

## Success Criteria

- [ ] API와 WebSocket이 독립적으로 스케일링 가능
- [ ] 프론트엔드 코드 변경 없이 인프라만 확장됨
- [ ] 부하 테스트에서 1,000명 동시 접속 처리
- [ ] 한 서버 장애 시 자동 failover 작동
- [ ] 무중단 배포 프로세스 확립
- [ ] 모니터링 대시보드로 실시간 상태 확인 가능

---

## Notes & Learnings

### ⏸️ POSTPONED - 2026-01-04

**보류 사유**:
- 현재 API 서버 성능이 우수함 (p95: 32ms @ 4,154 req/s)
- 동시 접속자가 500명 미만인 현재 상황에서는 불필요
- 개발 초기 단계로 인프라 복잡도 증가보다는 기능 개발에 집중
- 성능 병목 현상이 발견되지 않음

**재검토 시점**:
- 동시 접속자 500명 초과 시
- WebSocket 연결로 인한 API 응답 지연 발생 시
- 프로덕션 배포 전 스케일링 필요 시

**현재 상태로 충분한 이유**:
- 단일 서버 구조로도 안정적인 성능 확보
- 개발 및 배포 간편성 유지
- 모니터링 및 디버깅 단순화

---

## References

- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)
- [nginx Reverse Proxy Guide](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Socket.IO Scaling Guide](https://socket.io/docs/v4/using-multiple-nodes/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
