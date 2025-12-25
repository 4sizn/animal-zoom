# 환경 변수 가이드

## 📁 파일 구조

```
web_core/
├── .env                    # 모든 환경 공통 (Git ✅)
├── .env.development        # 개발 환경 기본값 (Git ✅)
├── .env.production         # 프로덕션 환경 (Git ✅)
├── .env.example            # 템플릿 (Git ✅)
├── .env.local.example      # 로컬 설정 템플릿 (Git ✅)
└── .env.local              # 개인 로컬 설정 (Git ❌)
```

## 🔄 로딩 우선순위

높을수록 우선:
1. `.env.[mode].local` (최우선) - Git 무시
2. `.env.[mode]` (development/production)
3. `.env.local` - Git 무시
4. `.env` (공통 설정)

## 🚀 사용 방법

### 로컬 개발

```bash
# 기본 설정 사용 (localhost:3000, localhost:3001)
bun run dev

# 개인 설정이 필요한 경우
cp .env.local.example .env.local
# .env.local을 수정하여 개인 설정 추가
bun run dev
```

### 프로덕션 빌드

```bash
# 프로덕션 설정으로 빌드
bun run build

# 빌드 미리보기
bun run preview
```

### 환경별 실행

```bash
# 개발 모드 (자동)
bun run dev
# 또는
vite --mode development

# 프로덕션 모드
vite --mode production
```

## 📝 환경 변수 사용법

### TypeScript에서 사용

```typescript
// 타입 안전한 접근
const apiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
const appName = import.meta.env.VITE_APP_NAME;

// 환경 확인
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const mode = import.meta.env.MODE; // 'development' | 'production'
```

### 타입 정의 추가 (권장)

`src/vite-env.d.ts` 파일 생성:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG: string;
  readonly VITE_LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  readonly VITE_ENABLE_INSPECTOR: string;
  readonly VITE_ENABLE_CONSOLE_LOGS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## ⚙️ 환경별 설정

### Development (.env.development)
- API: `http://localhost:3000`
- WebSocket: `http://localhost:3001`
- 디버그 활성화

### Production (.env.production)
- API: `https://api.animal-zoom.com` (TODO: 실제 도메인)
- WebSocket: `wss://ws.animal-zoom.com` (TODO: 실제 도메인)
- 디버그 비활성화

### Local (.env.local) - 선택사항
개인 개발 환경에 맞게 오버라이드:
- 다른 포트 사용
- 원격 개발 서버 연결
- 디버그 설정 변경

## 🔐 보안

**Git에 커밋하면 안 되는 것:**
- ✅ `.env.local`
- ✅ `.env.*.local`
- ✅ 실제 API 키, 시크릿

**Git에 커밋해도 되는 것:**
- ✅ `.env.example`
- ✅ `.env.development`
- ✅ `.env.production` (공개 설정만)

## 💡 팁

1. **비밀 정보는 .env.local에**: API 키, 토큰 등
2. **VITE_ 접두사 필수**: Vite는 `VITE_`로 시작하는 변수만 노출
3. **타입 정의 추가**: 자동 완성과 타입 체크를 위해
4. **환경 확인**: `console.log(import.meta.env)` 로 디버깅

## 📚 참고

- [Vite 환경 변수 문서](https://ko.vitejs.dev/guide/env-and-mode.html)
