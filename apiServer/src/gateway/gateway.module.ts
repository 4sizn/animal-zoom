import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomModule } from '../room/room.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RoomModule, AuthModule],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class GatewayModule {}
