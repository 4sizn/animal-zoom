import { Generated, Insertable, Selectable, Updateable } from 'kysely';

/**
 * Chat messages table schema
 */
export interface ChatMessagesTable {
  id: Generated<string>;
  room_id: string;
  user_id: string | null;
  content: string;
  message_type: string;
  created_at: Generated<Date>;
}

export type ChatMessage = Selectable<ChatMessagesTable>;
export type NewChatMessage = Insertable<ChatMessagesTable>;
export type ChatMessageUpdate = Updateable<ChatMessagesTable>;
