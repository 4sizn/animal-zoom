import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { validate } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { GatewayModule } from './gateway/gateway.module';
import { AvatarModule } from './avatar/avatar.module';
import { RoomConfigModule } from './room-config/room-config.module';
import { ResourceModule } from './resource/resource.module';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [databaseConfig],
      envFilePath: ['.env'],
    }),
    // Kysely database module
    DatabaseModule,
    // Authentication module
    AuthModule,
    // Room management module
    RoomModule,
    // WebSocket Gateway
    GatewayModule,
    // Avatar customization module
    AvatarModule,
    // Room config module
    RoomConfigModule,
    // Resource management module
    ResourceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
