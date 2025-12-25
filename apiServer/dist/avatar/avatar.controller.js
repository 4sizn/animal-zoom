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
exports.AvatarController = void 0;
const common_1 = require("@nestjs/common");
const avatar_service_1 = require("./avatar.service");
const update_avatar_dto_1 = require("./dto/update-avatar.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const room_gateway_1 = require("../gateway/room.gateway");
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
exports.AvatarController = AvatarController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getMyAvatar", null);
__decorate([
    (0, common_1.Put)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_avatar_dto_1.UpdateAvatarDto]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "updateMyAvatar", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getAvatar", null);
exports.AvatarController = AvatarController = __decorate([
    (0, common_1.Controller)('avatars'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [avatar_service_1.AvatarService,
        room_gateway_1.RoomGateway])
], AvatarController);
//# sourceMappingURL=avatar.controller.js.map