# Feature Plan: Animal Zoom API Server Architecture

**Feature**: NestJS-based REST API + WebSocket Server for Real-time Video Conferencing
**Date Created**: 2025-12-25
**Status**: ⚠️ 85% Complete
**Updated**: 2025-12-26
**Actual Duration**: ~17-20 hours (Phase 1-6 완료)
**Remaining**: Phase 7 통합 테스트 및 최적화
**Complexity**: Large

---

## 📋 Overview

### Problem Statement
현재 Animal Zoom은 프론트엔드만 구현되어 있으며, 실제 다중 사용자 환경에서 작동하려면 백엔드 서버가 필요합니다. 방 관리, 사용자 인증, 실시간 통신, 리소스 관리를 처리할 API 서버가 필요합니다.

### Solution Summary
NestJS 기반의 TypeScript API 서버를 구축하여:
- RESTful API로 방/사용자/아바타/리소스 관리
- WebSocket으로 실시간 상태 동기화 및 채팅
- PostgreSQL로 데이터 영속성 보장
- S3/GCS로 Unity 리소스(GLB) 호스팅
- JWT + Guest 하이브리드 인증

### Success Criteria
- [x] NestJS 서버가 정상 실행됨 (http://localhost:3000)
- [x] PostgreSQL 연결 및 Kysely 마이그레이션 성공
- [x] REST API 엔드포인트 모두 작동 (Swagger 문서화)
- [x] WebSocket 연결 및 실시간 메시지 전송/수신
- [x] 방 생성/입장/퇴장 플로우 완벽 작동
- [x] 아바타/방 커스터마이징 실시간 동기화
- [x] S3에서 GLB 파일 로드 성공 (Presigned URLs)
- [x] 테스트 커버리지 ≥80% (78 unit tests)
- [ ] API 응답 시간 <200ms (p95) - 부하 테스트 미실행

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (web_core)                    │
│  - React/TypeScript                                          │
│  - Babylon.js 3D Engine                                      │
│  - WebSocket Client                                          │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
    REST API │                           │ WebSocket
             │                           │
┌────────────▼───────────────────────────▼────────────────────┐
│                    NestJS API Server (apiServer)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Module (JWT + Guest)                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Room Module (임시 방 관리)                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  User Module (선택적 회원가입)                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Avatar Module (커스터마이징)                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Resource Module (GLB 리소스 관리)                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Chat Module (텍스트 채팅)                            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  WebSocket Gateway (실시간 동기화)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
   PostgreSQL│                           │ S3/GCS
             │                           │
┌────────────▼────────────┐   ┌─────────▼───────────────────┐
│  PostgreSQL Database    │   │  Cloud Storage              │
│  - Users                │   │  - character/*.glb          │
│  - Rooms                │   │  - rooms/*.glb              │
│  - Participants         │   │  - accessories/*.glb        │
│  - AvatarConfigs        │   └─────────────────────────────┘
│  - RoomConfigs          │
│  - ChatMessages         │
└─────────────────────────┘
```

### Technology Stack

**Backend Framework**:
- NestJS 10.x (TypeScript)
- Express (HTTP Server)
- Socket.io (WebSocket)

**Database**:
- PostgreSQL 15.x
- TypeORM 0.3.x (ORM)
- Redis (Session/Cache, optional)

**Authentication**:
- Passport.js
- JWT (jsonwebtoken)
- bcrypt (password hashing)

**Cloud Storage**:
- AWS SDK v3 (S3)
- OR @google-cloud/storage (GCS)

**Testing**:
- Jest (Unit/Integration tests)
- Supertest (E2E tests)
- Socket.io-client (WebSocket tests)

**DevOps**:
- Docker & Docker Compose
- PM2 (Process Manager)
- ESLint + Prettier

---

## 📐 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     User        │       │      Room       │       │  AvatarConfig   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID)       │       │ id (UUID)       │       │ id (UUID)       │
│ email?          │◄──────┤ hostUserId      │       │ userId          │
│ passwordHash?   │       │ roomCode (6ch)  │       │ modelUrl        │
│ displayName     │       │ createdAt       │       │ primaryColor    │
│ isGuest         │       │ expiresAt       │       │ secondaryColor  │
│ guestToken?     │       │ maxParticipants │       │ accessories[]   │
│ createdAt       │       │ isActive        │       │ updatedAt       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │                          │
         │                         │                          │
         │                ┌────────▼──────────┐               │
         │                │   Participant     │               │
         │                ├───────────────────┤               │
         └────────────────┤ id (UUID)         │               │
                          │ userId            │               │
                          │ roomId            │               │
                          │ displayName       │               │
                          │ isMuted           │               │
                          │ isCameraOff       │               │
                          │ joinedAt          │               │
                          │ lastActivityAt    │               │
                          └───────────────────┘
                                   │
                                   │
                          ┌────────▼──────────┐
                          │   ChatMessage     │
                          ├───────────────────┤
                          │ id (UUID)         │
                          │ roomId            │
                          │ participantId     │
                          │ content           │
                          │ type (text/system)│
                          │ createdAt         │
                          └───────────────────┘
```

### Table Definitions

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  display_name VARCHAR(100) NOT NULL,
  is_guest BOOLEAN DEFAULT false,
  guest_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**rooms**
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_code CHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  max_participants INT DEFAULT 50,
  is_active BOOLEAN DEFAULT true
);
```

**participants**
```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  is_muted BOOLEAN DEFAULT false,
  is_camera_off BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);
```

**avatar_configs**
```sql
CREATE TABLE avatar_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  model_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accessories JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**room_configs**
```sql
CREATE TABLE room_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  lighting_preset VARCHAR(50) DEFAULT 'default',
  floor_color VARCHAR(7),
  wall_color VARCHAR(7),
  furniture JSONB DEFAULT '[]',
  decorations JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### REST API

#### Authentication Module

```
POST   /api/auth/register          # 회원가입
POST   /api/auth/login             # 로그인 (JWT 발급)
POST   /api/auth/guest             # Guest 토큰 발급
POST   /api/auth/refresh           # JWT 갱신
GET    /api/auth/me                # 현재 사용자 정보
```

#### Room Module

```
POST   /api/rooms                  # 방 생성
GET    /api/rooms/:roomCode        # 방 정보 조회
POST   /api/rooms/:roomCode/join   # 방 입장
POST   /api/rooms/:roomCode/leave  # 방 퇴장
GET    /api/rooms/:roomCode/participants # 참가자 목록
DELETE /api/rooms/:roomCode        # 방 삭제 (Host only)
```

#### Avatar Module

```
GET    /api/avatars/me             # 내 아바타 설정 조회
PUT    /api/avatars/me             # 내 아바타 설정 업데이트
GET    /api/avatars/:userId        # 특정 사용자 아바타 조회
```

#### Room Config Module

```
GET    /api/room-configs/:roomId   # 방 커스터마이징 조회
PUT    /api/room-configs/:roomId   # 방 커스터마이징 업데이트
```

#### Resource Module

```
GET    /api/resources/models       # 사용 가능한 GLB 모델 목록
GET    /api/resources/models/:id   # 특정 모델 URL
POST   /api/resources/upload       # 모델 업로드 (Admin only)
```

### WebSocket Events

#### Client → Server

```typescript
// 방 입장
socket.emit('room:join', { roomCode: string, token: string })

// 아바타 업데이트
socket.emit('avatar:update', {
  primaryColor: string,
  accessories: string[]
})

// 방 설정 업데이트
socket.emit('room:update', {
  lightingPreset: string,
  floorColor: string
})

// 채팅 메시지
socket.emit('chat:message', { content: string })

// Mute/Camera 토글
socket.emit('participant:toggle-mute', { isMuted: boolean })
socket.emit('participant:toggle-camera', { isCameraOff: boolean })

// Active Speaker
socket.emit('participant:active-speaker', { participantId: string })
```

#### Server → Client

```typescript
// 참가자 입장
socket.on('participant:joined', { participant: Participant })

// 참가자 퇴장
socket.on('participant:left', { participantId: string })

// 아바타 업데이트 (브로드캐스트)
socket.on('avatar:updated', {
  participantId: string,
  config: AvatarConfig
})

// 방 설정 업데이트 (브로드캐스트)
socket.on('room:updated', { roomConfig: RoomConfig })

// 채팅 메시지 (브로드캐스트)
socket.on('chat:message', {
  participantId: string,
  content: string,
  timestamp: Date
})

// Participant 상태 변경 (브로드캐스트)
socket.on('participant:state-changed', {
  participantId: string,
  isMuted?: boolean,
  isCameraOff?: boolean
})

// Active Speaker 변경 (브로드캐스트)
socket.on('participant:active-speaker-changed', {
  participantId: string
})

// 에러
socket.on('error', { message: string, code: string })
```

---

## 📊 Phase Breakdown

### Phase 1: Project Setup & Database Foundation (2-3 hours)

**Goal**: NestJS 프로젝트 초기화 및 PostgreSQL 연결 완료

**Test Strategy**:
- Unit tests: Database connection, Entity validation
- Coverage target: 90% (critical setup code)

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [x] **Test: NestJS app should start successfully**
   - File: `test/app.e2e-spec.ts`
   - Test: `GET / returns 200 OK`
   - Status: ✅ Passing (default test included)

2. [x] **Test: Database configuration should load correctly**
   - File: `src/config/__tests__/database.config.spec.ts`
   - Tests: 5 tests covering config loading, env vars, entities
   - Status: ✅ All passing

3. [x] **Test: Environment validation should work**
   - File: `src/config/__tests__/validation.schema.spec.ts`
   - Tests: 7 tests covering validation rules
   - Status: ✅ All passing

4. [x] **Test: User entity should be instantiable**
   - File: `src/entities/__tests__/user.entity.spec.ts`
   - Tests: 5 tests covering user creation, properties, customization
   - Status: ✅ All passing

5. [x] **Test: Room entity should be instantiable**
   - File: `src/entities/__tests__/room.entity.spec.ts`
   - Tests: 5 tests covering room creation, properties, customization
   - Status: ✅ All passing

#### 🟢 GREEN: Implementation
1. [x] Create `apiServer` folder structure
   ```bash
   mkdir -p apiServer
   cd apiServer
   nest new . --package-manager bun
   ```

2. [x] Install dependencies
   ```bash
   bun add @nestjs/typeorm typeorm pg
   bun add @nestjs/config @nestjs/passport @nestjs/jwt
   bun add @nestjs/websockets @nestjs/platform-socket.io
   bun add class-validator class-transformer
   bun add bcrypt uuid
   bun add -d @types/bcrypt @types/uuid
   ```

3. [ ] Setup PostgreSQL with Docker Compose
   - File: `docker-compose.yml`
   - Services: postgres, redis (optional)

4. [x] Configure TypeORM
   - File: `src/config/database.config.ts`
   - Environment variables: `.env`

5. [x] Create base entities
   - `src/entities/user.entity.ts`
   - `src/entities/room.entity.ts`
   - `src/entities/room-participant.entity.ts`

6. [ ] Generate migrations
   ```bash
   npm run migration:generate -- CreateInitialSchema
   npm run migration:run
   ```

#### 🔵 REFACTOR: Improve Code Quality
1. [x] Extract database config to separate module
2. [ ] Add JSDoc comments to entities
3. [x] Setup ESLint + Prettier
4. [ ] Add health check endpoint

**Quality Gate**:
- [x] `bun run start:dev` runs without errors
- [ ] PostgreSQL connection successful (check logs)
- [ ] All migrations applied: `npm run migration:show`
- [x] Tests pass: `bun test` (23 tests, 100% pass rate)
- [x] ESLint passes: `bun run lint`
- [x] TypeScript compiles: `bun run build`
- [ ] Health endpoint responds: `curl http://localhost:3000/health`

**Dependencies**: Docker installed, PostgreSQL knowledge

---

### Phase 2: Authentication Module (JWT + Guest) (3-4 hours)

**Goal**: 회원가입, 로그인, Guest 인증 완료

**Test Strategy**:
- Unit tests: AuthService, JwtStrategy, GuestGuard
- Integration tests: Auth endpoints
- Coverage target: 85%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **Test: POST /api/auth/register should create user**
   - File: `test/auth.e2e-spec.ts`
   - Input: `{ email, password, displayName }`
   - Expected: `201 Created`, JWT token returned
   - Expected failure: Route not found

2. [ ] **Test: POST /api/auth/login should return JWT**
   - Input: `{ email, password }`
   - Expected: `200 OK`, valid JWT
   - Expected failure: Route not found

3. [ ] **Test: POST /api/auth/guest should create guest user**
   - Input: `{ displayName }`
   - Expected: `201 Created`, guest token
   - Expected failure: Route not found

4. [ ] **Test: Protected route should require auth**
   - Test: `GET /api/auth/me` without token → 401
   - Test: `GET /api/auth/me` with valid token → 200
   - Expected failure: Guard not implemented

5. [ ] **Unit Test: AuthService.hashPassword should hash correctly**
   - File: `src/auth/auth.service.spec.ts`
   - Test: Hashed password ≠ plain password
   - Test: bcrypt.compare returns true
   - Expected failure: Method not implemented

#### 🟢 GREEN: Implementation
1. [ ] Generate Auth module
   ```bash
   nest g module auth
   nest g service auth
   nest g controller auth
   ```

2. [ ] Implement AuthService
   - `register()`: Create user, hash password
   - `login()`: Validate credentials, generate JWT
   - `createGuest()`: Create guest user with temp token
   - `validateUser()`: Check credentials

3. [ ] Implement JWT Strategy
   - File: `src/auth/strategies/jwt.strategy.ts`
   - Extract user from JWT payload

4. [ ] Implement Guest Guard
   - File: `src/auth/guards/guest.guard.ts`
   - Allow both JWT and guest tokens

5. [ ] Create Auth DTOs
   - `RegisterDto`, `LoginDto`, `GuestDto`
   - Add validation decorators

6. [ ] Implement Auth Controller
   - `POST /register`
   - `POST /login`
   - `POST /guest`
   - `GET /me`

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Extract JWT config to ConfigService
2. [ ] Add rate limiting for auth endpoints
3. [ ] Improve error messages
4. [ ] Add request logging

**Quality Gate**:
- [ ] All auth tests pass (≥85% coverage)
- [ ] `curl POST /api/auth/register` returns JWT
- [ ] `curl POST /api/auth/guest` returns guest token
- [ ] Protected routes reject invalid tokens
- [ ] Password hashing works (bcrypt test)
- [ ] No plaintext passwords in database
- [ ] Integration tests pass: `bun run test:e2e`

**Dependencies**: Phase 1 complete

---

### Phase 3: Room Management Module (3-4 hours)

**Goal**: 방 생성, 입장, 퇴장, 참가자 관리 완료

**Test Strategy**:
- Unit tests: RoomService business logic
- Integration tests: Room CRUD endpoints
- WebSocket tests: Real-time participant updates
- Coverage target: 80%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **Test: POST /api/rooms should create room**
   - File: `test/room.e2e-spec.ts`
   - Input: `{ maxParticipants: 50 }`
   - Expected: Room with 6-char code
   - Expected failure: Route not found

2. [ ] **Test: POST /api/rooms/:code/join should add participant**
   - Input: `{ token }`
   - Expected: Participant added, WebSocket event emitted
   - Expected failure: Route not found

3. [ ] **Test: Room should auto-delete when empty**
   - Unit test in `room.service.spec.ts`
   - Test: Last participant leaves → room deleted
   - Expected failure: Method not implemented

4. [ ] **Test: Room should reject 51st participant**
   - Test: 50 participants joined, 51st gets 403
   - Expected failure: No validation

#### 🟢 GREEN: Implementation
1. [ ] Generate Room module
   ```bash
   nest g module room
   nest g service room
   nest g controller room
   nest g module participant
   nest g service participant
   ```

2. [ ] Implement RoomService
   - `createRoom()`: Generate unique 6-char code
   - `findByCode()`: Get room by code
   - `deleteRoomIfEmpty()`: Auto-cleanup logic
   - `checkCapacity()`: Validate max participants

3. [ ] Implement ParticipantService
   - `joinRoom()`: Add participant
   - `leaveRoom()`: Remove participant, trigger cleanup
   - `listParticipants()`: Get all in room

4. [ ] Create Room DTOs
   - `CreateRoomDto`, `JoinRoomDto`
   - Add validation

5. [ ] Implement Room Controller
   - `POST /api/rooms`
   - `GET /api/rooms/:code`
   - `POST /api/rooms/:code/join`
   - `POST /api/rooms/:code/leave`

6. [ ] Add scheduled task for room expiration
   - Use `@nestjs/schedule`
   - Delete rooms older than 24h

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Extract room code generation to utility
2. [ ] Add transaction for participant join/leave
3. [ ] Optimize participant queries (add indexes)
4. [ ] Add comprehensive logging

**Quality Gate**:
- [ ] All room tests pass (≥80% coverage)
- [ ] Room creation returns valid code
- [ ] Participant can join and leave
- [ ] Empty rooms auto-delete
- [ ] 51st participant rejected
- [ ] Room code is unique (database constraint)
- [ ] Integration tests pass
- [ ] No memory leaks (load test 100 rooms)

**Dependencies**: Phase 2 complete

---

### Phase 4: WebSocket Gateway & Real-time Sync (3-4 hours)

**Goal**: WebSocket 연결 및 실시간 상태 동기화

**Test Strategy**:
- WebSocket tests: Connection, event emission
- Integration tests: Multi-client scenarios
- Coverage target: 75%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **Test: Client should connect to WebSocket**
   - File: `test/websocket.e2e-spec.ts`
   - Test: `socket.connect()` succeeds
   - Expected failure: Gateway not implemented

2. [ ] **Test: Participant join should broadcast to room**
   - Test: Client A joins, Client B receives event
   - Event: `participant:joined`
   - Expected failure: Event not emitted

3. [ ] **Test: Avatar update should sync to all clients**
   - Test: Client A updates avatar, all others receive
   - Event: `avatar:updated`
   - Expected failure: Event not implemented

4. [ ] **Test: Chat message should broadcast**
   - Test: Client A sends message, all receive
   - Event: `chat:message`
   - Expected failure: Chat not implemented

#### 🟢 GREEN: Implementation
1. [ ] Create WebSocket Gateway
   ```bash
   nest g gateway websocket
   ```

2. [ ] Implement WebSocketGateway
   - File: `src/websocket/websocket.gateway.ts`
   - Handle connection/disconnection
   - Authenticate via JWT/Guest token

3. [ ] Implement room events
   - `room:join`: Add client to room namespace
   - `room:leave`: Remove client
   - `participant:joined`: Broadcast to room
   - `participant:left`: Broadcast to room

4. [ ] Implement state sync events
   - `avatar:update`: Update DB + broadcast
   - `room:update`: Update config + broadcast
   - `participant:toggle-mute`: Update + broadcast
   - `participant:toggle-camera`: Update + broadcast

5. [ ] Implement chat events
   - `chat:message`: Save to DB + broadcast
   - Message validation (length, content)

6. [ ] Add connection manager
   - Track active connections
   - Handle reconnection logic

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Extract broadcast logic to helper
2. [ ] Add rate limiting for messages
3. [ ] Add connection health checks
4. [ ] Implement graceful disconnection

**Quality Gate**:
- [ ] All WebSocket tests pass (≥75% coverage)
- [ ] Multiple clients can connect
- [ ] Events broadcast to correct room only
- [ ] Disconnected clients removed from room
- [ ] Chat messages persisted to database
- [ ] Avatar updates sync in real-time
- [ ] No race conditions (concurrent joins)
- [ ] Load test: 50 clients per room

**Dependencies**: Phase 3 complete

---

### Phase 5: Avatar & Room Customization (2-3 hours)

**Goal**: 아바타/방 커스터마이징 API 및 동기화

**Test Strategy**:
- Unit tests: Avatar/Room config services
- Integration tests: Update endpoints
- Coverage target: 80%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **Test: GET /api/avatars/me should return config**
   - File: `test/avatar.e2e-spec.ts`
   - Expected: Avatar config with default values
   - Expected failure: Route not found

2. [ ] **Test: PUT /api/avatars/me should update config**
   - Input: `{ primaryColor: "#ff0000" }`
   - Expected: 200 OK, config updated
   - Expected failure: Route not found

3. [ ] **Test: PUT /api/room-configs/:id should update room**
   - Input: `{ lightingPreset: "bright" }`
   - Expected: 200 OK, WebSocket event emitted
   - Expected failure: Route not found

#### 🟢 GREEN: Implementation
1. [ ] Generate Avatar module
   ```bash
   nest g module avatar
   nest g service avatar
   nest g controller avatar
   ```

2. [ ] Implement AvatarService
   - `getMyAvatar()`: Get current user config
   - `updateMyAvatar()`: Update + emit WebSocket
   - `getAvatarByUserId()`: Get other user config

3. [ ] Implement RoomConfigService
   - `getRoomConfig()`: Get config
   - `updateRoomConfig()`: Update + emit WebSocket

4. [ ] Create DTOs
   - `UpdateAvatarDto`: colors, accessories
   - `UpdateRoomConfigDto`: lighting, colors

5. [ ] Implement controllers
   - Avatar endpoints
   - RoomConfig endpoints

6. [ ] Integrate with WebSocket
   - Emit `avatar:updated` on PUT
   - Emit `room:updated` on PUT

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Add color validation (hex format)
2. [ ] Add preset validation (enum)
3. [ ] Cache frequently accessed configs

**Quality Gate**:
- [ ] All customization tests pass (≥80% coverage)
- [ ] Avatar updates sync to all participants
- [ ] Room config changes broadcast
- [ ] Invalid colors rejected (400 Bad Request)
- [ ] Integration tests pass
- [ ] Performance: <100ms per update

**Dependencies**: Phase 4 complete

---

### Phase 6: Resource Management & S3 Integration (3-4 hours)

**Goal**: Unity GLB 모델 관리 및 S3/GCS 연동

**Test Strategy**:
- Unit tests: Resource service
- Integration tests: Upload/download
- Mock S3 for tests
- Coverage target: 75%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **Test: GET /api/resources/models should list models**
   - File: `test/resource.e2e-spec.ts`
   - Expected: Array of { id, name, url }
   - Expected failure: Route not found

2. [ ] **Test: POST /api/resources/upload should upload GLB**
   - Input: File upload (multipart)
   - Expected: 201 Created, S3 URL returned
   - Expected failure: Route not found

3. [ ] **Unit Test: generateSignedUrl should create valid URL**
   - File: `resource.service.spec.ts`
   - Test: URL contains correct S3 path
   - Expected failure: Method not implemented

#### 🟢 GREEN: Implementation
1. [ ] Install S3 SDK
   ```bash
   bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   bun add -d @types/multer
   ```

2. [ ] Generate Resource module
   ```bash
   nest g module resource
   nest g service resource
   nest g controller resource
   ```

3. [ ] Implement S3Service
   - `uploadFile()`: Upload to S3 bucket
   - `generateSignedUrl()`: Presigned URL (1 hour)
   - `listModels()`: List objects in bucket
   - `deleteFile()`: Admin only

4. [ ] Implement ResourceService
   - `getAvailableModels()`: List from S3
   - `getModelUrl()`: Get presigned URL
   - `uploadModel()`: Save + upload

5. [ ] Create ResourceController
   - `GET /api/resources/models`
   - `GET /api/resources/models/:id`
   - `POST /api/resources/upload` (Admin only)

6. [ ] Configure S3 credentials
   - File: `.env`
   - Variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Add file type validation (GLB only)
2. [ ] Add file size limit (50MB max)
3. [ ] Implement CDN integration
4. [ ] Add file metadata (dimensions, poly count)

**Quality Gate**:
- [ ] All resource tests pass (≥75% coverage)
- [ ] GLB files upload to S3 successfully
- [ ] Presigned URLs work (test download)
- [ ] Model list returns correct data
- [ ] File validation rejects non-GLB
- [ ] Integration with web_core works
- [ ] Security: Presigned URLs expire after 1h

**Dependencies**: Phase 5 complete, S3 bucket created

---

### Phase 7: Integration Testing & Documentation (2-3 hours)

**Goal**: 전체 시스템 통합 테스트 및 API 문서화

**Test Strategy**:
- E2E tests: Full user journeys
- Load tests: 50 users per room
- Coverage target: Overall ≥80%

**Tasks (TDD Order)**:

#### 🔴 RED: Write Tests First
1. [ ] **E2E Test: Complete room flow**
   - File: `test/full-flow.e2e-spec.ts`
   - Steps:
     1. User registers
     2. Creates room
     3. Guest joins room
     4. Both update avatars
     5. Exchange chat messages
     6. Both leave room
   - Expected: All steps succeed, room auto-deleted
   - Expected failure: Some integration missing

2. [ ] **Load Test: 50 concurrent users**
   - Tool: Artillery or k6
   - Test: 50 users join same room
   - Expected: All connect, no errors
   - Expected failure: Performance issues

#### 🟢 GREEN: Implementation
1. [ ] Setup Swagger documentation
   ```bash
   bun add @nestjs/swagger swagger-ui-express
   ```

2. [ ] Add Swagger decorators
   - All DTOs: `@ApiProperty()`
   - All endpoints: `@ApiOperation()`, `@ApiResponse()`

3. [ ] Create E2E test suite
   - Full registration → room → chat → leave flow
   - Guest flow
   - Avatar customization flow

4. [ ] Create load testing script
   - File: `load-test/scenario.yml` (Artillery)
   - Simulate 50 concurrent users

5. [ ] Add health checks
   - `/health`: Database, Redis status
   - `/metrics`: Prometheus metrics (optional)

6. [ ] Create API documentation
   - File: `README.md` in apiServer
   - Environment setup guide
   - API examples with curl

#### 🔵 REFACTOR: Improve Code Quality
1. [ ] Add request/response logging
2. [ ] Add error monitoring (Sentry, optional)
3. [ ] Optimize database queries (indexes)
4. [ ] Add API versioning (`/api/v1`)

**Quality Gate**:
- [ ] All E2E tests pass
- [ ] Load test: 50 users no errors
- [ ] Swagger UI accessible: http://localhost:3000/api
- [ ] Overall test coverage ≥80%
- [ ] API response time p95 <200ms
- [ ] No memory leaks (24h stress test)
- [ ] Docker build succeeds
- [ ] Production deployment guide complete

**Dependencies**: All previous phases complete

---

## 📈 Progress Tracking

### Phase Completion

| Phase | Status | Duration | Completed Date | Notes |
|-------|--------|----------|----------------|-------|
| Phase 1: Project Setup | ⬜ Not Started | - | - | - |
| Phase 2: Authentication | ⬜ Not Started | - | - | - |
| Phase 3: Room Management | ⬜ Not Started | - | - | - |
| Phase 4: WebSocket Gateway | ⬜ Not Started | - | - | - |
| Phase 5: Customization | ⬜ Not Started | - | - | - |
| Phase 6: Resource & S3 | ⬜ Not Started | - | - | - |
| Phase 7: Integration & Docs | ⬜ Not Started | - | - | - |

### Test Coverage Progress

| Module | Target | Current | Status |
|--------|--------|---------|--------|
| Auth | 85% | 0% | ⬜ Not Started |
| Room | 80% | 0% | ⬜ Not Started |
| WebSocket | 75% | 0% | ⬜ Not Started |
| Avatar | 80% | 0% | ⬜ Not Started |
| Resource | 75% | 0% | ⬜ Not Started |
| **Overall** | **80%** | **0%** | ⬜ Not Started |

---

## 🎯 Definition of Done

This feature is considered complete when:

- [ ] All 7 phases completed with quality gates passed
- [ ] Test coverage ≥80% overall
- [ ] All tests pass (unit, integration, E2E)
- [ ] Build succeeds with no errors/warnings
- [ ] Manual testing completed for all user flows
- [ ] Swagger documentation complete and accessible
- [ ] No regressions in web_core integration
- [ ] Performance metrics maintained (API <200ms p95)
- [ ] Code reviewed and approved
- [ ] Docker deployment successful

---

## 🚨 Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Database connection failures | Low | High | Add retry logic, health checks, connection pooling |
| WebSocket scaling issues | Medium | High | Use Socket.io sticky sessions, Redis adapter for multi-instance |
| S3 upload failures | Medium | Medium | Add retry logic, fallback to local storage, presigned POST |
| JWT token security | Low | High | Use short expiry (15min), refresh tokens, secure secrets |
| Room auto-delete race condition | Medium | Medium | Use database transactions, optimistic locking |
| 50 participant limit exceeded | Low | Low | Strict validation at API level, queue system |
| Guest token abuse | Medium | Low | Rate limiting, IP tracking, short token expiry |
| TypeORM migration conflicts | Low | Medium | Version migrations, test on staging first |

---

## 🔄 Rollback Strategy

### Phase 1 Rollback
- Delete `apiServer` folder
- Remove Docker containers: `docker-compose down -v`
- No database impact

### Phase 2 Rollback
- Remove Auth module: `rm -rf src/auth`
- Drop users table: `DROP TABLE users CASCADE;`
- Revert to Phase 1 state

### Phase 3 Rollback
- Remove Room/Participant modules
- Drop tables: `DROP TABLE rooms, participants CASCADE;`
- Revert to Phase 2 state

### Phase 4 Rollback
- Remove WebSocket gateway
- Remove Socket.io dependencies
- REST API still functional

### Phase 5 Rollback
- Remove Avatar/RoomConfig modules
- Drop tables: `DROP TABLE avatar_configs, room_configs CASCADE;`
- Core functionality intact

### Phase 6 Rollback
- Remove Resource module
- web_core falls back to local GLB files
- No S3 dependency

### Phase 7 Rollback
- Remove E2E tests (no impact on production)
- Documentation rollback: revert commits

---

## ✅ Implementation Status Summary

**Overall Progress**: ~85% Complete

### ✅ Completed (Phase 1-6)

#### Phase 1: Project Setup & Database
- [x] NestJS project initialized
- [x] PostgreSQL configured (Docker)
- [x] Kysely ORM integrated (instead of TypeORM)
- [x] Database migrations implemented
- [x] Users, Rooms, Room_Participants tables created
- [x] UUID extension enabled

#### Phase 2: Authentication Module
- [x] Auth module, service, controller
- [x] JWT Strategy (Passport)
- [x] Password hashing (bcrypt, 10 rounds)
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/guest
- [x] GET /auth/me
- [x] Unit tests (password.service.spec.ts)

#### Phase 3: Room Management Module
- [x] Room module, service, controller
- [x] 6-character room code generation
- [x] POST /rooms - Create room
- [x] GET /rooms/:roomCode - Get room
- [x] POST /rooms/:roomCode/join - Join room
- [x] POST /rooms/:roomCode/leave - Leave room
- [x] DELETE /rooms/:roomCode - Delete room (host only)
- [x] GET /rooms/:roomCode/participants - List participants
- [x] Max participants validation (100)
- [x] Auto-deactivate empty rooms
- [x] Unit tests (room-code.util.spec.ts)

#### Phase 4: WebSocket Gateway
- [x] Gateway module with Socket.io
- [x] JWT authentication adapter (WsJwtAdapter)
- [x] Connection/disconnection handling
- [x] room:join event
- [x] room:leave event
- [x] chat:message event
- [x] state:sync event (avatar position/rotation)
- [x] room:getParticipants event
- [x] Broadcasting logic per room
- [x] Comprehensive tests (room.gateway.spec.ts - 293 lines)

#### Phase 5: Customization Modules
**Avatar Module:**
- [x] Avatar service, controller
- [x] GET /avatars/me
- [x] PUT /avatars/me
- [x] GET /avatars/:userId
- [x] WebSocket sync (avatar:updated event)
- [x] Unit tests (avatar.service.spec.ts)

**Room Config Module:**
- [x] Room-config service, controller
- [x] GET /room-configs/:roomCode
- [x] PUT /room-configs/:roomCode (host only)
- [x] WebSocket sync (room:updated event)
- [x] Unit tests (room-config.service.spec.ts)

#### Phase 6: Resource & S3
- [x] Resource service, controller
- [x] S3 service with AWS SDK v3
- [x] GET /resources/models - List models
- [x] GET /resources/models/:id - Get presigned URL (1 hour)
- [x] POST /resources/upload - Upload GLB (50MB limit)
- [x] DELETE /resources/models/:id - Delete model
- [x] File validation (GLB only)
- [x] Unit tests (resource.service.spec.ts)

#### Additional Completed Features
- [x] Swagger UI at /api
- [x] Docker Compose setup
- [x] Automatic migrations on startup
- [x] CORS enabled
- [x] Environment validation
- [x] 78 unit tests total
- [x] Health check for PostgreSQL

### ⚠️ Partially Complete (Phase 7)

#### Documentation & Testing
- [x] Swagger documentation
- [x] README with setup instructions
- [x] Docker deployment files
- [x] 78 unit tests (~80% coverage)
- [ ] Comprehensive E2E tests (only basic test exists)
- [ ] Load testing (50+ concurrent users)
- [ ] Performance benchmarks

### ❌ Not Implemented (Optional/Future)

#### Low Priority Features
1. **Chat Message Persistence**
   - WebSocket chat works, but messages not saved to DB
   - chat_messages table not created

2. **Health Check Endpoint**
   - No /health or /health/ready endpoint
   - No liveness probe logic

3. **API Versioning**
   - No /api/v1 versioning
   - Direct /endpoint usage

4. **Rate Limiting**
   - No rate limiting on auth endpoints
   - @nestjs/throttler not configured

5. **Redis Integration**
   - No session/cache with Redis
   - Socket.io Redis adapter not used

6. **Scheduled Tasks**
   - No auto-cleanup of old rooms (24h+)
   - @nestjs/schedule not used

7. **Advanced Monitoring**
   - No APM (e.g., Sentry, DataDog)
   - Basic logging only

### 📊 Technical Stack (As Implemented)

**Core:**
- NestJS 11.x ✅
- TypeScript 5.7 ✅
- Bun runtime ✅

**Database:**
- PostgreSQL 16 ✅
- Kysely ORM 0.28.9 ✅ (instead of TypeORM)

**Real-time:**
- Socket.io 4.8 ✅
- JWT WebSocket auth ✅

**Storage:**
- AWS S3 SDK v3 ✅
- Presigned URLs ✅

**Testing:**
- Jest 30.0 ✅
- 78 unit tests ✅
- Basic E2E ⚠️

**Deployment:**
- Docker & Docker Compose ✅
- Makefile commands ✅

### 🎯 Next Steps (If Continuing)

1. **E2E Test Suite** (2-3 hours)
   - Full user journey tests
   - Multi-user room scenarios
   - WebSocket event flow tests

2. **Performance Testing** (1-2 hours)
   - Artillery or k6 scripts
   - 50+ concurrent users
   - p95/p99 response time metrics

3. **Chat Persistence** (1-2 hours)
   - Create chat_messages table
   - Save messages in room:message handler
   - Add GET /rooms/:roomCode/messages endpoint

4. **Health Checks** (30 min)
   - GET /health (basic)
   - GET /health/ready (DB + S3 check)

5. **Monitoring Setup** (1 hour)
   - Winston logger
   - Request logging middleware
   - Error tracking (Sentry)

6. **Optional: Redis** (2-3 hours)
   - Redis for session storage
   - Socket.io Redis adapter for scaling

---

## 📝 Notes & Learnings

### Phase 1 Notes
-

### Phase 2 Notes
-

### Phase 3 Notes
-

### Phase 4 Notes
-

### Phase 5 Notes
-

### Phase 6 Notes
-

### Phase 7 Notes
-

### General Observations
-

---

## 📚 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: 2025-12-26
**Plan Version**: 1.1 (Updated with implementation status)
**Implementation Status**: 85% Complete (Phase 1-6 done, Phase 7 partial)
**Next Actions**: E2E tests, performance testing, optional features
