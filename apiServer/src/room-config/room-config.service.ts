import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import {
  UpdateRoomConfigDto,
  RoomConfig,
  LightingPreset,
} from './dto/update-room-config.dto.js';

@Injectable()
export class RoomConfigService {
  constructor(private db: DatabaseService) {}

  async getRoomConfig(roomCode: string): Promise<RoomConfig> {
    const room = await this.db.db
      .selectFrom('rooms')
      .select(['id', 'customization'])
      .where('code', '=', roomCode)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Return default config if not set
    const defaultConfig: RoomConfig = {
      lightingPreset: LightingPreset.DEFAULT,
      floorColor: '#8B4513',
      wallColor: '#ffffff',
      furniture: [],
      decorations: [],
    };

    if (!room.customization) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      ...(room.customization as Partial<RoomConfig>),
    };
  }

  async updateRoomConfig(
    roomCode: string,
    userId: string,
    updateDto: UpdateRoomConfigDto,
  ): Promise<RoomConfig> {
    // Check if user is host
    const room = await this.db.db
      .selectFrom('rooms')
      .select(['id', 'customization'])
      .where('code', '=', roomCode)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is host
    const participant = await this.db.db
      .selectFrom('room_participants')
      .select(['role'])
      .where('roomId', '=', room.id)
      .where('userId', '=', userId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    if (!participant || participant.role !== 'host') {
      throw new ForbiddenException('Only the host can update room config');
    }

    // Get current config
    const currentConfig = await this.getRoomConfig(roomCode);

    // Merge with updates
    const newConfig: RoomConfig = {
      ...currentConfig,
      ...updateDto,
    };

    // Update in database
    await this.db.db
      .updateTable('rooms')
      .set({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        customization: newConfig as any,
        updatedAt: new Date(),
      })
      .where('id', '=', room.id)
      .execute();

    return newConfig;
  }
}
