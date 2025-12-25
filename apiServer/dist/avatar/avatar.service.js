var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
let AvatarService = class AvatarService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getMyAvatar(userId) {
        const user = await this.db.db
            .selectFrom('users')
            .select(['avatarCustomization'])
            .where('id', '=', userId)
            .executeTakeFirst();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const defaultConfig = {
            modelUrl: null,
            primaryColor: '#ffffff',
            secondaryColor: '#000000',
            accessories: [],
        };
        if (!user.avatarCustomization) {
            return defaultConfig;
        }
        return {
            ...defaultConfig,
            ...user.avatarCustomization,
        };
    }
    async updateMyAvatar(userId, updateDto) {
        const currentConfig = await this.getMyAvatar(userId);
        const newConfig = {
            ...currentConfig,
            ...updateDto,
        };
        await this.db.db
            .updateTable('users')
            .set({
            avatarCustomization: newConfig,
            updatedAt: new Date(),
        })
            .where('id', '=', userId)
            .execute();
        return newConfig;
    }
    async getAvatarByUserId(userId) {
        return this.getMyAvatar(userId);
    }
};
AvatarService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DatabaseService])
], AvatarService);
export { AvatarService };
//# sourceMappingURL=avatar.service.js.map