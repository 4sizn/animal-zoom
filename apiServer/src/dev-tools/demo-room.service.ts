import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service.js';

/**
 * Demo Room Service
 * Creates and maintains a demo room for development/testing
 */
@Injectable()
export class DemoRoomService implements OnModuleInit {
  private readonly logger = new Logger(DemoRoomService.name);
  private readonly DEMO_ROOM_CODE = 'demo-room';
  private readonly DEMO_ROOM_NAME = 'Demo Room (Development)';

  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    // Only create demo room in development
    if (nodeEnv === 'development') {
      await this.ensureDemoRoomExists();
    }
  }

  /**
   * Ensure demo room exists in the database
   */
  async ensureDemoRoomExists(): Promise<void> {
    try {
      // Check if demo room already exists
      const existingRoom = await this.db.db
        .selectFrom('rooms')
        .selectAll()
        .where('code', '=', this.DEMO_ROOM_CODE)
        .executeTakeFirst();

      if (existingRoom) {
        // Update to ensure it's active
        await this.db.db
          .updateTable('rooms')
          .set({
            status: 'active',
            lastActivityAt: new Date(),
            updatedAt: new Date(),
          })
          .where('code', '=', this.DEMO_ROOM_CODE)
          .execute();

        this.logger.log(`✅ Demo room "${this.DEMO_ROOM_CODE}" already exists and is active`);
      } else {
        // Create demo room
        await this.db.db
          .insertInto('rooms')
          .values({
            code: this.DEMO_ROOM_CODE,
            name: this.DEMO_ROOM_NAME,
            status: 'active',
            currentParticipants: 0,
            maxParticipants: 50,
            waiting_room_enabled: false,
            lastActivityAt: new Date(),
            updatedAt: new Date(),
          })
          .execute();

        this.logger.log(`✅ Demo room "${this.DEMO_ROOM_CODE}" created successfully`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure demo room exists', error);
    }
  }

  /**
   * Check if a room code is the demo room
   */
  isDemoRoom(roomCode: string): boolean {
    return roomCode === this.DEMO_ROOM_CODE;
  }

  /**
   * Get demo room code
   */
  getDemoRoomCode(): string {
    return this.DEMO_ROOM_CODE;
  }
}
