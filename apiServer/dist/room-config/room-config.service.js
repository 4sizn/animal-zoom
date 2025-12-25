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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomConfigService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const update_room_config_dto_1 = require("./dto/update-room-config.dto");
let RoomConfigService = class RoomConfigService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getRoomConfig(roomCode) {
        const room = await this.db.db
            .selectFrom('rooms')
            .select(['id', 'customization'])
            .where('code', '=', roomCode)
            .where('status', '=', 'active')
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const defaultConfig = {
            lightingPreset: update_room_config_dto_1.LightingPreset.DEFAULT,
            floorColor: '#8B4513',
            wallColor: '#ffffff',
            furniture: [],
            decorations: [],
        };
        if (!room.customization) {
            return defaultConfig;
        }
        return {
            ...defaultConfig,
            ...room.customization,
        };
    }
    async updateRoomConfig(roomCode, userId, updateDto) {
        const room = await this.db.db
            .selectFrom('rooms')
            .select(['id', 'customization'])
            .where('code', '=', roomCode)
            .where('status', '=', 'active')
            .executeTakeFirst();
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        const participant = await this.db.db
            .selectFrom('room_participants')
            .select(['role'])
            .where('roomId', '=', room.id)
            .where('userId', '=', userId)
            .where('isActive', '=', true)
            .executeTakeFirst();
        if (!participant || participant.role !== 'host') {
            throw new common_1.ForbiddenException('Only the host can update room config');
        }
        const currentConfig = await this.getRoomConfig(roomCode);
        const newConfig = {
            ...currentConfig,
            ...updateDto,
        };
        await this.db.db
            .updateTable('rooms')
            .set({
            customization: newConfig,
            updatedAt: new Date(),
        })
            .where('id', '=', room.id)
            .execute();
        return newConfig;
    }
};
exports.RoomConfigService = RoomConfigService;
exports.RoomConfigService = RoomConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RoomConfigService);
//# sourceMappingURL=room-config.service.js.map