import { UsersTable } from './users.js';
import { RoomsTable } from './rooms.js';
import { RoomParticipantsTable } from './room-participants.js';

/**
 * Database schema interface for Kysely
 */
export interface Database {
  users: UsersTable;
  rooms: RoomsTable;
  room_participants: RoomParticipantsTable;
}
