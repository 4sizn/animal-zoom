"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomConfigController = void 0;
const common_1 = require("@nestjs/common");
const room_config_service_1 = require("./room-config.service");
const update_room_config_dto_1 = require("./dto/update-room-config.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const room_gateway_1 = require("../gateway/room.gateway");
let RoomConfigController = class RoomConfigController {
    roomConfigService;
    roomGateway;
    constructor(roomConfigService, roomGateway) {
        this.roomConfigService = roomConfigService;
        this.roomGateway = roomGateway;
    }
    async getRoomConfig(roomCode) {
        return this.roomConfigService.getRoomConfig(roomCode);
    }
    async updateRoomConfig(user, roomCode, updateDto) {
        const updatedConfig = await this.roomConfigService.updateRoomConfig(roomCode, user.id, updateDto);
        this.roomGateway.broadcastRoomConfigUpdate(roomCode, updatedConfig);
        return updatedConfig;
    }
};
exports.RoomConfigController = RoomConfigController;
__decorate([
    (0, common_1.Get)(':roomCode'),
    __param(0, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomConfigController.prototype, "getRoomConfig", null);
__decorate([
    (0, common_1.Put)(':roomCode'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomCode')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_room_config_dto_1.UpdateRoomConfigDto]),
    __metadata("design:returntype", Promise)
], RoomConfigController.prototype, "updateRoomConfig", null);
exports.RoomConfigController = RoomConfigController = __decorate([
    (0, common_1.Controller)('room-configs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [room_config_service_1.RoomConfigService,
        room_gateway_1.RoomGateway])
], RoomConfigController);
//# sourceMappingURL=room-config.controller.js.map