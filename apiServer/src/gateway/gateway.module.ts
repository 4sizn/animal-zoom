import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway.js';
import { RoomModule } from '../room/room.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ChatModule } from '../chat/chat.module.js';

@Module({
  imports: [RoomModule, AuthModule, ChatModule],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class GatewayModule {}
