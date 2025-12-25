import { UsersTable } from './users';
import { RoomsTable } from './rooms';
import { RoomParticipantsTable } from './room-participants';

/**
 * Database schema interface for Kysely
 */
export interface Database {
  users: UsersTable;
  rooms: RoomsTable;
  room_participants: RoomParticipantsTable;
}
