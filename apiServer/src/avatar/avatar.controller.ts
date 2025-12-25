import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { UpdateAvatarDto, AvatarConfig } from './dto/update-avatar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/schema/users';
import { RoomGateway } from '../gateway/room.gateway';

@Controller('avatars')
@UseGuards(JwtAuthGuard)
export class AvatarController {
  constructor(
    private avatarService: AvatarService,
    private roomGateway: RoomGateway,
  ) {}

  @Get('me')
  async getMyAvatar(
    @CurrentUser() user: Omit<User, 'password'>,
  ): Promise<AvatarConfig> {
    return this.avatarService.getMyAvatar(user.id);
  }

  @Put('me')
  async updateMyAvatar(
    @CurrentUser() user: Omit<User, 'password'>,
    @Body(ValidationPipe) updateDto: UpdateAvatarDto,
  ): Promise<AvatarConfig> {
    const updatedConfig = await this.avatarService.updateMyAvatar(
      user.id,
      updateDto,
    );

    // Broadcast avatar update to all rooms the user is in
    this.roomGateway.broadcastAvatarUpdate(user.id, updatedConfig);

    return updatedConfig;
  }

  @Get(':userId')
  async getAvatar(@Param('userId') userId: string): Promise<AvatarConfig> {
    return this.avatarService.getAvatarByUserId(userId);
  }
}
