# Webapp Routing Spec

This document describes the route paths and page/component mapping for `@animal-zoom/webapp`.

## Router Setup

- Router entrypoint: `client/webapp/src/main.tsx`
- Router library: `react-router-dom`
- Composition:
  - `ReactDOM.createRoot(...).render(<BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>)`
  - Routes are defined in the local component `AppRoutes()` in `client/webapp/src/main.tsx`.

## Route Table

| Path | Element (component) | Source | Notes |
| --- | --- | --- | --- |
| `/` | `App` | `client/webapp/src/main.tsx` | Main "zoom" UI layout (participant grid). |
| `/login` | `LoginPage` | `client/webapp/src/pages/login/index.tsx` | Calls `useAuth().login()`; shows token/socket status. |
| `/register` | `RegisterPage` | `client/webapp/src/pages/register/index.tsx` | Calls `useAuth().register()`; on success: `window.location.href = "/login"`. |
| `/forgot-password` | `ForgotPasswordPage` | `client/webapp/src/pages/forgot-password/index.tsx` | Calls `useAuth().forgotPassword()`. |
| `/dashboard` | `DashboardPage` | `client/webapp/src/pages/dashboard/index.tsx` | Uses mock data loader (`loadDashboardData()`); no router-level auth guard. |
| `*` | `Navigate` -> `/` | `client/webapp/src/main.tsx` | Catch-all: redirects unknown paths to `/` using `<Navigate replace to="/" />`. |

## Route Tree

```
/
  (App)

/login
  (LoginPage)

/register
  (RegisterPage)

/forgot-password
  (ForgotPasswordPage)

/dashboard
  (DashboardPage)

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

These are `react-router-dom` `<Link>` targets found in page components.

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

## Verification Checklist

- Confirm all route paths in this doc match `<Route path=...>` in `client/webapp/src/main.tsx`.
- Confirm the catch-all route behavior remains `* -> /`.
