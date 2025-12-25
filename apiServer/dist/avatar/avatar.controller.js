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
import { AvatarService } from './avatar.service.js';
import { UpdateAvatarDto } from './dto/update-avatar.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RoomGateway } from '../gateway/room.gateway.js';
let AvatarController = class AvatarController {
    avatarService;
    roomGateway;
    constructor(avatarService, roomGateway) {
        this.avatarService = avatarService;
        this.roomGateway = roomGateway;
    }
    async getMyAvatar(user) {
        return this.avatarService.getMyAvatar(user.id);
    }
    async updateMyAvatar(user, updateDto) {
        const updatedConfig = await this.avatarService.updateMyAvatar(user.id, updateDto);
        this.roomGateway.broadcastAvatarUpdate(user.id, updatedConfig);
        return updatedConfig;
    }
    async getAvatar(userId) {
        return this.avatarService.getAvatarByUserId(userId);
    }
};
__decorate([
    Get('me'),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getMyAvatar", null);
__decorate([
    Put('me'),
    __param(0, CurrentUser()),
    __param(1, Body(ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateAvatarDto]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "updateMyAvatar", null);
__decorate([
    Get(':userId'),
    __param(0, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getAvatar", null);
AvatarController = __decorate([
    Controller('avatars'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [AvatarService,
        RoomGateway])
], AvatarController);
export { AvatarController };
//# sourceMappingURL=avatar.controller.js.map