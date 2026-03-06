# Webapp Routing Spec

This document describes the route paths and page/component mapping for `@animal-zoom/webapp`.

Last updated: 2026-03-06 (`/room/join/:roomId` normalized, room create/join/study flows documented, `/` auth redirect strategy)

## Router Setup

- Router entrypoint: `client/webapp/src/main.tsx`
- Router library: `react-router-dom`
- Composition:
  - `ReactDOM.createRoot(...).render(<BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>)`
  - Routes are defined in the local component `AppRoutes()` in `client/webapp/src/main.tsx`.

## Route Table

| Path | Element (component) | Source | Notes |
| --- | --- | --- | --- |
| `/` | `HomeRoute` | `client/webapp/src/main.tsx` | If authenticated (`auth_token` present via `useAuth()`), redirects to `/dashboard`; otherwise renders `App` (main zoom UI layout). |
| `/login` | `LoginPage` | `client/webapp/src/pages/login/index.tsx` | Calls `useAuth().login()`; shows token/socket status. |
| `/register` | `RegisterPage` | `client/webapp/src/pages/register/index.tsx` | Calls `useAuth().register()`; on success: `window.location.href = "/login"`. |
| `/forgot-password` | `ForgotPasswordPage` | `client/webapp/src/pages/forgot-password/index.tsx` | Calls `useAuth().forgotPassword()`. |
| `/dashboard` | `DashboardPage` | `client/webapp/src/pages/dashboard/index.tsx` | Uses mock data loader (`loadDashboardData()`); no router-level auth guard. |
| `/room/study/:roomId` | `RoomStudyPage` | `client/webapp/src/pages/room/study/index.tsx` | Renders `ZoomRoomExperience`; participant count is derived from `getDashboardRoomById(roomId)` and falls back to `participants` query param via `resolveParticipantCountFromSearch(...)` when `roomId` is missing/unknown. |
| `/room/join/:roomId` | `RoomJoinPage` | `client/webapp/src/pages/room/join/index.tsx` | Redirect page: trims `roomId` and replaces to `/room/study/:roomId`; if empty/missing, replaces to `/dashboard`. |
| `/room/create` | `RoomCreatePage` | `client/webapp/src/pages/room/create/index.tsx` | Redirect page: creates `room-${Date.now().toString(36)}` and replaces to `/room/study/:roomId`; on failure, replaces to `/dashboard`. |
| `*` | `Navigate` -> `/` | `client/webapp/src/main.tsx` | Catch-all: redirects unknown paths to `/` using `<Navigate replace to="/" />`. |

## Route Tree

```
/
  (HomeRoute)
  -> authenticated: redirect to /dashboard
  -> unauthenticated: (App)

/login
  (LoginPage)

/register
  (RegisterPage)

/forgot-password
  (ForgotPasswordPage)

/dashboard
  (DashboardPage)

/room/study/:roomId
  (RoomStudyPage)

/room/join/:roomId
  (RoomJoinPage)
  -> redirect to /room/study/:roomId (or /dashboard when param is missing/empty)

/room/create
  (RoomCreatePage)
  -> redirect to /room/study/:roomId (or /dashboard on create failure)

*
  -> redirect to /
```

## Nested Routes / Layout Routes

- None. `AppRoutes()` defines a flat list of routes (no `<Route>` nesting and no `<Outlet>`-based layouts).

## Auth / Guarding / Redirect Behavior

- Provider: `client/webapp/src/auth/AuthContext.tsx` (`AuthProvider`, `useAuth`).
- Token storage:
  - Key: `auth_token`
  - Set on successful login (`/auth/login`) and removed on logout.
- Router-level route protection:
  - None found (no protected-route wrapper, loader redirect, or route config guards).
  - Pages can still behave differently when `token` is present (e.g., Login page shows a Logout button).
- Root-entry redirect behavior:
  - `"/"` checks auth token through `useAuth()` and redirects authenticated users to `"/dashboard"`.
  - Unauthenticated users still land on the main zoom UI (`App`).

### Auth API Endpoints Used

- `POST /auth/login` (sets `accessToken` into `auth_token` if present)
- `POST /auth/forgot-password`
- `POST /users/register`

### WebSocket Connection

- When `token` exists, `AuthProvider` connects a Socket.IO client to `ZOOM_SOCKET_URL` with `transports: ["websocket"]` and `auth: { token }`.

## Environment / Base URLs

- `API_BASE_URL` (in `client/webapp/src/system/env.ts`):
  - `(import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000"`
- `ZOOM_SOCKET_URL`:
  - `${API_BASE_URL}/zoom`

## Known In-App Navigation Links

These are known in-app navigation targets from `react-router-dom` `<Link>` usage and button handlers that call `useNavigate(...)`.

- `client/webapp/src/pages/login/index.tsx`
  - `/register`
  - `/dashboard`
  - `/forgot-password`
- `client/webapp/src/pages/register/index.tsx`
  - `/login`
  - `/forgot-password`
- `client/webapp/src/pages/forgot-password/index.tsx`
  - `/login`
  - `/register`
- `client/webapp/src/pages/dashboard/index.tsx`
  - `/room/join/<room.id>` (Join room buttons via `navigate(`/room/join/${roomId}`)`)
  - `/room/create` (New room buttons via `navigate("/room/create")`)

## Verification Checklist

- Confirm all route paths in this doc match `<Route path=...>` in `client/webapp/src/main.tsx`.
- Confirm the catch-all route behavior remains `* -> /`.
