"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomConfigModule = void 0;
const common_1 = require("@nestjs/common");
const room_config_service_1 = require("./room-config.service");
const room_config_controller_1 = require("./room-config.controller");
const database_module_1 = require("../database/database.module");
const room_module_1 = require("../room/room.module");
const gateway_module_1 = require("../gateway/gateway.module");
let RoomConfigModule = class RoomConfigModule {
};
exports.RoomConfigModule = RoomConfigModule;
exports.RoomConfigModule = RoomConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, room_module_1.RoomModule, gateway_module_1.GatewayModule],
        providers: [room_config_service_1.RoomConfigService],
        controllers: [room_config_controller_1.RoomConfigController],
        exports: [room_config_service_1.RoomConfigService],
    })
], RoomConfigModule);
//# sourceMappingURL=room-config.module.js.map