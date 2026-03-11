# REST API

This document reflects the current REST endpoints implemented in `server/app/src/main.ts` and defines the next endpoints to implement.

## Conventions

- Requests and responses use JSON.
- Success responses use `{ ok: true, ... }`.
- Error responses use `{ ok: false, error: string }`.
- Timestamps (for example `createdAt`) are serialized as ISO 8601 strings.

Related docs:

- Socket.IO events: `server/app/docs/socket-events.md`

### Auth

Auth-required endpoints expect:

- `Authorization: Bearer <accessToken>`

If missing/invalid:

- `401`
- Body: `{ ok: false, error: "unauthorized" }`

## Existing endpoints

### POST /users/register

Create a user account.

Request headers:

- `Content-Type: application/json`

Request body:

```json
{
  "email": "person@example.com",
  "password": "password123"
}
```

Responses:

- `200`

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "person@example.com",
    "createdAt": "2026-03-05T00:00:00.000Z"
  }
}
```

- `400`

```json
{ "ok": false, "error": "invalid email" }
```

```json
{ "ok": false, "error": "password too short" }
```

curl:

```bash
curl -sS -X POST "http://localhost:3000/users/register"   -H "Content-Type: application/json"   -d '{"email":"person@example.com","password":"password123"}'
```

### POST /auth/login

Log in with email/password and receive an access token.

Request headers:

- `Content-Type: application/json`

Request body:

```json
{
  "email": "person@example.com",
  "password": "password123"
}
```

Responses:

- `200`

```json
{
  "ok": true,
  "accessToken": "<jwt>",
  "user": {
    "id": 1,
    "email": "person@example.com",
    "createdAt": "2026-03-05T00:00:00.000Z"
  }
}
```

- `401`

```json
{ "ok": false, "error": "invalid credentials" }
```

curl:

```bash
curl -sS -X POST "http://localhost:3000/auth/login"   -H "Content-Type: application/json"   -d '{"email":"person@example.com","password":"password123"}'
```

### POST /auth/forgot-password

Request a password reset email.

Notes:

- Always returns `200 { ok: true }` (even if the email does not exist).

Request headers:

- `Content-Type: application/json`

Request body:

```json
{
  "email": "person@example.com"
}
```

Responses:

- `200`

```json
{ "ok": true }
```

curl:

```bash
curl -sS -X POST "http://localhost:3000/auth/forgot-password"   -H "Content-Type: application/json"   -d '{"email":"person@example.com"}'
```

## Next endpoints to implement

### GET /dashboard

Auth required.

Request headers:

- `Authorization: Bearer <accessToken>`

Responses:

- `200`

```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "person@example.com",
    "createdAt": "2026-03-05T00:00:00.000Z"
  },
  "rooms": []
}
```

- `401`

```json
{ "ok": false, "error": "unauthorized" }
```

curl:

```bash
curl -sS -X GET "http://localhost:3000/dashboard"   -H "Authorization: Bearer <accessToken>"
```

### POST /rooms

Create a room.

Auth required.

Request headers:

- `Authorization: Bearer <accessToken>`
- `Content-Type: application/json`

Request body:

```json
{
  "name": "My Room"
}
```

Responses:

- `200`

```json
{
  "ok": true,
  "room": {
    "id": "room_123",
    "name": "My Room",
    "createdAt": "2026-03-05T00:00:00.000Z"
  }
}
```

- `400`

```json
{ "ok": false, "error": "invalid name" }
```

- `401`

```json
{ "ok": false, "error": "unauthorized" }
```

curl:

```bash
curl -sS -X POST "http://localhost:3000/rooms"   -H "Authorization: Bearer <accessToken>"   -H "Content-Type: application/json"   -d '{"name":"My Room"}'
```

### GET /rooms/:roomId

Get a room by id.

Auth required.

Path params:

- `roomId` (string)

Request headers:

- `Authorization: Bearer <accessToken>`

Responses:

- `200`

```json
{
  "ok": true,
  "room": {
    "id": "room_123",
    "name": "My Room",
    "createdAt": "2026-03-05T00:00:00.000Z"
  }
}
```

- `401`

```json
{ "ok": false, "error": "unauthorized" }
```

- `404`

```json
{ "ok": false, "error": "not found" }
```

curl:

```bash
curl -sS -X GET "http://localhost:3000/rooms/room_123"   -H "Authorization: Bearer <accessToken>"
```
