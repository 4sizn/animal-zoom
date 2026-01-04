# Implementation Plan: SimpleGuest Router

**Status**: 🔄 In Progress
**Started**: 2026-01-04
**Last Updated**: 2026-01-04
**Estimated Completion**: 2026-01-04

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
This feature adds a new **SimpleGuest** route to the main-app that provides a simplified interface for users to quickly create or join meetings. The page includes:
- Nickname input field for user identification
- "Create Room" button to generate a new meeting room
- Room ID input field (auto-populated after room creation)
- "Join Room" button to enter an existing room by ID

This simplifies the guest experience by consolidating room creation and joining into a single, streamlined interface.

### Success Criteria
- [ ] Users can enter their nickname
- [ ] Users can create a new room with one click
- [ ] Room ID is automatically populated after creation
- [ ] Users can manually enter a room ID and join
- [ ] Proper error handling for invalid room IDs
- [ ] Navigation to participant-preview after joining

### User Impact
- **Faster onboarding**: Guests can join meetings without navigating multiple pages
- **Simplified workflow**: Combined create/join interface reduces confusion
- **Better UX**: Auto-populated room ID prevents copy-paste errors

---

## 🏗️ Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Reuse existing `meetingStore` | Leverages proven state management and API integration | Inherits any limitations of current store design |
| Use existing UI components | Maintains design consistency, reduces development time | Limited customization for this specific use case |
| Single page for create/join | Simplifies guest experience | Slightly less separation of concerns than dedicated pages |
| Auto-populate room ID after creation | Reduces user friction and errors | Assumes users want to share the room ID immediately |

---

## 📦 Dependencies

### Required Before Starting
- [x] React Router v6 configured
- [x] Zustand meetingStore with createMeeting/joinMeeting methods
- [x] roomsApi (@animal-zoom/shared/api) available
- [x] UI components (Button, Input, Card) implemented

### External Dependencies
- react-router-dom: ^6.21.0
- zustand: ^4.5.0
- @animal-zoom/shared: workspace:*

---

## 🧪 Test Strategy

### Testing Approach
**TDD Principle**: Write tests FIRST, then implement to make them pass

### Test Pyramid for This Feature
| Test Type | Coverage Target | Purpose |
|-----------|-----------------|---------|
| **Unit Tests** | ≥80% | Component logic, state management, handlers |
| **Integration Tests** | Critical paths | meetingStore integration, navigation flow |
| **E2E Tests** | Key user flows | Full create/join workflow validation |

### Test File Organization
```
frontend/packages/main-app/src/
├── pages/
│   ├── SimpleGuest.tsx
│   └── __tests__/
│       └── SimpleGuest.test.tsx
└── router.tsx
```

### Coverage Requirements by Phase
- **Phase 1 (Foundation)**: Component rendering tests (≥80%)
- **Phase 2 (Form Inputs)**: Input state management tests (≥80%)
- **Phase 3 (Room Creation)**: Room creation integration tests (≥85%)
- **Phase 4 (Room Joining)**: Room joining integration tests (≥85%)
- **Phase 5 (E2E)**: End-to-end user flow test (100% critical paths)

### Test Naming Convention
```typescript
// Vitest convention
describe('SimpleGuest', () => {
  test('should render nickname input field', () => {
    // Arrange → Act → Assert
  });
});
```

---

## 🚀 Implementation Phases

### Phase 1: SimpleGuest Component and Route Setup
**Goal**: Create basic page structure and configure routing
**Estimated Time**: 1-1.5 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 1.1**: Write component rendering test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because SimpleGuest component doesn't exist yet
  - Details: Test cases covering:
    - Component renders without crashing
    - Page title/heading is displayed
    - Basic layout structure exists

- [ ] **Test 1.2**: Write route accessibility test
  - File(s): `src/__tests__/router.test.tsx` (create if needed)
  - Expected: Tests FAIL because `/simple-guest` route doesn't exist yet
  - Details: Test that route is accessible and renders SimpleGuest

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 1.3**: Create SimpleGuest.tsx component
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 1.1 pass with minimal JSX structure
  - Details: Basic functional component with heading

- [ ] **Task 1.4**: Add route to router.tsx
  - File(s): `src/router.tsx`
  - Goal: Make Test 1.2 pass
  - Details: Add `/simple-guest` route under Layout children

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 1.5**: Refactor for code quality
  - Files: Review SimpleGuest.tsx structure
  - Goal: Ensure clean component organization
  - Checklist:
    - [ ] Proper imports organized
    - [ ] Component properly typed
    - [ ] File follows project conventions

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 2 until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **Red Phase**: Tests were written FIRST and initially failed
- [ ] **Green Phase**: Production code written to make tests pass
- [ ] **Refactor Phase**: Code improved while tests still pass
- [ ] **Coverage Check**: Test coverage meets requirements
  ```bash
  cd frontend/packages/main-app
  bun test src/pages/__tests__/SimpleGuest.test.tsx --coverage
  ```

**Build & Tests**:
- [ ] **Build**: Project builds without errors
  ```bash
  cd frontend/packages/main-app
  bun run type-check
  ```
- [ ] **All Tests Pass**: 100% of tests passing
  ```bash
  cd frontend/packages/main-app
  bun test
  ```
- [ ] **No Flaky Tests**: Tests pass consistently (run 3+ times)

**Code Quality**:
- [ ] **Type Safety**: TypeScript type checker passes
- [ ] **Imports**: All imports resolve correctly

**Manual Testing**:
- [ ] **Route Access**: Navigate to `/simple-guest` successfully
- [ ] **Basic Rendering**: Page displays without errors

**Validation Commands**:
```bash
cd frontend/packages/main-app

# Test Commands
bun test

# Type Check
bun run type-check

# Dev Server (manual testing)
bun run dev
# Navigate to http://localhost:5175/simple-guest
```

**Manual Test Checklist**:
- [ ] Navigate to `/simple-guest` in browser
- [ ] Page loads without console errors
- [ ] Basic layout/heading is visible

---

### Phase 2: Nickname and Room ID Input Fields
**Goal**: Implement form inputs with local state management
**Estimated Time**: 1.5-2 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 2.1**: Write nickname input state tests
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because input doesn't exist yet
  - Details: Test cases covering:
    - Nickname input field renders
    - User can type in nickname field
    - Nickname state updates correctly

- [ ] **Test 2.2**: Write room ID input state tests
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because input doesn't exist yet
  - Details: Test cases covering:
    - Room ID input field renders
    - User can type in room ID field
    - Room ID state updates correctly

- [ ] **Test 2.3**: Write validation tests
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because validation doesn't exist yet
  - Details: Test cases covering:
    - Empty nickname validation
    - Empty room ID validation (for join action)

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 2.4**: Add nickname input with useState
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 2.1 pass
  - Details:
    - Import Input component from `@/components/ui/input`
    - Add `useState` hook for nickname
    - Wire up input value and onChange handler

- [ ] **Task 2.5**: Add room ID input with useState
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 2.2 pass
  - Details:
    - Add `useState` hook for roomId
    - Wire up input value and onChange handler

- [ ] **Task 2.6**: Add validation logic
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 2.3 pass
  - Details:
    - Validate nickname is not empty
    - Validate room ID is not empty for join action

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 2.7**: Refactor form state management
  - Files: Review SimpleGuest.tsx
  - Goal: Clean up state management
  - Checklist:
    - [ ] Consider extracting validation to helper function
    - [ ] Ensure consistent naming conventions
    - [ ] Add helpful placeholder text
    - [ ] Improve accessibility (labels, aria-labels)

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 3 until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **Red Phase**: Tests were written FIRST and initially failed
- [ ] **Green Phase**: Production code written to make tests pass
- [ ] **Refactor Phase**: Code improved while tests still pass
- [ ] **Coverage Check**: Test coverage ≥80%
  ```bash
  cd frontend/packages/main-app
  bun test src/pages/__tests__/SimpleGuest.test.tsx --coverage
  ```

**Build & Tests**:
- [ ] **Build**: Project builds without errors
- [ ] **All Tests Pass**: 100% of tests passing
- [ ] **Test Performance**: Tests complete quickly (<5 seconds)
- [ ] **No Flaky Tests**: Tests pass consistently

**Code Quality**:
- [ ] **Type Safety**: TypeScript passes
- [ ] **Accessibility**: Input fields have proper labels

**Manual Testing**:
- [ ] **Nickname Input**: Can type nickname
- [ ] **Room ID Input**: Can type room ID
- [ ] **State Updates**: Changes reflect immediately

**Validation Commands**:
```bash
cd frontend/packages/main-app

bun test
bun run type-check
bun run dev
```

**Manual Test Checklist**:
- [ ] Type nickname in input field → state updates
- [ ] Type room ID in input field → state updates
- [ ] Clear inputs → state clears

---

### Phase 3: Room Creation Feature
**Goal**: Implement "Create Room" button with auto-populated room ID
**Estimated Time**: 2-2.5 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 3.1**: Write room creation button test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because button/handler doesn't exist yet
  - Details: Test cases covering:
    - Create Room button renders
    - Button is disabled when nickname is empty
    - Button calls createMeeting when clicked

- [ ] **Test 3.2**: Write auto-populate room ID test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because auto-populate logic doesn't exist yet
  - Details: Test cases covering:
    - After room creation, room ID input is auto-filled
    - Room ID matches the created room code

- [ ] **Test 3.3**: Write error handling test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because error handling doesn't exist yet
  - Details: Test cases covering:
    - Error message displays on API failure
    - Loading state shown during creation

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 3.4**: Add Create Room button
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 3.1 pass
  - Details:
    - Import Button component
    - Add onClick handler `handleCreateRoom`
    - Disable button when nickname is empty

- [ ] **Task 3.5**: Implement createMeeting integration
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 3.1, 3.2 pass
  - Details:
    - Import `useMeetingStore` hook
    - Call `createMeeting` with nickname
    - After success, set roomId state to `meeting.code`
    - Auto-populate room ID input field

- [ ] **Task 3.6**: Add loading and error states
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 3.3 pass
  - Details:
    - Show loading spinner on button during creation
    - Display error toast on failure
    - Disable button during loading

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 3.7**: Refactor async logic
  - Files: Review SimpleGuest.tsx
  - Goal: Improve error handling and UX
  - Checklist:
    - [ ] Extract handleCreateRoom to separate function
    - [ ] Ensure proper try-catch error handling
    - [ ] Add user-friendly error messages
    - [ ] Consider extracting toast logic

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 4 until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **Red Phase**: Tests were written FIRST and initially failed
- [ ] **Green Phase**: Production code written to make tests pass
- [ ] **Refactor Phase**: Code improved while tests still pass
- [ ] **Coverage Check**: Test coverage ≥85%
  ```bash
  cd frontend/packages/main-app
  bun test src/pages/__tests__/SimpleGuest.test.tsx --coverage
  ```

**Build & Tests**:
- [ ] **Build**: Project builds without errors
- [ ] **All Tests Pass**: 100% of tests passing
- [ ] **Integration Test**: meetingStore.createMeeting called correctly
- [ ] **No Flaky Tests**: Async tests pass consistently

**Code Quality**:
- [ ] **Type Safety**: All async operations properly typed
- [ ] **Error Handling**: Proper try-catch blocks
- [ ] **UX**: Loading states clearly indicated

**Security & Performance**:
- [ ] **Error Messages**: Don't expose sensitive information
- [ ] **Performance**: No unnecessary re-renders

**Manual Testing**:
- [ ] **Create Flow**: Click Create Room → room ID auto-populates
- [ ] **Error Case**: Simulate API error → error message shows
- [ ] **Loading State**: Loading indicator appears during creation

**Validation Commands**:
```bash
cd frontend/packages/main-app

bun test
bun run type-check
bun run dev

# Manual test: Create a room and verify room ID appears
```

**Manual Test Checklist**:
- [ ] Enter nickname → click Create Room → room ID appears
- [ ] Create room with empty nickname → button disabled
- [ ] Simulate network error → error toast appears
- [ ] Check browser console for errors → none

---

### Phase 4: Room Joining Feature
**Goal**: Implement "Join Room" button to enter existing rooms
**Estimated Time**: 2-2.5 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing Tests First**
- [ ] **Test 4.1**: Write join room button test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because button/handler doesn't exist yet
  - Details: Test cases covering:
    - Join Room button renders
    - Button is disabled when nickname or room ID is empty
    - Button calls joinMeeting when clicked

- [ ] **Test 4.2**: Write navigation test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because navigation doesn't exist yet
  - Details: Test cases covering:
    - After successful join, navigates to participant-preview
    - Navigation includes correct meeting ID in URL

- [ ] **Test 4.3**: Write join error handling test
  - File(s): `src/pages/__tests__/SimpleGuest.test.tsx`
  - Expected: Tests FAIL because error handling doesn't exist yet
  - Details: Test cases covering:
    - Invalid room ID shows error message
    - Loading state shown during join process

**🟢 GREEN: Implement to Make Tests Pass**
- [ ] **Task 4.4**: Add Join Room button
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 4.1 pass
  - Details:
    - Add Button component with onClick handler `handleJoinRoom`
    - Disable button when nickname or room ID is empty

- [ ] **Task 4.5**: Implement joinMeeting integration
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 4.1, 4.2 pass
  - Details:
    - Import `useNavigate` from react-router-dom
    - Call `meetingStore.joinMeeting(roomId, { userName: nickname })`
    - After success, navigate to `/meeting/${meetingId}/participant-preview`

- [ ] **Task 4.6**: Add error handling for join
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Make Test 4.3 pass
  - Details:
    - Show loading state during join
    - Display error toast on failure (e.g., room not found)
    - Keep user on page if join fails

**🔵 REFACTOR: Clean Up Code**
- [ ] **Task 4.7**: Refactor navigation and error logic
  - Files: Review SimpleGuest.tsx
  - Goal: Consolidate error handling
  - Checklist:
    - [ ] Extract handleJoinRoom to separate function
    - [ ] Share error handling logic with handleCreateRoom
    - [ ] Ensure consistent user feedback (toasts)
    - [ ] Add inline comments for clarity

#### Quality Gate ✋

**⚠️ STOP: Do NOT proceed to Phase 5 until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **Red Phase**: Tests were written FIRST and initially failed
- [ ] **Green Phase**: Production code written to make tests pass
- [ ] **Refactor Phase**: Code improved while tests still pass
- [ ] **Coverage Check**: Test coverage ≥85%
  ```bash
  cd frontend/packages/main-app
  bun test src/pages/__tests__/SimpleGuest.test.tsx --coverage
  ```

**Build & Tests**:
- [ ] **Build**: Project builds without errors
- [ ] **All Tests Pass**: 100% of tests passing
- [ ] **Integration Test**: meetingStore.joinMeeting called correctly
- [ ] **Navigation Test**: Correct route navigation occurs

**Code Quality**:
- [ ] **Type Safety**: TypeScript passes
- [ ] **Error Handling**: Graceful error messages
- [ ] **UX**: Clear feedback on join success/failure

**Security & Performance**:
- [ ] **Input Validation**: Room ID validated before API call
- [ ] **Error Messages**: User-friendly, no sensitive data exposed

**Manual Testing**:
- [ ] **Join Valid Room**: Enter valid room ID → joins successfully
- [ ] **Join Invalid Room**: Enter invalid ID → error message
- [ ] **Navigation**: After join → redirects to participant-preview
- [ ] **Loading State**: Loading indicator during join

**Validation Commands**:
```bash
cd frontend/packages/main-app

bun test
bun run type-check
bun run dev

# Manual test workflow:
# 1. Create a room (Phase 3)
# 2. Copy the room ID
# 3. Open new incognito window
# 4. Navigate to /simple-guest
# 5. Enter nickname and room ID
# 6. Click Join Room → should navigate to participant-preview
```

**Manual Test Checklist**:
- [ ] Enter nickname + valid room ID → click Join → navigates
- [ ] Join with empty nickname → button disabled
- [ ] Join with empty room ID → button disabled
- [ ] Join with invalid room ID → error toast appears
- [ ] Check network tab → API call made with correct params

---

### Phase 5: E2E Testing and Integration Validation
**Goal**: Comprehensive end-to-end testing of full workflows
**Estimated Time**: 2-3 hours
**Status**: ⏳ Pending

#### Tasks

**🔴 RED: Write Failing E2E Tests First**
- [ ] **Test 5.1**: Write E2E test for room creation flow
  - File(s): `src/__tests__/e2e/simpleGuest.e2e.test.ts` (create if needed)
  - Expected: Tests FAIL because full integration not verified yet
  - Details: Test scenario:
    1. Navigate to /simple-guest
    2. Enter nickname
    3. Click Create Room
    4. Verify room ID auto-populates
    5. Verify UI updates correctly

- [ ] **Test 5.2**: Write E2E test for room joining flow
  - File(s): `src/__tests__/e2e/simpleGuest.e2e.test.ts`
  - Expected: Tests FAIL because full flow not verified yet
  - Details: Test scenario:
    1. Create a room (via API or UI)
    2. Open new session
    3. Navigate to /simple-guest
    4. Enter nickname and room ID
    5. Click Join Room
    6. Verify navigation to participant-preview
    7. Verify meeting state is correct

- [ ] **Test 5.3**: Write E2E test for error scenarios
  - File(s): `src/__tests__/e2e/simpleGuest.e2e.test.ts`
  - Expected: Tests FAIL because error paths not fully tested
  - Details: Test scenarios:
    - Network failure during room creation
    - Invalid room ID during join
    - API timeout handling

**🟢 GREEN: Implement E2E Tests**
- [ ] **Task 5.4**: Set up Playwright E2E test file
  - File(s): `src/__tests__/e2e/simpleGuest.e2e.test.ts`
  - Goal: Make Test 5.1, 5.2, 5.3 pass
  - Details:
    - Configure Playwright test
    - Implement full user journeys
    - Mock API responses where needed
    - Verify all assertions

- [ ] **Task 5.5**: Add edge case handling
  - File(s): `src/pages/SimpleGuest.tsx`
  - Goal: Handle any edge cases discovered during E2E testing
  - Details:
    - Network timeout handling
    - Rapid button clicking prevention
    - Input sanitization

**🔵 REFACTOR: Documentation and Cleanup**
- [ ] **Task 5.6**: Add code documentation
  - Files: SimpleGuest.tsx
  - Goal: Document complex logic
  - Checklist:
    - [ ] Add JSDoc comments to handlers
    - [ ] Document state management approach
    - [ ] Add inline comments for non-obvious logic

- [ ] **Task 5.7**: Final code review
  - Files: All files in this feature
  - Goal: Ensure production-ready code
  - Checklist:
    - [ ] Remove console.logs
    - [ ] Remove commented code
    - [ ] Ensure consistent formatting
    - [ ] Verify all imports are used

#### Quality Gate ✋

**⚠️ STOP: Feature is NOT complete until ALL checks pass**

**TDD Compliance** (CRITICAL):
- [ ] **E2E Tests**: All end-to-end scenarios pass
- [ ] **Coverage Target**: ≥85% overall coverage
  ```bash
  cd frontend/packages/main-app
  bun test --coverage
  ```

**Build & Tests**:
- [ ] **Build**: Production build succeeds
  ```bash
  cd frontend/packages/main-app
  bun run build
  ```
- [ ] **All Tests Pass**: Unit + Integration + E2E all pass
  ```bash
  cd frontend/packages/main-app
  bun test
  bun run test:e2e
  ```
- [ ] **Type Check**: No TypeScript errors
  ```bash
  cd frontend/packages/main-app
  bun run type-check
  ```

**Code Quality**:
- [ ] **No Linting Errors**: Code follows project standards
- [ ] **Formatting**: Consistent code formatting
- [ ] **Documentation**: Complex logic documented

**Security & Performance**:
- [ ] **No Security Vulnerabilities**: Dependencies are safe
- [ ] **Performance**: Page loads quickly (<1s)
- [ ] **No Memory Leaks**: Component unmounts cleanly

**Manual Testing**:
- [ ] **Full Create Flow**: Create room → auto-populate → success
- [ ] **Full Join Flow**: Join room → navigate → success
- [ ] **Error Scenarios**: All error cases handled gracefully
- [ ] **Mobile Responsive**: Test on mobile viewport
- [ ] **Accessibility**: Keyboard navigation works

**Validation Commands**:
```bash
cd frontend/packages/main-app

# Full test suite
bun test

# Type checking
bun run type-check

# E2E tests
bun run test:e2e

# Production build
bun run build

# Dev server for manual testing
bun run dev
```

**Manual Test Checklist**:
- [ ] **Happy Path - Create**: Nickname → Create → Room ID appears
- [ ] **Happy Path - Join**: Nickname + Room ID → Join → Navigate
- [ ] **Error - Invalid Room**: Invalid ID → Error message
- [ ] **Error - Network**: Simulate offline → Error handling
- [ ] **UI - Loading States**: All loading states display correctly
- [ ] **UI - Disabled States**: Buttons disabled when expected
- [ ] **Accessibility**: Tab through all inputs → works correctly
- [ ] **Mobile**: Test on mobile viewport → responsive layout

---

## ⚠️ Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| API response delays cause poor UX | Medium | Medium | Add loading indicators, implement timeouts, show progress feedback |
| Users enter invalid room IDs | High | Low | Validate input format, provide clear error messages, suggest corrections |
| meetingStore state sync issues | Low | High | Comprehensive unit tests, verify state updates, add integration tests |
| Navigation fails after join | Low | Medium | Test navigation thoroughly, add fallback error handling |
| Room ID copy/paste issues | Medium | Low | Ensure input accepts all characters, add "Copy" button feature |

---

## 🔄 Rollback Strategy

### If Phase 1 Fails
**Steps to revert**:
- Delete file: `src/pages/SimpleGuest.tsx`
- Remove route from: `src/router.tsx` (lines for `/simple-guest`)
- Delete test file: `src/pages/__tests__/SimpleGuest.test.tsx`

### If Phase 2 Fails
**Steps to revert**:
- Restore `src/pages/SimpleGuest.tsx` to Phase 1 state (basic component only)
- Remove useState hooks and input fields

### If Phase 3 Fails
**Steps to revert**:
- Restore `src/pages/SimpleGuest.tsx` to Phase 2 state (inputs only, no handlers)
- Remove Create Room button and handler

### If Phase 4 Fails
**Steps to revert**:
- Restore `src/pages/SimpleGuest.tsx` to Phase 3 state (create works, join removed)
- Remove Join Room button and navigation logic

### If Phase 5 Fails
**Steps to revert**:
- Remove E2E test files
- Feature is still functional from Phase 4

---

## 📊 Progress Tracking

### Completion Status
- **Phase 1**: ⏳ 0%
- **Phase 2**: ⏳ 0%
- **Phase 3**: ⏳ 0%
- **Phase 4**: ⏳ 0%
- **Phase 5**: ⏳ 0%

**Overall Progress**: 0% complete

### Time Tracking
| Phase | Estimated | Actual | Variance |
|-------|-----------|--------|----------|
| Phase 1 | 1-1.5 hours | - | - |
| Phase 2 | 1.5-2 hours | - | - |
| Phase 3 | 2-2.5 hours | - | - |
| Phase 4 | 2-2.5 hours | - | - |
| Phase 5 | 2-3 hours | - | - |
| **Total** | 9-11.5 hours | - | - |

---

## 📝 Notes & Learnings

### Implementation Notes
- (To be filled during implementation)

### Blockers Encountered
- (To be documented as they occur)

### Improvements for Future Plans
- (To be filled after completion)

---

## 📚 References

### Documentation
- React Router v6: https://reactrouter.com/en/main
- Zustand: https://zustand-demo.pmnd.rs/
- Vitest: https://vitest.dev/

### Related Files
- `src/stores/meetingStore.ts` - State management
- `src/types/meeting.ts` - TypeScript types
- `src/components/ui/` - Reusable UI components
- `@animal-zoom/shared/api` - API client

### Related Issues
- (To be linked if applicable)

---

## ✅ Final Checklist

**Before marking plan as COMPLETE**:
- [ ] All 5 phases completed with quality gates passed
- [ ] Full integration testing performed
- [ ] E2E tests cover all critical flows
- [ ] Code documentation updated
- [ ] Performance benchmarks meet targets
- [ ] All manual test scenarios pass
- [ ] No console errors or warnings
- [ ] Mobile responsive design verified
- [ ] Accessibility requirements met
- [ ] Plan document updated with learnings

---

**Plan Status**: 🔄 In Progress
**Next Action**: Begin Phase 1 - Write component rendering tests
**Blocked By**: None
