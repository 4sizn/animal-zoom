var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { RoomConfigService } from './room-config.service.js';
import { RoomConfigController } from './room-config.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { RoomModule } from '../room/room.module.js';
import { GatewayModule } from '../gateway/gateway.module.js';
let RoomConfigModule = class RoomConfigModule {
};
RoomConfigModule = __decorate([
    Module({
        imports: [DatabaseModule, RoomModule, GatewayModule],
        providers: [RoomConfigService],
        controllers: [RoomConfigController],
        exports: [RoomConfigService],
    })
], RoomConfigModule);
export { RoomConfigModule };
//# sourceMappingURL=room-config.module.js.map