# Resource Download Architecture

## Overview

이 문서는 클라이언트가 3D 모델(GLB) 및 기타 에셋을 다운로드하는 아키텍처를 설명합니다.

## Architecture Diagram

```
┌─────────────────────┐
│   Client (Browser)  │
│   - Babylon.js      │
│   - ResourceLoader  │
│   - AssetUrlResolver│
└──────────┬──────────┘
           │
           │ 1. Request Presigned URL
           │    GET /resources/models/:id
           │    GET /resources/assets/:key/url
           │
           ▼
┌──────────────────────────────────────────┐
│        API Server (NestJS)               │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   ResourceController               │ │
│  │   - getModelUrl()                  │ │
│  │   - getAssetUrl()                  │ │
│  └───────────┬────────────────────────┘ │
│              │                           │
│              ▼                           │
│  ┌────────────────────────────────────┐ │
│  │   S3Service                        │ │
│  │   - generateSignedUrl()            │ │
│  │   - Uses AWS SDK                   │ │
│  │   - Supports MinIO/LocalStack      │ │
│  └───────────┬────────────────────────┘ │
└──────────────┼──────────────────────────┘
               │
               │ 2. Return Presigned URL
               │    { url: "https://minio:9000/bucket/key?signature..." }
               │    (expires in 1 hour by default)
               │
               ▼
┌─────────────────────┐
│   Client (Browser)  │
│   - Babylon.js      │
│   - SceneLoader     │
└──────────┬──────────┘
           │
           │ 3. Direct HTTP GET with Presigned URL
           │    (No API Server involvement)
           │
           ▼
┌──────────────────────────────────────────┐
│   MinIO (S3-Compatible Storage)          │
│   - Bucket: animal-zoom-resources        │
│   - GLB files, textures, etc.            │
│   - Validates presigned signature        │
└──────────────────────────────────────────┘
```

## Key Components

### 1. API Server (Backend)

#### ResourceController (`apiServer/src/resource/resource.controller.ts`)

**Legacy Model Endpoint:**
- `GET /resources/models/:id` → `getModelUrl(id)`
  - Returns presigned URL for a specific model
  - 인증 필요 (JwtAuthGuard)

**New Asset Catalog Endpoint:**
- `GET /resources/assets/:key/url` → `getAssetUrl(key)`
  - Returns presigned URL for any S3 key
  - 인증 필요 (JwtAuthGuard)
  - Example: `/resources/assets/avatars/cat_v1.0.0/model.glb/url`

#### S3Service (`apiServer/src/resource/s3.service.ts`)

**책임:**
- S3/MinIO와의 통신 관리
- Presigned URL 생성

**핵심 메서드:**
```typescript
generateSignedUrl(key: string, expiresIn = 3600): Promise<string>
```
- AWS SDK의 `@aws-sdk/s3-request-presigner` 사용
- `GetObjectCommand`를 생성하고 서명
- 기본 만료 시간: 1시간 (3600초)

**환경 설정:**
- `AWS_ENDPOINT_URL`: MinIO 엔드포인트 (개발 환경)
- `AWS_BUCKET_NAME`: 버킷 이름
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: 인증 정보
- `forcePathStyle: true`: MinIO/LocalStack 호환성

### 2. Client (Frontend)

#### AssetUrlResolver (`web_core/src/resources/AssetUrlResolver.ts`)

**책임:**
- 환경에 따라 에셋 URL 해석
- URL 캐싱으로 API 호출 최소화

**지원 모드:**
- `local`: 개발 환경, API 서버를 통한 직접 접근
- `s3`: Presigned URL 사용 (기본 프로덕션 모드)
- `cdn`: CDN을 통한 접근 (선택적)

**핵심 메서드:**
```typescript
async resolveUrl(key: string): Promise<string>
```

**동작 방식:**
1. 캐시 확인
2. 모드에 따라 URL 생성:
   - `s3` 모드: `assetCatalogApi.getAssetUrl(key)` 호출 → Presigned URL 획득
3. 캐시에 저장 후 반환

#### ResourceLoader (`web_core/src/resources/ResourceLoader.ts`)

**책임:**
- Participant별 리소스 구성 로딩
- LRU 캐시 관리 (최대 50개 항목)

**동작 흐름:**
1. 캐시 확인
2. 캐시 미스 시 스토리지에서 로드
3. 없으면 기본 구성 사용
4. 캐시에 추가 (LRU 정책)

#### API Client (`web_core/src/api/resources.ts`, `assetCatalog.ts`)

**resourcesApi:**
- `getModelUrl(id)`: 레거시 모델 URL 요청

**assetCatalogApi:**
- `getAssetUrl(key)`: 새로운 에셋 카탈로그 URL 요청

#### Babylon.js Scene Loading

**일반적인 사용 패턴:**
```typescript
// 1. AssetUrlResolver로 URL 획득
const resolver = createDefaultResolver();
const url = await resolver.resolveUrl('avatars/cat_v1.0.0/model.glb');

// 2. Babylon.js SceneLoader가 직접 다운로드
const result = await SceneLoader.ImportMeshAsync(
  '',
  '',
  url,  // ← Presigned URL
  scene
);
```

**중요:** Babylon.js가 Presigned URL로 **직접 HTTP GET 요청**을 S3/MinIO에 전송합니다.

## Security & Authentication

### 인증 흐름

1. **API 레벨 인증:**
   - 클라이언트는 JWT 토큰으로 `/resources/models/:id` 또는 `/resources/assets/:key/url` 요청
   - `JwtAuthGuard`가 토큰 검증

2. **S3 레벨 인증:**
   - Presigned URL은 서명이 포함된 임시 URL
   - S3/MinIO가 서명 검증
   - 만료 시간 후 자동 무효화 (기본 1시간)

### 보안 장점

1. **API 서버 부하 감소:**
   - 실제 파일 다운로드 트래픽이 S3/MinIO로 직접 전달
   - API 서버는 URL 생성만 담당

2. **유연한 접근 제어:**
   - API 레벨에서 사용자 권한 검증
   - S3 레벨에서 서명 검증

3. **확장성:**
   - S3/CDN이 파일 전송 처리
   - API 서버는 경량 작업만 수행

## Environment Configuration

### API Server (.env)

```env
# S3/MinIO Configuration
AWS_REGION=us-east-1
AWS_BUCKET_NAME=animal-zoom-resources
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_ENDPOINT_URL=http://localhost:9000  # MinIO for development
```

### Client (.env)

```env
# Asset Resolution Mode
VITE_ASSET_MODE=s3              # local | s3 | cdn
VITE_API_URL=http://localhost:3000
VITE_CDN_BASE_URL=              # Optional, for CDN mode
```

## Development vs Production

### Development (MinIO)

- `AWS_ENDPOINT_URL`: MinIO 로컬 인스턴스
- Presigned URL: `http://localhost:9000/bucket/key?signature=...`
- Same architecture, different endpoint

### Production (AWS S3)

- `AWS_ENDPOINT_URL`: 설정하지 않음 (실제 AWS S3 사용)
- Presigned URL: `https://bucket.s3.region.amazonaws.com/key?signature=...`
- Optional: CloudFront CDN 추가 가능

## Performance Considerations

### Caching Strategy

1. **Client-side URL Cache (AssetUrlResolver):**
   - Presigned URL을 Map에 캐싱
   - API 호출 최소화
   - 수동 캐시 무효화 지원: `clearCache()`

2. **Config Cache (ResourceLoader):**
   - LRU 캐시로 최대 50개 참가자 구성 저장
   - 접근 시간 기반 자동 eviction

### Bandwidth Optimization

- **Direct Download:** 클라이언트 → S3/MinIO 직접 연결
- **No Proxy:** API 서버를 거치지 않음
- **CDN Support:** 프로덕션 환경에서 CDN 사용 가능

## Error Handling

### URL Resolution Failures

```typescript
try {
  const url = await resolver.resolveUrl(key);
  await SceneLoader.ImportMeshAsync('', '', url, scene);
} catch (error) {
  // Fallback to default asset or error message
  console.error('Failed to load asset:', error);
}
```

### Common Errors

1. **401 Unauthorized:** JWT 토큰 만료 또는 없음
2. **403 Forbidden:** S3 서명 만료 또는 잘못된 서명
3. **404 Not Found:** 에셋이 S3에 없음
4. **Network Error:** S3/MinIO 연결 실패

## Related Documentation

- [Asset Upload Pipeline](./plans/PLAN_avatar-asset-resource-server.md)
- [Docker Environment](./plans/PLAN_docker-environment.md)
- Asset Catalog Schema: `apiServer/src/database/schema/asset-catalog.ts`
- S3 Service Tests: `apiServer/src/resource/__tests__/s3-minio.service.spec.ts`

## Key Takeaways

1. **Two-step Process:**
   - Step 1: Client requests presigned URL from API server (authenticated)
   - Step 2: Client downloads file directly from S3/MinIO using presigned URL

2. **No File Proxy:**
   - API server NEVER proxies file content
   - Scalable and efficient architecture

3. **Environment Agnostic:**
   - Same code works with MinIO (dev) and AWS S3 (prod)
   - Configured via environment variables

4. **Security by Design:**
   - API-level authentication (JWT)
   - S3-level authorization (presigned signature)
   - Automatic expiration (default 1 hour)
