import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('rooms/:roomCode/messages')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get chat history for a room' })
  @ApiResponse({
    status: 200,
    description: 'Returns chat messages for the room',
  })
  async getRoomMessages(
    @Param('roomCode') roomCode: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const messages = await this.chatService.getRoomMessages(
      roomCode,
      limitNum,
    );

    return {
      roomCode,
      messages,
      count: messages.length,
    };
  }
}
