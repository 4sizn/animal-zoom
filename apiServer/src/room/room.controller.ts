import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RoomService } from './room.service.js';
import { CreateRoomDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../database/schema/index.js';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  async createRoom(
    @CurrentUser() user: Omit<User, 'password'>,
    @Body(ValidationPipe) dto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(user.id, dto);
  }

  @Get(':roomCode')
  async getRoomByCode(@Param('roomCode') roomCode: string) {
    return this.roomService.getRoomByCode(roomCode);
  }

  @Post(':roomCode/join')
  async joinRoom(
    @CurrentUser() user: Omit<User, 'password'>,
    @Param('roomCode') roomCode: string,
  ) {
    return this.roomService.joinRoom(user.id, roomCode);
  }

  @Post(':roomCode/leave')
  async leaveRoom(
    @CurrentUser() user: Omit<User, 'password'>,
    @Param('roomCode') roomCode: string,
  ) {
    await this.roomService.leaveRoom(user.id, roomCode);
    return { message: 'Left room successfully' };
  }

  @Delete(':roomCode')
  async deleteRoom(
    @CurrentUser() user: Omit<User, 'password'>,
    @Param('roomCode') roomCode: string,
  ) {
    await this.roomService.deleteRoom(user.id, roomCode);
    return { message: 'Room deleted successfully' };
  }

  @Get(':roomCode/participants')
  async getRoomParticipants(@Param('roomCode') roomCode: string) {
    return this.roomService.getRoomParticipants(roomCode);
  }
}
