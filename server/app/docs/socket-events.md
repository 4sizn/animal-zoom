# Socket.IO Events

This document describes the Socket.IO contract used by the server.

Implementation reference: `server/app/src/gateway/animal-zoom.gateway.ts`.

## Namespace

- `/zoom`

## Auth

The socket connection requires a valid JWT (same token returned by `POST /auth/login`).

The server accepts the token via either:

- `handshake.auth.token` (recommended)
- `Authorization: Bearer <accessToken>` header

If the token is missing/invalid, the server disconnects the client.

## Conventions

- Most events use an ack callback and return `{ ok: true, ... }` on success.
- Errors return `{ ok: false, error: string }`.

Common error codes:

- `unauthorized`
- `invalid_room_id`
- `room_not_found`
- `invalid_text`
- `message_too_long`
- `rate_limited`

## Room Chat

### room:join (client -> server)

Payload:

```json
{ "roomId": "demo-room" }
```

Ack:

```json
{ "ok": true }
```

### room:leave (client -> server)

Payload:

```json
{ "roomId": "demo-room" }
```

Ack:

```json
{ "ok": true }
```

### room:history (client -> server)

Payload:

```json
{ "roomId": "demo-room", "limit": 50 }
```

Ack:

```json
{ "ok": true, "messages": [] }
```

### room:message (client -> server)

Payload:

```json
{ "roomId": "demo-room", "text": "hello" }
```

Ack:

```json
{ "ok": true, "message": { "id": 1, "roomId": "demo-room", "authorUserId": 9, "text": "hello", "createdAt": "2026-03-11T00:00:00.000Z" } }
```

### room:message:created (server -> client)

Payload (broadcast):

```json
{ "id": 1, "roomId": "demo-room", "authorUserId": 9, "text": "hello", "createdAt": "2026-03-11T00:00:00.000Z" }
```

## Production Limits

- `text` max length: 500 characters
- Rate limit (per socket): 5 messages per 5 seconds
