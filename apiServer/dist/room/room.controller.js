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
import { Controller, Post, Get, Delete, Body, Param, UseGuards, ValidationPipe, } from '@nestjs/common';
import { RoomService } from './room.service.js';
import { CreateRoomDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
let RoomController = class RoomController {
    roomService;
    constructor(roomService) {
        this.roomService = roomService;
    }
    async createRoom(user, dto) {
        return this.roomService.createRoom(user.id, dto);
    }
    async getRoomByCode(roomCode) {
        return this.roomService.getRoomByCode(roomCode);
    }
    async joinRoom(user, roomCode) {
        return this.roomService.joinRoom(user.id, roomCode);
    }
    async leaveRoom(user, roomCode) {
        await this.roomService.leaveRoom(user.id, roomCode);
        return { message: 'Left room successfully' };
    }
    async deleteRoom(user, roomCode) {
        await this.roomService.deleteRoom(user.id, roomCode);
        return { message: 'Room deleted successfully' };
    }
    async getRoomParticipants(roomCode) {
        return this.roomService.getRoomParticipants(roomCode);
    }
};
__decorate([
    Post(),
    __param(0, CurrentUser()),
    __param(1, Body(ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "createRoom", null);
__decorate([
    Get(':roomCode'),
    __param(0, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoomByCode", null);
__decorate([
    Post(':roomCode/join'),
    __param(0, CurrentUser()),
    __param(1, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "joinRoom", null);
__decorate([
    Post(':roomCode/leave'),
    __param(0, CurrentUser()),
    __param(1, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "leaveRoom", null);
__decorate([
    Delete(':roomCode'),
    __param(0, CurrentUser()),
    __param(1, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "deleteRoom", null);
__decorate([
    Get(':roomCode/participants'),
    __param(0, Param('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoomParticipants", null);
RoomController = __decorate([
    Controller('rooms'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [RoomService])
], RoomController);
export { RoomController };
//# sourceMappingURL=room.controller.js.map