# Implementation Plan: Frontend Monorepo Migration

**Status**: 🚧 In Progress - Phase 1 Complete
**Started**: 2026-01-04
**Last Updated**: 2026-01-04
**Estimated Completion**: 2026-01-05

---

**⚠️ CRITICAL INSTRUCTIONS**: After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date above
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ **DO NOT skip quality gates or proceed with failing checks**

---

## 📋 Overview

### Feature Description
Migrate the current monolithic `web_core` (6,100+ lines) into a structured monorepo architecture that separates concerns:
- **3D Viewer**: Babylon.js rendering engine (migrated from web_core)
- **Chat UI**: React-based chat interface with text, emoji, and mentions
- **Main App**: Integration shell combining both modules
- **Shared**: Common types, utilities, and API clients

### Success Criteria
- [ ] Monorepo structure created with pnpm workspaces + Turborepo
- [ ] All web_core functionality migrated to 3d-viewer package
- [ ] Chat UI fully functional with text, emoji/reactions, mentions/notifications
- [ ] Each package has independent demo page and standalone script
- [ ] Main app successfully integrates both packages
- [ ] All existing tests migrated and passing
- [ ] Build optimized with Turbo caching
- [ ] No Docker dependency for frontend development

### User Impact
- **Developers**: Better code organization, faster builds, independent module development
- **End Users**: No impact - seamless migration with same functionality
- **Future**: Easier to add mobile/desktop clients by reusing packages

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **pnpm workspaces** | Superior monorepo support, efficient disk space usage, strict dependency resolution | Requires pnpm installation (not npm) |
| **Turborepo** | Intelligent caching, parallel builds, task orchestration | Additional configuration, learning curve |
| **Separate packages** | Clear boundaries, independent testing, parallel development | More initial setup, coordination needed |
| **React for Chat** | Rich ecosystem, component reusability, easier state management | Additional bundle size vs vanilla TS |
| **Vite everywhere** | Fast dev server, unified build tool, HMR support | Consistent across all packages |
| **Source referencing in dev** | HMR across packages, no build needed during development | Slight complexity in package.json exports |

---

## 📦 Dependencies

### Required Before Starting
- [ ] Node.js ≥18.0.0 installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Current web_core functionality verified working
- [ ] Git branch created for migration

### External Dependencies
- pnpm: ^8.15.0
- turbo: ^2.0.0
- vite: ^5.0.0
- @babylonjs/core: ^7.37.1 (existing)
- react: ^18.3.0 (new for chat-ui)
- react-dom: ^18.3.0 (new for chat-ui)
- zustand: ^4.5.0 (new for chat state)
- typescript: ~5.9.3 (existing)

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | Component logic, utilities, state management |
| **Integration Tests** | Critical paths | Package interactions, WebSocket communication |
| **E2E Tests** | Key user flows | Full chat + 3D integration scenarios |

### Test File Organization
```
packages/
├── 3d-viewer/
│   ├── src/
│   └── __tests__/
│       ├── unit/
│       └── integration/
├── chat-ui/
│   ├── src/
│   └── __tests__/
│       ├── unit/
│       └── integration/
├── main-app/
│   └── __tests__/
│       └── e2e/
└── shared/
    └── __tests__/
```

### Coverage Requirements by Phase
- **Phase 1 (Setup)**: Config and structure verification (100%)
- **Phase 2 (3D Viewer)**: Migrate existing tests (current coverage maintained)
- **Phase 3 (3D Testing)**: Verify test independence (≥80%)
- **Phase 4 (Chat Foundation)**: Component unit tests (≥85%)
- **Phase 5 (Chat Features)**: Feature integration tests (≥80%)
- **Phase 6 (Integration)**: E2E critical paths (100% of key flows)

### Test Naming Convention
```typescript
// Vitest convention (used across all packages)
describe('ComponentName', () => {
  it('should do something when condition', () => {
    // Arrange → Act → Assert
  });
});
```

---

## 🚀 Implementation Phases

### Phase 1: Monorepo Foundation Setup ✅
**Goal**: Create working monorepo structure with build system
**Estimated Time**: 1-2 hours
**Status**: ✅ Complete
**Actual Time**: 1 hour

#### Tasks

**🔴 RED: Write Failing Tests First**
- [x] **Test 1.1**: Write build verification tests
  - File(s): `frontend/validate-workspace.test.js`
  - Expected: Tests FAIL because structure doesn't exist ✅
  - Details: Verified pnpm-workspace.yaml, turbo.json, package dependencies
  - Results: 14 tests created, all initially failed as expected

**🟢 GREEN: Implement to Make Tests Pass**
- [x] **Task 1.2**: Create monorepo root structure
  - File(s): `frontend/package.json`, `frontend/pnpm-workspace.yaml`
  - Goal: Initialize pnpm workspace ✅
  - Created workspace with 5 packages detected

- [x] **Task 1.3**: Configure Turborepo
  - File(s): `frontend/turbo.json`
  - Goal: Setup build pipeline and caching ✅
  - Configured: `build`, `dev`, `dev:standalone`, `test`, `lint`, `type-check` pipelines

- [x] **Task 1.4**: Setup shared TypeScript config
  - File(s): `frontend/tsconfig.base.json`
  - Goal: Common TypeScript settings for all packages ✅
  - Configured: Strict mode, path mappings, module resolution

- [x] **Task 1.5**: Create packages directory structure
  - Directories: `packages/shared`, `packages/3d-viewer`, `packages/chat-ui`, `packages/main-app` ✅
  - Goal: Package skeleton with package.json ✅
  - All 4 packages created with complete package.json files

- [x] **Task 1.6**: Create shared package basics
  - File(s): `packages/shared/package.json`
  - Goal: Shared package foundation ✅
  - Setup: Exports configured for types, api, socket modules

**🔵 REFACTOR: Clean Up Code**
- [x] **Task 1.7**: Optimize workspace configuration
  - Files: `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`
  - Goal: Ensure efficient caching and parallel builds ✅
  - Completed:
    - [x] Workspace globs cover all packages
    - [x] Turbo task dependencies configured correctly
    - [x] Root scripts added for dev, build, test
    - [x] `.npmrc` created for peer dependency handling

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**TDD Compliance**:
- [x] Setup verification tests pass ✅ (14/14 tests passing)
- [x] Directory structure validated ✅

**Build & Tests**:
- [x] `pnpm install` completes successfully ✅
- [x] `pnpm run build` executes (even with empty packages) ✅
- [x] Turbo cache initializes correctly ✅
- [x] TypeScript config validation passes ✅

**Code Quality**:
- [x] pnpm-workspace.yaml valid YAML ✅
- [x] turbo.json valid JSON ✅
- [x] All package.json files valid ✅
- [x] TypeScript base config compiles ✅

**Documentation**:
- [ ] frontend/README.md created with setup instructions (deferred to next phase)
- [x] Turbo.json pipeline configured and documented ✅

**Validation Commands**:
```bash
# Workspace validation
cd frontend
pnpm install  # ✅ Passed
node validate-workspace.test.js  # ✅ 14/14 tests passed

# Verify workspace packages
pnpm ls -r --depth -1  # ✅ All 4 packages detected
```

**Manual Test Checklist**:
- [x] Can run `pnpm install` without errors ✅
- [x] Workspace packages linked correctly (check node_modules) ✅
- [x] Turbo recognizes all packages ✅ (turbo 2.7.2 installed)

#### 📝 Phase 1 Notes & Learnings

**Key Achievements**:
- Created comprehensive monorepo structure with pnpm workspaces
- Configured Turborepo with 7 pipeline tasks (build, dev, dev:standalone, test, lint, type-check, clean)
- Set up TypeScript path mappings for all packages
- Created validation test suite with 14 tests to verify workspace integrity
- All 4 packages properly configured with required scripts

**Files Created**:
- `frontend/package.json` - Root workspace configuration
- `frontend/pnpm-workspace.yaml` - Workspace package globs
- `frontend/turbo.json` - Build pipeline and caching configuration
- `frontend/tsconfig.base.json` - Shared TypeScript configuration
- `frontend/.npmrc` - Peer dependency handling
- `frontend/validate-workspace.test.js` - 14 validation tests
- `frontend/packages/{shared,3d-viewer,chat-ui,main-app}/package.json` - Package configurations

**Technical Decisions**:
- Used pnpm 7.9.0 (adjusted from initial 9.0.0 requirement for compatibility)
- Configured auto-install-peers in .npmrc for Babylon.js dependencies
- Set up conditional exports for dev (src) vs production (dist) mode
- Workspace protocol (`workspace:*`) for inter-package dependencies

**Issues Resolved**:
- Fixed JSON comment syntax in tsconfig.base.json (JSON doesn't support /* */ comments)
- Resolved Babylon.js peer dependency warnings with .npmrc configuration
- Adjusted pnpm version requirement to match installed version (7.9.0)

**Next Steps**:
- Phase 2: Migrate web_core (6,100+ lines) to packages/3d-viewer
- Create demo.html for standalone 3d-viewer testing
- Migrate Babylon.js initialization and rendering code

---

### Phase 2: 3D Viewer Package Migration
**Goal**: Migrate web_core to packages/3d-viewer with working demo
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: Write demo page load test
  - File(s): `packages/3d-viewer/__tests__/demo.test.ts`
  - Expected: FAIL - demo page doesn't exist
  - Details: Verify demo page renders canvas, loads Babylon.js

- [ ] **Test 2.2**: Write standalone build test
  - File(s): `packages/3d-viewer/__tests__/build.test.ts`
  - Expected: FAIL - package doesn't build yet
  - Details: Verify vite build succeeds, bundle size acceptable

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.3**: Create 3d-viewer package structure
  - File(s): `packages/3d-viewer/package.json`
  - Goal: Setup Vite + Babylon.js dependencies
  - Dependencies: @babylonjs/core, @babylonjs/loaders, @animal-zoom/shared

- [ ] **Task 2.4**: Migrate source code from web_core
  - Source: `web_core/src/` → `packages/3d-viewer/src/`
  - Files to migrate:
    - `scene/*` → SceneManager, ParticipantManager
    - `resources/*` → ResourceLoader, AssetUrlResolver
    - `socket/*` → WebSocketClientController
    - `components/*` → JoinScreen, ControlBar
    - `app.ts` → main.ts (entry point)
  - Goal: Preserve all functionality

- [ ] **Task 2.5**: Create demo page for standalone testing
  - File(s): `packages/3d-viewer/demo.html`
  - Goal: Independent 3D viewer test page
  - Features:
    - Canvas full screen
    - Mock room data
    - Controls to test camera, avatars
    - Connection status indicator

- [ ] **Task 2.6**: Setup standalone dev script
  - File(s): `packages/3d-viewer/package.json` scripts section
  - Goal: `pnpm run dev:standalone` works
  - Script: `vite demo.html --port 5173 --open`

- [ ] **Task 2.7**: Configure Vite for library mode
  - File(s): `packages/3d-viewer/vite.config.ts`
  - Goal: Build as library for consumption by main-app
  - Exports: `ViewerApp` class, types

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 2.8**: Optimize imports and exports
  - Files: All migrated source files
  - Goal: Use @animal-zoom/shared for types
  - Checklist:
    - [ ] Replace relative imports with package imports where appropriate
    - [ ] Export public API from main.ts
    - [ ] Remove unused dependencies
    - [ ] Update import paths for new structure

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 3 until ALL checks pass**

**TDD Compliance**:
- [ ] Demo page tests pass
- [ ] Build tests pass
- [ ] Coverage maintained from web_core

**Build & Tests**:
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run dev` starts dev server
- [ ] `pnpm run dev:standalone` opens demo page
- [ ] Demo page loads without console errors
- [ ] Babylon.js scene renders correctly

**Code Quality**:
- [ ] TypeScript compiles with no errors
- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] Linting passes

**Functionality**:
- [ ] Demo page shows 3D scene
- [ ] Can add test avatars programmatically
- [ ] Camera controls work
- [ ] No regressions from web_core

**Validation Commands**:
```bash
cd packages/3d-viewer

# Build verification
pnpm run build
pnpm run type-check

# Dev server
pnpm run dev:standalone
# Visit http://localhost:5173 - verify scene loads

# Test suite
pnpm run test
```

**Manual Test Checklist**:
- [ ] Open demo.html - 3D scene renders
- [ ] Add test avatar - appears in scene
- [ ] Camera controls responsive
- [ ] No console errors

---

### Phase 3: 3D Viewer Testing & Verification
**Goal**: Ensure all migrated tests pass and package works independently
**Estimated Time**: 1 hour
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 3.1**: Write package isolation test
  - File(s): `packages/3d-viewer/__tests__/isolation.test.ts`
  - Expected: FAIL initially
  - Details: Verify no unintended dependencies on web_core or other packages

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 3.2**: Migrate existing unit tests
  - Source: `web_core/src/**/__tests__/` → `packages/3d-viewer/__tests__/unit/`
  - Files: SceneManager, ResourceLoader, WebSocketClientController tests
  - Goal: All existing tests migrated and passing

- [ ] **Task 3.3**: Update test configuration
  - File(s): `packages/3d-viewer/vitest.config.ts`
  - Goal: Test setup, mocks, coverage thresholds
  - Happy-dom for DOM simulation

- [ ] **Task 3.4**: Fix any broken test dependencies
  - Files: Test files that fail due to import changes
  - Goal: All tests green
  - Common fixes: Update mocks, fix import paths

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 3.5**: Improve test organization
  - Files: All test files
  - Goal: Consistent structure and naming
  - Checklist:
    - [ ] Group related tests in describe blocks
    - [ ] Clear test names (should + behavior)
    - [ ] Shared test utilities extracted
    - [ ] Mock data in fixtures/

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 4 until ALL checks pass**

**TDD Compliance**:
- [ ] All migrated tests pass
- [ ] Package isolation verified
- [ ] Coverage ≥ web_core original coverage

**Build & Tests**:
- [ ] `pnpm run test` - 100% passing
- [ ] `pnpm run test:coverage` - meets threshold
- [ ] Tests run in <10 seconds
- [ ] No flaky tests (run 3x)

**Code Quality**:
- [ ] Test code linted
- [ ] No skipped/commented tests
- [ ] No console warnings during tests

**Validation Commands**:
```bash
cd packages/3d-viewer

# Run all tests
pnpm run test

# Coverage check
pnpm run test:coverage
# Verify coverage ≥80% overall

# Watch mode for dev
pnpm run test:watch
```

**Manual Test Checklist**:
- [ ] All unit tests pass
- [ ] Coverage report generated
- [ ] No unexpected test dependencies

---

### Phase 4: Chat UI Package Foundation
**Goal**: Create React-based chat UI package with demo page
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 4.1**: Write ChatWindow component tests
  - File(s): `packages/chat-ui/__tests__/ChatWindow.test.tsx`
  - Expected: FAIL - component doesn't exist
  - Details: Render, message display, input handling

- [ ] **Test 4.2**: Write chat store tests
  - File(s): `packages/chat-ui/__tests__/chatStore.test.ts`
  - Expected: FAIL - store doesn't exist
  - Details: Add message, clear, filter, state management

- [ ] **Test 4.3**: Write demo page test
  - File(s): `packages/chat-ui/__tests__/demo.test.ts`
  - Expected: FAIL - demo doesn't exist
  - Details: Standalone page loads, mock messages work

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 4.4**: Initialize React + TypeScript package
  - File(s): `packages/chat-ui/package.json`
  - Goal: Setup React, Vite, TypeScript
  - Dependencies: react, react-dom, zustand, @animal-zoom/shared

- [ ] **Task 4.5**: Create component structure
  - Files to create:
    ```
    src/
    ├── components/
    │   ├── ChatWindow.tsx
    │   ├── MessageList.tsx
    │   ├── MessageItem.tsx
    │   └── MessageInput.tsx
    ├── store/
    │   └── chatStore.ts
    ├── hooks/
    │   ├── useChat.ts
    │   └── useSocket.ts
    └── main.tsx (entry + export)
    ```

- [ ] **Task 4.6**: Implement ChatWindow component
  - File(s): `packages/chat-ui/src/components/ChatWindow.tsx`
  - Goal: Main chat container
  - Features: MessageList + MessageInput

- [ ] **Task 4.7**: Implement chat store (Zustand)
  - File(s): `packages/chat-ui/src/store/chatStore.ts`
  - Goal: State management for messages
  - State: messages[], addMessage, clearMessages

- [ ] **Task 4.8**: Create demo page
  - File(s): `packages/chat-ui/demo.html`, `packages/chat-ui/demo.tsx`
  - Goal: Standalone chat testing
  - Features:
    - Full chat UI
    - Mock message generator
    - Test different message types
    - Connection status

- [ ] **Task 4.9**: Setup standalone dev script
  - File(s): `packages/chat-ui/package.json`
  - Script: `dev:standalone` on port 5174

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 4.10**: Extract reusable components
  - Files: All component files
  - Goal: DRY, reusable pieces
  - Checklist:
    - [ ] Extract message timestamp formatter
    - [ ] Create Avatar component (if needed)
    - [ ] Shared UI primitives (Button, Input)
    - [ ] CSS modules or styled-components

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 5 until ALL checks pass**

**TDD Compliance**:
- [ ] All component tests pass
- [ ] Store tests pass
- [ ] Coverage ≥85%

**Build & Tests**:
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run dev:standalone` works
- [ ] `pnpm run test` passes
- [ ] Demo page renders without errors

**Code Quality**:
- [ ] TypeScript strict mode passes
- [ ] React hooks rules followed
- [ ] No prop-types warnings
- [ ] ESLint passes

**Functionality**:
- [ ] Demo page displays chat UI
- [ ] Can send mock messages
- [ ] Messages render correctly
- [ ] State management works

**Validation Commands**:
```bash
cd packages/chat-ui

# Build
pnpm run build
pnpm run type-check

# Dev server
pnpm run dev:standalone
# Visit http://localhost:5174

# Tests
pnpm run test
pnpm run test:coverage
```

**Manual Test Checklist**:
- [ ] Demo page loads chat UI
- [ ] Can type in message input
- [ ] Mock messages display
- [ ] Scrolling works

---

### Phase 5: Chat UI Features (Text, Emoji, Mentions)
**Goal**: Implement text messaging, emoji/reactions, mention/notification features
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 5.1**: Write WebSocket integration tests
  - File(s): `packages/chat-ui/__tests__/integration/websocket.test.ts`
  - Expected: FAIL - not implemented
  - Details: Send message, receive message, connection handling

- [ ] **Test 5.2**: Write emoji picker tests
  - File(s): `packages/chat-ui/__tests__/EmojiPicker.test.tsx`
  - Expected: FAIL - component doesn't exist
  - Details: Open picker, select emoji, insert into message

- [ ] **Test 5.3**: Write mention parsing tests
  - File(s): `packages/chat-ui/__tests__/utils/mention.test.ts`
  - Expected: FAIL - utility doesn't exist
  - Details: Parse @mentions, highlight, notification

- [ ] **Test 5.4**: Write reaction tests
  - File(s): `packages/chat-ui/__tests__/MessageReaction.test.tsx`
  - Expected: FAIL - feature doesn't exist
  - Details: Add reaction, remove reaction, display count

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 5.5**: Integrate WebSocket for real messaging
  - File(s): `packages/chat-ui/src/hooks/useSocket.ts`
  - Goal: Connect to apiServer WebSocket
  - Events: chat:message, chat:typing, chat:reaction

- [ ] **Task 5.6**: Implement EmojiPicker component
  - File(s): `packages/chat-ui/src/components/EmojiPicker.tsx`
  - Goal: Emoji selection UI
  - Library: emoji-picker-react or custom

- [ ] **Task 5.7**: Implement mention parsing
  - File(s): `packages/chat-ui/src/utils/mention.ts`
  - Goal: Detect @username in messages
  - Features: Autocomplete, highlight, notification

- [ ] **Task 5.8**: Implement message reactions
  - File(s): `packages/chat-ui/src/components/MessageReaction.tsx`
  - Goal: Add/remove reactions to messages
  - UI: Reaction button, picker, display

- [ ] **Task 5.9**: Update MessageInput with features
  - File(s): `packages/chat-ui/src/components/MessageInput.tsx`
  - Goal: Emoji button, mention suggestions
  - Features: @ trigger, emoji button

- [ ] **Task 5.10**: Update MessageItem with reactions
  - File(s): `packages/chat-ui/src/components/MessageItem.tsx`
  - Goal: Display reactions, mention highlights

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 5.11**: Optimize chat performance
  - Files: ChatWindow, MessageList
  - Goal: Smooth scrolling, virtualization if needed
  - Checklist:
    - [ ] Memoize expensive components
    - [ ] Debounce typing indicator
    - [ ] Optimize re-renders
    - [ ] Message list virtualization (if >100 messages)

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 6 until ALL checks pass**

**TDD Compliance**:
- [ ] All feature tests pass
- [ ] Integration tests pass
- [ ] Coverage ≥80%

**Build & Tests**:
- [ ] All tests passing
- [ ] Demo page shows all features
- [ ] WebSocket connection stable
- [ ] No console errors

**Code Quality**:
- [ ] TypeScript strict
- [ ] React performance optimized
- [ ] Accessible (keyboard nav, ARIA)

**Functionality**:
- [ ] Text messaging works
- [ ] Emoji picker functional
- [ ] @mentions parsed and highlighted
- [ ] Reactions add/remove correctly
- [ ] Real-time updates via WebSocket

**Performance**:
- [ ] Message list smooth (60fps)
- [ ] No lag when typing
- [ ] Emoji picker opens quickly

**Validation Commands**:
```bash
cd packages/chat-ui

# Full test suite
pnpm run test
pnpm run test:coverage

# Build verification
pnpm run build

# Run demo and test all features
pnpm run dev:standalone
```

**Manual Test Checklist**:
- [ ] Send text message → appears in list
- [ ] Click emoji button → picker opens → emoji inserts
- [ ] Type @use → autocomplete suggests users
- [ ] Click reaction on message → reaction adds
- [ ] Real-time: Open two demo pages → messages sync

---

### Phase 6: Main App Integration
**Goal**: Create main-app that combines 3d-viewer + chat-ui with proper layout
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 6.1**: Write integration E2E test
  - File(s): `packages/main-app/__tests__/e2e/full-app.test.ts`
  - Expected: FAIL - app doesn't exist
  - Details: 3D scene + chat both load, can send chat from main app

- [ ] **Test 6.2**: Write layout responsiveness test
  - File(s): `packages/main-app/__tests__/layout.test.ts`
  - Expected: FAIL - layout doesn't exist
  - Details: 3D area 70%, chat 30%, responsive breakpoints

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 6.3**: Create main-app package structure
  - File(s): `packages/main-app/package.json`
  - Dependencies: @animal-zoom/3d-viewer, @animal-zoom/chat-ui, @animal-zoom/shared

- [ ] **Task 6.4**: Create app layout
  - File(s): `packages/main-app/src/App.tsx`
  - Goal: Integrate 3D viewer + chat UI
  - Layout:
    ```
    <div className="app-container">
      <div className="video-area"><!-- 3D Canvas --></div>
      <div className="chat-area"><!-- Chat UI --></div>
      <div className="control-bar"><!-- Controls --></div>
    </div>
    ```

- [ ] **Task 6.5**: Mount 3D Viewer
  - File(s): `packages/main-app/src/components/VideoArea.tsx`
  - Goal: Initialize ViewerApp from 3d-viewer
  - Import: `import { ViewerApp } from '@animal-zoom/3d-viewer'`

- [ ] **Task 6.6**: Mount Chat UI
  - File(s): `packages/main-app/src/components/ChatArea.tsx`
  - Goal: Mount chat components
  - Import: `import { ChatWindow } from '@animal-zoom/chat-ui'`

- [ ] **Task 6.7**: Setup cross-package communication
  - File(s): `packages/main-app/src/integration/EventBridge.ts`
  - Goal: Chat messages trigger 3D actions (e.g., chat bubble)
  - Events: message sent → show in 3D

- [ ] **Task 6.8**: Configure Vite for main-app
  - File(s): `packages/main-app/vite.config.ts`
  - Goal: Bundle both packages efficiently
  - Optimization: Code splitting, tree shaking

- [ ] **Task 6.9**: Add index.html and entry point
  - File(s): `packages/main-app/index.html`, `packages/main-app/src/main.tsx`
  - Goal: App entry and HTML shell

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 6.10**: Optimize bundle size
  - Files: vite.config.ts, imports
  - Goal: Minimize production bundle
  - Checklist:
    - [ ] Remove unused imports
    - [ ] Configure code splitting
    - [ ] Lazy load chat-ui if not immediately needed
    - [ ] Analyze bundle (rollup-plugin-visualizer)

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed until ALL checks pass**

**TDD Compliance**:
- [ ] E2E tests pass
- [ ] Layout tests pass
- [ ] Integration verified

**Build & Tests**:
- [ ] `pnpm run build` succeeds
- [ ] `pnpm run dev` starts app
- [ ] Both 3D and chat load correctly
- [ ] All package tests still pass

**Code Quality**:
- [ ] TypeScript compiles
- [ ] No circular dependencies
- [ ] Clean console (no warnings)

**Functionality**:
- [ ] 3D scene renders
- [ ] Chat UI functional
- [ ] Can send messages while in 3D room
- [ ] Cross-package events work
- [ ] Responsive layout

**Performance**:
- [ ] Initial load <3 seconds
- [ ] 60fps in 3D
- [ ] Smooth chat scrolling
- [ ] Bundle size reasonable (<2MB total)

**Validation Commands**:
```bash
# From monorepo root
cd frontend

# Build all packages
pnpm run build

# Run main app
cd packages/main-app
pnpm run dev
# Visit http://localhost:5175

# Run all tests
pnpm run test --recursive

# Bundle analysis
pnpm run build
pnpm run analyze
```

**Manual Test Checklist**:
- [ ] Open http://localhost:5175
- [ ] 3D scene loads on left
- [ ] Chat UI loads on right
- [ ] Send chat message → appears in chat
- [ ] Verify responsive: Resize window → layout adapts
- [ ] Join room → both 3D and chat connect

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Import path issues during migration | High | Medium | Use TypeScript path mapping, test thoroughly in Phase 2-3 |
| WebSocket connection conflicts | Medium | Medium | Reuse shared socket client from @animal-zoom/shared |
| Build time increase | Medium | Low | Turborepo caching, parallel builds, optimize dependencies |
| Test flakiness in E2E | Medium | Medium | Proper mocking, stable test data, retry logic |
| Bundle size too large | Low | Medium | Code splitting, lazy loading, analyze bundle regularly |
| React state synchronization issues | Low | High | Use Zustand, clear state boundaries, thorough testing |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
**Steps to revert**:
- Delete `frontend/` directory
- Restore to pre-migration state
- No impact on existing web_core or apiServer

### If Phase 2 Fails
**Steps to revert**:
- Keep Phase 1 (monorepo structure useful)
- Delete `packages/3d-viewer`
- Continue using web_core
- Undo: `git checkout -- web_core/`

### If Phase 3 Fails
**Steps to revert**:
- Fix test issues (likely import paths)
- Or revert Phase 2 and restart migration
- Tests are critical - don't skip

### If Phase 4-5 Fails
**Steps to revert**:
- Delete `packages/chat-ui`
- Phase 1-3 (3d-viewer) still valuable
- Chat can be added later

### If Phase 6 Fails
**Steps to revert**:
- Delete `packages/main-app`
- Use 3d-viewer and chat-ui independently
- Integration can be attempted later

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%
- **Phase 4**: ⏳ 0%
- **Phase 5**: ⏳ 0%
- **Phase 6**: ⏳ 0%

**Overall Progress**: 0% complete

### Time Tracking
| Phase | Estimated | Actual | Variance |
|-------|-----------|--------|----------|
| Phase 1 | 1-2 hours | - | - |
| Phase 2 | 2-3 hours | - | - |
| Phase 3 | 1 hour | - | - |
| Phase 4 | 2-3 hours | - | - |
| Phase 5 | 2-3 hours | - | - |
| Phase 6 | 2-3 hours | - | - |
| **Total** | 10-16 hours | - | - |

---

## 📝 Notes & Learnings

### Implementation Notes
_To be filled during implementation_

### Blockers Encountered
_To be documented as they arise_

### Improvements for Future Plans
_To be captured after completion_

---

## 📚 References

### Documentation
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Zustand State Management](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Related Issues
- Current web_core: `/home/lotus/document/lotus/animal-zoom/web_core`
- API Server: `/home/lotus/document/lotus/animal-zoom/apiServer`

---

## ✅ Final Checklist

**Before marking plan as COMPLETE**:
- [ ] All phases completed with quality gates passed
- [ ] Full integration testing performed (3D + Chat + Main)
- [ ] Documentation updated (README.md in each package)
- [ ] Performance benchmarks meet targets (<3s load, 60fps)
- [ ] All tests passing (unit + integration + E2E)
- [ ] Bundle size optimized (<2MB total)
- [ ] Demo pages work for all packages
- [ ] Standalone scripts tested
- [ ] Migration guide created for team
- [ ] Old web_core archived or removed

---

**Plan Status**: 🔄 Ready to Start
**Next Action**: Begin Phase 1 - Monorepo Foundation Setup
**Blocked By**: None - User approved, ready to implement
