import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import databaseConfig from './config/database.config.js';
import { validate } from './config/validation.schema.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RoomModule } from './room/room.module.js';
import { GatewayModule } from './gateway/gateway.module.js';
import { AvatarModule } from './avatar/avatar.module.js';
import { RoomConfigModule } from './room-config/room-config.module.js';
import { ResourceModule } from './resource/resource.module.js';
import { AssetCatalogModule } from './asset-catalog/asset-catalog.module.js';

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
    // Asset catalog module
    AssetCatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
