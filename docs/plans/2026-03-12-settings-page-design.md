# Settings Page Design (Dedicated Page)

**Goal**
Replace the dashboard settings popup with a dedicated `/settings` page that lets signed-in users manage basic account settings without changing the existing visual language.

**Scope (Approved)**
- Email is read-only.
- Editable: nickname, time zone, password.

## UX / Navigation
- Dashboard gear icon navigates to `/settings`.
- `/settings` requires auth; unauthenticated users redirect to `/login?next=/settings`.
- Settings page uses the same header + card styling as the dashboard (same background, border, ring, typography, button styles).

## Page Layout
Single page with three cards:

1) Account
- Email (read-only)
- Nickname (text input)
- Save button (PATCH)

2) Time
- Time zone select (IANA values; small curated list)
- Preview of current time in selected time zone
- Save button (PATCH)

3) Security
- Current password
- New password
- Confirm password
- Change password button (POST)

## Data Model
Server stores optional profile fields on the user record:
- `nickname`: nullable text
- `timezone`: nullable text (IANA time zone identifier)

Client treats these as optional fields; defaults:
- nickname: empty string
- timezone: `Asia/Seoul` (or user agent default if feasible)

## API Design

### GET /users/me
Auth required.
Response includes:
- ok
- user: { id, email, createdAt, nickname?, timezone? }

### PATCH /users/me
Auth required.
Body:
- nickname? (string)
- timezone? (string)
Validates basic constraints (length, non-empty trimming, timezone format) and persists.

### POST /auth/change-password
Auth required.
Body:
- currentPassword
- newPassword
Validates current password, enforces minimal new password constraints, updates hash.

## Error Handling
- All actions show inline error messages in the relevant card.
- Network error shows a human message and keeps user input.
- Buttons show loading state and are disabled while submitting.

## Security
- Password change requires current password.
- Settings endpoints require JWT.

## Verification
- `pnpm --filter @animal-zoom/server-app typecheck && pnpm --filter @animal-zoom/server-app build`
- `pnpm --filter @animal-zoom/webapp typecheck && pnpm --filter @animal-zoom/webapp build`
- Manual Safari QA:
  - From dashboard, click gear -> `/settings`.
  - Update nickname -> saved -> persists after refresh.
  - Update timezone -> preview changes -> saved -> persists after refresh.
  - Change password -> can log out and log in with new password.
