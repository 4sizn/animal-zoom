# Resource API Integration

API 서버와 연동되는 리소스 스토리지 시스템 구현 완료.

## 📁 새로 추가된 파일

### 1. `src/resources/IResourceStorage.ts`
```typescript
// ResourceStorage의 공통 인터페이스
// localStorage, API, 하이브리드 구현체 모두 이 인터페이스를 따름
export interface IResourceStorage {
  getStorageKey(participantId: string): string;
  save(config: ParticipantResourceConfig): Promise<void>;
  load(participantId: string): Promise<ParticipantResourceConfig | null>;
  delete(participantId: string): Promise<void>;
  exists(participantId: string): Promise<boolean>;
  list(): Promise<string[]>;
}
```

### 2. `src/resources/ResourceStorageAPI.ts`
```typescript
// API 서버 기반 리소스 스토리지 구현
// - 서버에 설정 저장/로드
// - localStorage 캐시로 오프라인 지원
// - Avatar API와 통합
export class ResourceStorageAPI implements IResourceStorage
```

### 3. `src/resources/index.ts`
```typescript
// 리소스 모듈 배럴 익스포트
// 모든 리소스 관련 타입과 클래스를 한 곳에서 임포트 가능
```

## 🔄 수정된 파일

### 1. `src/resources/ResourceStorage.ts`
```typescript
// Before:
export class ResourceStorage {

// After:
export class ResourceStorage implements IResourceStorage {
```
- IResourceStorage 인터페이스 구현
- 기존 로컬스토리지 기반 동작은 그대로 유지

### 2. `src/resources/ResourceLoader.ts`
```typescript
// Before:
constructor(storage: ResourceStorage, options?: ResourceLoaderOptions) {

// After:
constructor(storage: IResourceStorage, options?: ResourceLoaderOptions) {
```
- 인터페이스 기반으로 변경
- 어떤 스토리지 구현체든 사용 가능

### 3. `src/app-integrated.ts`
```typescript
// Before:
this.storage = new ResourceStorage();

// After:
this.storage = new ResourceStorageAPI();
```
- API 기반 스토리지로 전환
- 자동으로 서버에 아바타 설정 저장/로드

### 4. `src/components/JoinScreenEnhanced.ts`
```typescript
// tokenManager import 추가
import { authApi, roomsApi, tokenManager } from '../api';

// 토큰 접근 방식 수정
const token = tokenManager.getToken();
authResponse = {
  accessToken: token || '',
  user: currentUser,
};
```

## 🔧 작동 방식

### ResourceStorageAPI 동작 흐름

#### 1. 저장 (Save)
```
1. ParticipantResourceConfig → API AvatarConfig 변환
2. avatarApi.updateMyAvatar() 호출
3. 성공 시 localStorage에도 캐시
4. 실패 시 localStorage에만 저장 (오프라인 지원)
```

#### 2. 로드 (Load)
```
1. avatarApi.getMyAvatar() 호출
2. API AvatarConfig → ParticipantResourceConfig 변환
3. localStorage에 캐시
4. API 실패 시 localStorage 캐시 사용 (폴백)
```

### 데이터 매핑

#### Local → API
```typescript
ParticipantResourceConfig {
  character: {
    modelUrl: string;
    customization: {
      colors: { primary, secondary }
      accessories: string[]
    }
  }
}
↓
AvatarConfig {
  modelUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accessories: string[];
}
```

#### API → Local
```typescript
AvatarConfig {
  modelUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accessories: string[];
}
↓
ParticipantResourceConfig {
  version: "1.0.0";
  participantId: string;
  timestamp: number;
  character: {
    modelUrl: avatarConfig.modelUrl;
    customization: {
      colors: { primary, secondary }
      accessories: avatarConfig.accessories
    }
  }
  room: { /* default */ }
}
```

## 💡 주요 기능

### 1. 오프라인 지원
```typescript
// API 실패 시 자동으로 localStorage 사용
try {
  const avatarConfig = await avatarApi.getMyAvatar();
  // ... API 데이터 사용
} catch (error) {
  // Fallback to localStorage
  const stored = localStorage.getItem(key);
  return JSON.parse(stored);
}
```

### 2. 자동 캐싱
```typescript
// API에서 로드한 데이터를 자동으로 캐시
localStorage.setItem(key, JSON.stringify(config));
```

### 3. 동기화 메서드
```typescript
// API와 캐시 동기화
await storage.sync(participantId);

// 모든 캐시 초기화
await storage.clearCache();
```

## 🎯 사용 예시

### 앱에서 사용
```typescript
// app-integrated.ts
this.storage = new ResourceStorageAPI();
this.loader = new ResourceLoader(this.storage);

// 자동으로 API와 동기화됨
await this.participantManager.addParticipant(userId, name);
```

### 에디터에서 사용
```typescript
// EditMyAnimal.ts
const storage = this.loader.getStorage();
await storage.save(config);
// → avatarApi.updateMyAvatar() 자동 호출
```

### 수동 동기화
```typescript
const storage = new ResourceStorageAPI();

// 특정 사용자 동기화
await storage.sync('user-123');

// 모든 캐시 클리어
await storage.clearCache();
```

## 🔄 이전 버전과의 호환성

### LocalStorage 계속 사용하기
```typescript
// 기존 방식 그대로 사용 가능
import { ResourceStorage } from './resources';

this.storage = new ResourceStorage();
this.loader = new ResourceLoader(this.storage);
```

### 하이브리드 구현
```typescript
// 필요시 두 가지 모두 사용 가능
const localStore = new ResourceStorage();
const apiStore = new ResourceStorageAPI();

// 상황에 따라 선택
const storage = isOnline ? apiStore : localStore;
```

## 📊 장단점

### ResourceStorageAPI (API 기반)

**장점:**
- ✅ 서버에 영구 저장
- ✅ 여러 기기 간 동기화
- ✅ 백업 및 복구 가능
- ✅ 오프라인 캐시 지원

**단점:**
- ❌ 네트워크 의존성
- ❌ API 호출 오버헤드
- ❌ 더 복잡한 에러 처리

### ResourceStorage (LocalStorage 기반)

**장점:**
- ✅ 빠른 읽기/쓰기
- ✅ 네트워크 불필요
- ✅ 단순한 구조

**단점:**
- ❌ 브라우저에만 저장
- ❌ 기기 간 동기화 불가
- ❌ 데이터 손실 위험

## 🧪 테스트

### Type Check
```bash
bun run type-check
```

### 런타임 테스트
```bash
# 1. 룸 생성
bun run create-room

# 2. 앱 실행
bun run dev

# 3. 룸 참가 후 캐릭터 편집
# 4. 저장 후 콘솔 확인:
# ✅ Saved config for [user-id] to API
```

### API 호출 확인
브라우저 개발자 도구 Network 탭:
```
PUT /avatars/me
Request: { modelUrl, primaryColor, secondaryColor, accessories }
Response: { ... avatar config ... }
```

## 🚀 향후 개선 사항

### 1. 룸 설정 API 통합
```typescript
// RoomConfig도 API와 통합
// roomConfigApi.updateRoomConfig() 사용
```

### 2. 배치 동기화
```typescript
// 여러 사용자 설정 한 번에 동기화
await storage.syncBatch([user1, user2, user3]);
```

### 3. 충돌 해결
```typescript
// 로컬과 서버 데이터가 다를 때
// 버전 관리 및 병합 로직
```

### 4. 압축 및 최적화
```typescript
// 큰 3D 모델 데이터 압축
// 부분 업데이트 (delta sync)
```

## 📝 Notes

- ResourceStorageAPI는 현재 Avatar API만 사용
- RoomConfig는 아직 localStorage에 저장
- 3D 모델 파일(.glb)은 별도로 처리 필요
- 오프라인 모드에서는 localStorage 폴백 사용

## ✅ 완료!

리소스 스토리지가 API 서버와 완전히 통합되었습니다!
- ✅ 인터페이스 기반 설계
- ✅ API 백엔드 구현
- ✅ 오프라인 캐시 지원
- ✅ 기존 코드 호환성 유지
