# Learnings

- Auth token is stored under localStorage key `auth_token` via `client/webapp/src/auth/AuthContext.tsx`.
- API calls use `client/webapp/src/network/apiClient.ts` with `API_BASE_URL` from `client/webapp/src/system/env.ts`.

- `RoomCreatePage` now uses `useAuth().token` + `apiRequest` to call `POST /rooms` when authed, else creates a demo room id.
