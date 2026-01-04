# Feature Plan: WebSocket Debug UI Component

**Created:** 2026-01-04
**Last Updated:** 2026-01-04
**Status:** Planning
**Scope:** Small (2-3 phases, 3-6 hours total)

---

## CRITICAL INSTRUCTIONS

After completing each phase:
1. ✅ Check off completed task checkboxes
2. 🧪 Run all quality gate validation commands
3. ⚠️ Verify ALL quality gate items pass
4. 📅 Update "Last Updated" date
5. 📝 Document learnings in Notes section
6. ➡️ Only then proceed to next phase

⛔ DO NOT skip quality gates or proceed with failing checks

---

## Overview

Create a reusable debugging UI component in the shared package that displays:
- **WebSocket connection status** (connected/disconnected/connecting/error)
- **Current user's unique ID**
- **Current room ID** (room code)
- **Room status** (joined/not in room)
- **Most recent WebSocket message** (real-time updates)

This component will be a static overlay positioned in the bottom-right corner, styled with a translucent dark theme, and include a toggle button to show/hide the panel.

---

## Objectives

1. **Real-time Monitoring**: Display live WebSocket connection state and message data
2. **Developer Experience**: Provide easy-to-access debugging information during development
3. **Reusability**: Create a shared component that can be used across main-app and other packages
4. **Minimal Footprint**: Non-intrusive UI that doesn't interfere with main application content

---

## Architecture Decisions

### Technology Stack
- **UI Framework**: React with TypeScript
- **State Management**: React hooks + RxJS subscriptions
- **Styling**: CSS modules or inline styles
- **Data Source**: Existing `WebSocketClientController` Observable streams

### Component Structure
```
frontend/packages/shared/src/debug/
├── DebugPanel.tsx          # Main component
├── DebugPanel.module.css   # Styles
├── types.ts                # Type definitions
├── index.ts                # Exports
└── __tests__/
    └── DebugPanel.test.tsx # Component tests
```

### Integration Points
- Subscribes to `WebSocketClientController` observables:
  - `connectionState$` for connection status
  - `currentRoom$` for current room code
  - `roomJoined$` for room join events and room details
  - `chatMessage$` for latest message
  - `socket.id` for connection identifier
- Receives user ID as prop from parent component
- Uses localStorage to persist toggle state

### Design Decisions

**Position**: Bottom-right corner
- **Rationale**: Standard position for debugging widgets; doesn't overlap with main navigation or content

**Toggle Behavior**: Collapsible panel with floating button
- **Rationale**: Reduces screen clutter while maintaining quick access

**Styling**: Translucent dark background (rgba(0,0,0,0.85))
- **Rationale**: Professional look, good contrast for light and dark themes

**Data Display**:
- Connection status with color indicators (🟢 green, 🔴 red, 🟡 yellow)
- Socket ID for connection tracking
- User ID with copy-to-clipboard button
- Room ID (code) with copy-to-clipboard button
- Room status (in room / not in room)
- Latest message with timestamp and sender info

---

## Phase Breakdown

### Phase 1: Debug UI Component Structure and Styling
**Goal**: Create the basic React component with static UI and styling

**Test Strategy**:
- **Type**: Component unit tests
- **Coverage Target**: 80% of component rendering logic
- **Scenarios**:
  - Component renders without crashing
  - Toggle button shows/hides panel
  - Different connection states display correct colors
  - User can copy user ID to clipboard

**Tasks** (TDD Workflow):

**RED Tasks - Write Failing Tests First**:
- [ ] Write test: "renders collapsed by default"
- [ ] Write test: "expands when toggle button clicked"
- [ ] Write test: "displays connection status with correct color indicators"
- [ ] Write test: "copies user ID to clipboard when copy button clicked"
- [ ] Run tests → Verify they fail with expected errors

**GREEN Tasks - Implement Minimal Code**:
- [ ] Create `frontend/packages/shared/src/debug/` directory
- [ ] Create `DebugPanel.tsx` with basic component structure
  - Props interface: `userId?: string`, `className?: string`
  - State: `isExpanded` (boolean)
  - Render toggle button (fixed position: bottom-right)
  - Render collapsible panel with sections:
    - WebSocket Status (placeholder)
    - Socket ID (placeholder)
    - User ID (placeholder)
    - Room Info (placeholder)
    - Latest Message (placeholder)
- [ ] Create `DebugPanel.module.css` with styling:
  - Fixed position: bottom-right (20px from edges)
  - Translucent dark background: rgba(0,0,0,0.85)
  - Smooth expand/collapse animation
  - Responsive width: 320px desktop, 280px mobile
- [ ] Create `types.ts` with TypeScript interfaces
- [ ] Create `index.ts` to export component
- [ ] Run tests → Verify all tests pass

**REFACTOR Tasks - Improve Code Quality**:
- [ ] Extract color constants to separate config object
- [ ] Add JSDoc comments to component and props
- [ ] Ensure accessibility attributes (ARIA labels, keyboard navigation)
- [ ] Run tests after each refactoring → Ensure green

**Quality Gate**:
- [ ] Component renders without errors
- [ ] All unit tests pass (≥80% coverage)
- [ ] TypeScript compilation succeeds with no errors
- [ ] Toggle functionality works smoothly
- [ ] Visual styling matches requirements (translucent dark, bottom-right)
- [ ] Accessibility: Can be toggled via keyboard (Enter/Space)
- [ ] No console errors or warnings

**Dependencies**: None

**Coverage Target**: 80% of rendering logic, 100% of toggle functionality

---

### Phase 2: WebSocket and User Data Integration
**Goal**: Connect component to live WebSocket data and display real-time information

**Test Strategy**:
- **Type**: Integration tests with mocked WebSocket controller
- **Coverage Target**: 90% of data subscription logic
- **Scenarios**:
  - Connection state updates reflect in UI
  - User ID displays correctly
  - Latest message updates in real-time
  - Component cleans up subscriptions on unmount

**Tasks** (TDD Workflow):

**RED Tasks - Write Failing Tests First**:
- [ ] Write test: "subscribes to connectionState$ and updates UI"
- [ ] Write test: "subscribes to currentRoom$ and displays room ID"
- [ ] Write test: "subscribes to chatMessage$ and displays latest message"
- [ ] Write test: "displays user ID when provided"
- [ ] Write test: "displays socket ID when connected"
- [ ] Write test: "shows room status (in room / not in room)"
- [ ] Write test: "unsubscribes from observables on component unmount"
- [ ] Write test: "handles missing WebSocket controller gracefully"
- [ ] Run tests → Verify failures with expected messages

**GREEN Tasks - Implement Minimal Code**:
- [ ] Update `DebugPanel.tsx`:
  - Add prop: `wsController?: WebSocketClientController`
  - Add state: `connectionState`, `currentRoom`, `latestMessage`, `socketId`
  - In `useEffect`:
    - Subscribe to `wsController.connectionState$`
    - Subscribe to `wsController.currentRoom$`
    - Subscribe to `wsController.chatMessage$`
    - Update state on each emission
    - Return cleanup function to unsubscribe
  - Display connection state with color indicator:
    - 🟢 Green for "connected"
    - 🟡 Yellow for "connecting"
    - 🔴 Red for "disconnected" or "error"
  - Display socket ID if available
  - Display user ID from props with copy button
  - Display room ID (code) with copy button
  - Display room status:
    - "In room: {roomCode}" when in a room
    - "Not in a room" when currentRoom is null
  - Display latest message: `{sender}: {message}` with timestamp
- [ ] Handle edge cases:
  - No WebSocket controller → show "Not connected"
  - No user ID → show "Guest"
  - No room → show "Not in a room"
  - No messages yet → show "No messages"
- [ ] Run tests → Verify all tests pass

**REFACTOR Tasks - Improve Code Quality**:
- [ ] Extract subscription logic to custom hook `useWebSocketDebug`
- [ ] Add loading states for async data
- [ ] Add error boundaries for subscription failures
- [ ] Format timestamps using relative time (e.g., "2 seconds ago")
- [ ] Run tests after each refactoring → Ensure green

**Quality Gate**:
- [ ] All unit tests pass (≥90% coverage)
- [ ] Integration tests with mocked controller pass
- [ ] Real-time updates work correctly
- [ ] Connection state changes reflect immediately
- [ ] Component properly cleans up subscriptions (no memory leaks)
- [ ] Handles null/undefined data gracefully
- [ ] No console errors during normal operation

**Dependencies**: Phase 1 complete

**Coverage Target**: 90% of subscription and data handling logic

---

### Phase 3: Integration with Main App and Validation
**Goal**: Integrate debug panel into main-app and validate across different scenarios

**Test Strategy**:
- **Type**: Manual testing + E2E validation
- **Coverage Target**: N/A (integration phase)
- **Scenarios**:
  - Panel works in LiveSession page
  - Panel persists toggle state across page refreshes
  - Panel doesn't interfere with main UI interactions
  - Panel displays correct data in various connection states

**Tasks** (Sequential):

- [ ] Export DebugPanel from `@animal-zoom/shared`:
  - Update `frontend/packages/shared/src/index.ts`
  - Add: `export { DebugPanel } from './debug'`
- [ ] Integrate into main-app:
  - Import DebugPanel in `frontend/packages/main-app/src/pages/LiveSession.tsx`
  - Get WebSocket controller from existing store/context
  - Get current user ID from meetingStore
  - Render: `<DebugPanel wsController={controller} userId={currentUser?.id} />`
- [ ] Add environment flag to conditionally render (optional):
  - Only show in development: `{import.meta.env.DEV && <DebugPanel ... />}`
- [ ] Manual testing checklist:
  - [ ] Open LiveSession page
  - [ ] Verify panel appears in bottom-right corner
  - [ ] Click toggle button → panel expands/collapses smoothly
  - [ ] Check connection status:
    - Before WebSocket connects → shows "disconnected" 🔴
    - After connection → shows "connected" 🟢
    - Display socket ID
  - [ ] Check user ID display:
    - Shows correct user ID from store
    - Copy button copies to clipboard
  - [ ] Check room info display:
    - Before joining room → shows "Not in a room"
    - After joining room → shows "In room: {ROOM_CODE}"
    - Copy button copies room code to clipboard
  - [ ] Check message display:
    - Send a chat message
    - Latest message appears in debug panel
    - Timestamp updates correctly
  - [ ] Refresh page → toggle state persists (if implemented)
  - [ ] Verify no interference with main UI:
    - Can still interact with 3D scene
    - Can still send chat messages
    - Debug panel z-index doesn't block modals/dialogs

**Quality Gate**:
- [ ] Component successfully renders in main-app
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in browser console
- [ ] All manual test scenarios pass
- [ ] Panel doesn't interfere with main functionality
- [ ] Visual appearance matches design specifications
- [ ] Toggle state persists across refreshes (if localStorage used)
- [ ] Responsive on mobile devices (280px width)

**Dependencies**: Phase 2 complete

---

## Test Specification

### Test File Locations
- `frontend/packages/shared/src/debug/__tests__/DebugPanel.test.tsx`
- `frontend/packages/shared/src/debug/__tests__/useWebSocketDebug.test.ts` (if custom hook created)

### Test Data / Fixtures
```typescript
// Mock WebSocket controller
const mockController = {
  connectionState$: new BehaviorSubject<ConnectionState>('disconnected'),
  currentRoom$: new BehaviorSubject<string | null>(null),
  chatMessage$: new Subject<ChatMessageData>(),
  socket: { id: 'mock-socket-123' }
};

// Mock user
const mockUserId = 'user-abc-123';

// Mock message
const mockMessage: ChatMessageData = {
  senderId: 'user-xyz',
  senderName: 'Test User',
  message: 'Hello world',
  timestamp: new Date().toISOString()
};
```

### Dependencies to Mock
- `WebSocketClientController` (Observable streams)
- Browser APIs: `navigator.clipboard.writeText`
- localStorage (for toggle state persistence)

### Coverage Commands
```bash
# Run tests with coverage
cd frontend/packages/shared
pnpm test:coverage

# View coverage report
open coverage/index.html
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Memory leaks from RxJS subscriptions** | Medium | High | Implement proper cleanup in useEffect return function; add subscription manager; test with React DevTools Profiler |
| **Z-index conflicts with modals** | Low | Medium | Use very high z-index (9999); test with all existing modals/dialogs |
| **Performance impact from frequent updates** | Low | Low | Throttle state update stream; use React.memo for optimization; only enable in development |
| **Type mismatches with WebSocket data** | Low | Medium | Use strict TypeScript types; add runtime validation for message data |

---

## Rollback Strategy

### Phase 1 Rollback
- Delete `frontend/packages/shared/src/debug/` directory
- Remove test files
- Revert changes to `frontend/packages/shared/src/index.ts`

### Phase 2 Rollback
- Revert changes to DebugPanel.tsx
- Remove subscription logic
- Keep basic UI structure if Phase 1 is stable

### Phase 3 Rollback
- Remove DebugPanel import from LiveSession.tsx
- Remove component render
- Component still exists in shared package but unused

---

## Success Criteria

**Feature is complete when**:
1. ✅ Debug panel renders in bottom-right corner with translucent dark styling
2. ✅ Toggle button expands/collapses panel smoothly
3. ✅ Connection status displays correctly with color indicators (🟢🟡🔴)
4. ✅ Socket ID displays when connected
5. ✅ User ID displays and can be copied to clipboard
6. ✅ Room ID (code) displays and can be copied to clipboard
7. ✅ Room status shows "In room" or "Not in a room" correctly
8. ✅ Latest WebSocket message displays with timestamp
9. ✅ Real-time updates work without lag
10. ✅ Component cleans up properly (no memory leaks)
11. ✅ All tests pass with ≥80% coverage
12. ✅ No interference with main application UI
13. ✅ Works on desktop and mobile viewports

---

## Notes & Learnings

### Phase 1 Notes
_To be filled during implementation_

### Phase 2 Notes
_To be filled during implementation_

### Phase 3 Notes
_To be filled during implementation_

---

## References

- **WebSocketClientController**: `frontend/packages/shared/src/socket/WebSocketClientController.ts`
- **Connection Types**: `frontend/packages/shared/src/socket/controller-types.ts`
- **Message Types**: `frontend/packages/shared/src/socket/types.ts`
- **User Types**: `frontend/packages/shared/src/api/types.ts`
- **Meeting Store**: `frontend/packages/main-app/src/stores/meetingStore.ts`
