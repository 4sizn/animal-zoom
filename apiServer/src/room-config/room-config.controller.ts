import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RoomConfigService } from './room-config.service';
import { UpdateRoomConfigDto, RoomConfig } from './dto/update-room-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/schema/users';
import { RoomGateway } from '../gateway/room.gateway';

@Controller('room-configs')
@UseGuards(JwtAuthGuard)
export class RoomConfigController {
  constructor(
    private roomConfigService: RoomConfigService,
    private roomGateway: RoomGateway,
  ) {}

  @Get(':roomCode')
  async getRoomConfig(
    @Param('roomCode') roomCode: string,
  ): Promise<RoomConfig> {
    return this.roomConfigService.getRoomConfig(roomCode);
  }

  @Put(':roomCode')
  async updateRoomConfig(
    @CurrentUser() user: Omit<User, 'password'>,
    @Param('roomCode') roomCode: string,
    @Body(ValidationPipe) updateDto: UpdateRoomConfigDto,
  ): Promise<RoomConfig> {
    const updatedConfig = await this.roomConfigService.updateRoomConfig(
      roomCode,
      user.id,
      updateDto,
    );

    // Broadcast room config update to all participants
    this.roomGateway.broadcastRoomConfigUpdate(roomCode, updatedConfig);

    return updatedConfig;
  }
}
