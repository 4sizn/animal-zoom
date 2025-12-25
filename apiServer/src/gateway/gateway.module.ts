import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway.js';
import { RoomModule } from '../room/room.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [RoomModule, AuthModule],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class GatewayModule {}
