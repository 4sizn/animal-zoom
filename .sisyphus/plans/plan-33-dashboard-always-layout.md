# Dashboard Always Shows Standard Layout

## TL;DR
> **Summary**: Remove the full-screen empty-state on `/dashboard` so the normal dashboard layout always renders; keep the existing Create Room CTA visible.
> **Deliverables**: Update dashboard page rendering logic + verify build/typecheck + quick UI QA.
> **Effort**: Quick
> **Parallel**: NO
> **Critical Path**: Update `DashboardPage` → verify build/typecheck → UI QA

## Context
### Original Request
- Always show the normal dashboard layout and keep the existing create-room button visible.

### Repo Findings
- Full-screen empty-state is an early return at `client/webapp/src/pages/dashboard/index.tsx:244` (`if (rooms.length === 0) return ...`).
- The normal dashboard layout already renders the Create Room card as the first tile in the "Active rooms" grid at `client/webapp/src/pages/dashboard/index.tsx:420`.

### Metis Review (gaps addressed)
- The early return currently also triggers when search yields zero matches (because `rooms` is the filtered list). Removing it fixes the UX where search/header disappear.
- Decide explicitly what happens for:
  - zero rooms from API
  - zero rooms after search filtering

## Work Objectives
### Core Objective
- `/dashboard` never shows a standalone full-screen "No active rooms" panel.

### Deliverables
- Update `DashboardPage` to always render the standard dashboard layout when `state.status === "ready"`.
- Keep the existing Create Room grid card visible and functional.
- Add a small inline empty hint within the "Active rooms" section when there are no rooms to display.

### Definition of Done
- `pnpm --filter @animal-zoom/webapp typecheck` succeeds.
- `pnpm --filter @animal-zoom/webapp build` succeeds.
- Manual QA confirms on an empty account (or search-empty) that:
  - the standard dashboard layout renders (header + main sections)
  - the Create Room card is visible
  - no full-screen "No active rooms" card appears

### Must Have
- Remove the ready-state early return `if (rooms.length === 0) { return (...) }`.
- Inline empty copy rules:
  - If `state.data.rooms.length === 0`: show text `No rooms yet. Create one to get started.`
  - Else if `filteredRooms.length === 0` (search-empty): show text `No rooms match your search.`

### Must NOT Have
- No server/API changes.
- No new dependencies.
- No broad refactors (do not extract a new layout component).

## Verification Strategy
- Tests: none (repo currently has no webapp test suite).
- Build/typecheck verification is mandatory.
- UI QA is manual (agent-executed via browser automation if available).

## TODOs

- [x] 1. Remove Dashboard Full-Screen Empty-State

  **What to do**:
  - Modify `client/webapp/src/pages/dashboard/index.tsx`.
  - Delete the entire block:
    - `if (rooms.length === 0) { return ( ... No active rooms ... ) }`
  - Ensure the function continues to the standard dashboard `return (...)` path.
  - Add an inline empty hint inside the "Active rooms" section:
    - Place it just under the "Active rooms" header row and above the grid.
    - Show copy based on these rules:
      - `state.data.rooms.length === 0` → `No rooms yet. Create one to get started.`
      - `state.data.rooms.length > 0 && filteredRooms.length === 0` → `No rooms match your search.`
    - Keep the Create Room card as the first grid tile (do not remove/reorder it).
  - Hide the "View all / Collapse" toggle when it is meaningless:
    - If `state.data.rooms.length <= 4`, do not render the toggle button.

  **Exact JSX changes (copy/paste template)**:
  - Replace the header-row toggle button with this conditional wrapper:
  ```tsx
  {state.data.rooms.length > 4 ? (
    <button
      type="button"
      onClick={() => setShowAllRooms((prev) => !prev)}
      className="text-sm font-semibold text-gray-300 hover:text-white"
    >
      {showAllRooms ? "Collapse" : "View all"}
    </button>
  ) : null}
  ```
  - Insert this inline empty hint between the header row and the grid:
  ```tsx
  {rooms.length === 0 ? (
    <p className="mb-4 text-sm text-gray-400">
      {state.data.rooms.length === 0
        ? "No rooms yet. Create one to get started."
        : "No rooms match your search."}
    </p>
  ) : null}
  ```
  - Keep the grid block unchanged so the Create Room tile still renders first.

  **Must NOT do**:
  - Do not change loading/error branches.
  - Do not change navigation targets (create/join routes).

  **References**:
  - Empty-state early return: `client/webapp/src/pages/dashboard/index.tsx:244`
  - Active rooms section + Create Room card: `client/webapp/src/pages/dashboard/index.tsx:402`

  **Acceptance Criteria**:
  - [x] `grep -n "No active rooms" client/webapp/src/pages/dashboard/index.tsx` returns 0 matches.
  - [x] `/dashboard` still renders normally when `rooms.length === 0`.

  **QA Scenarios**:
  ```
  Scenario: Empty rooms renders normal layout
    Tool: Playwright (preferred) or Safari + AppleScript
    Steps:
      1) Login
      2) Navigate to /dashboard
      3) Ensure there are zero rooms (fresh dev account or filter search to no matches)
    Expected:
      - Header renders
      - "Active rooms" section renders
      - Create Room card is visible
      - No full-screen empty-state card appears
  ```

- [x] 2. Webapp Verification

  **What to do**:
  - Run:
    - `pnpm --filter @animal-zoom/webapp typecheck`
    - `pnpm --filter @animal-zoom/webapp build`

  **Acceptance Criteria**:
  - [x] Both commands exit 0.

## Commit Strategy
- 1 commit.
- Message: `fix(webapp): always render dashboard layout on empty rooms`
- Files:
  - `client/webapp/src/pages/dashboard/index.tsx`

## Success Criteria
- Empty-room and search-empty states keep the standard dashboard layout visible, with Create Room CTA available.
