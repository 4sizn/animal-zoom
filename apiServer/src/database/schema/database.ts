import { UsersTable } from './users.js';
import { RoomsTable } from './rooms.js';
import { RoomParticipantsTable } from './room-participants.js';
import { AssetCatalogTable } from './asset-catalog.js';
import { ChatMessagesTable } from './chat-messages.js';

/**
 * Database schema interface for Kysely
 */
export interface Database {
  users: UsersTable;
  rooms: RoomsTable;
  room_participants: RoomParticipantsTable;
  asset_catalog: AssetCatalogTable;
  chat_messages: ChatMessagesTable;
}
