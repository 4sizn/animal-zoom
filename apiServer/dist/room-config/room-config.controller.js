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
import { Controller, Get, Put, Body, Param, UseGuards, ValidationPipe, } from '@nestjs/common';
import { RoomConfigService } from './room-config.service.js';
import { UpdateRoomConfigDto } from './dto/update-room-config.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RoomGateway } from '../gateway/room.gateway.js';
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
__decorate([
    Get(':roomCode'),
    __param(0, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomConfigController.prototype, "getRoomConfig", null);
__decorate([
    Put(':roomCode'),
    __param(0, CurrentUser()),
    __param(1, Param('roomCode')),
    __param(2, Body(ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateRoomConfigDto]),
    __metadata("design:returntype", Promise)
], RoomConfigController.prototype, "updateRoomConfig", null);
RoomConfigController = __decorate([
    Controller('room-configs'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [RoomConfigService,
        RoomGateway])
], RoomConfigController);
export { RoomConfigController };
//# sourceMappingURL=room-config.controller.js.map