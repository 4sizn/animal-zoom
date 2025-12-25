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
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const room_service_1 = require("./room.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
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
exports.RoomController = RoomController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)(':roomCode'),
    __param(0, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoomByCode", null);
__decorate([
    (0, common_1.Post)(':roomCode/join'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Post)(':roomCode/leave'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "leaveRoom", null);
__decorate([
    (0, common_1.Delete)(':roomCode'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "deleteRoom", null);
__decorate([
    (0, common_1.Get)(':roomCode/participants'),
    __param(0, (0, common_1.Param)('roomCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoomParticipants", null);
exports.RoomController = RoomController = __decorate([
    (0, common_1.Controller)('rooms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [room_service_1.RoomService])
], RoomController);
//# sourceMappingURL=room.controller.js.map