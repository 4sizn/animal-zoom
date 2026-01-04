import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string | null;
  content: string;
  messageType: string;
  createdAt: Date;
  username?: string; // Joined from users table
}

export interface SaveChatMessageDto {
  roomId: string;
  userId: string;
  content: string;
  messageType?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private db: DatabaseService) {}

  /**
   * Save a chat message to the database
   */
  async saveMessage(dto: SaveChatMessageDto): Promise<ChatMessage> {
    try {
      const message = await this.db.db
        .insertInto('chat_messages')
        .values({
          room_id: dto.roomId,
          user_id: dto.userId,
          content: dto.content,
          message_type: dto.messageType || 'text',
          created_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      this.logger.log(
        `Chat message saved: ${message.id} in room ${dto.roomId}`,
      );

      return {
        id: message.id,
        roomId: message.room_id,
        userId: message.user_id,
        content: message.content,
        messageType: message.message_type,
        createdAt: message.created_at,
      };
    } catch (error) {
      this.logger.error('Failed to save chat message', error);
      throw error;
    }
  }

  /**
   * Get chat history for a room
   * @param roomId - Room UUID
   * @param limit - Maximum number of messages to return (default: 50)
   */
  async getRoomMessages(
    roomId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      // Get messages with user information
      const messages = await this.db.db
        .selectFrom('chat_messages')
        .leftJoin('users', 'users.id', 'chat_messages.user_id')
        .select([
          'chat_messages.id',
          'chat_messages.room_id',
          'chat_messages.user_id',
          'chat_messages.content',
          'chat_messages.message_type',
          'chat_messages.created_at',
          'users.username',
        ])
        .where('chat_messages.room_id', '=', roomId)
        .orderBy('chat_messages.created_at', 'desc')
        .limit(limit)
        .execute();

      // Return in chronological order (oldest first)
      return messages.reverse().map((msg) => ({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.created_at,
        username: msg.username || undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to get room messages for ${roomId}`, error);
      throw error;
    }
  }

  /**
   * Delete all messages for a room (when room is deleted)
   * @param roomId - Room UUID
   */
  async deleteRoomMessages(roomId: string): Promise<number> {
    try {
      const result = await this.db.db
        .deleteFrom('chat_messages')
        .where('room_id', '=', roomId)
        .executeTakeFirst();

      const count = Number(result.numDeletedRows);
      this.logger.log(`Deleted ${count} messages for room ${roomId}`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to delete messages for room ${roomId}`, error);
      throw error;
    }
  }
}
