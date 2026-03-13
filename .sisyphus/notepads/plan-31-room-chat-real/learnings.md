
Discovery notes (2026-03-11)

- Demo chat UI lives in `client/webapp/src/pages/room/study/StudyRoomChatSidebar.tsx` and is mounted by `client/webapp/src/pages/room/study/ZoomRoomExperience.tsx`.
- Current chat is purely demo:
  - seeds canned authors/texts
  - stores messages in `localStorage` under `animal-zoom:study-room-chat:${roomId}:v1`
  - also schedules random incoming messages via `setTimeout`
- Server has Socket.IO gateway at namespace `/zoom` in `server/app/src/gateway/animal-zoom.gateway.ts`.
  - JWT is validated on connect via `JwtService.verifyAsync(token)`; token can come from `Authorization: Bearer ...` header or `handshake.auth.token`.
  - Currently only handles `zoom:update` -> broadcasts `zoom:updated`.
- DB migrations use Kysely file migrator in `server/app/src/database/migrate.ts`, migration files in `server/app/src/database/migrations/`.
