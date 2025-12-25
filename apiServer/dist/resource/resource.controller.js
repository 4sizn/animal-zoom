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
import { Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourceService } from './resource.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
let ResourceController = class ResourceController {
    resourceService;
    constructor(resourceService) {
        this.resourceService = resourceService;
    }
    async getModels() {
        return this.resourceService.getAvailableModels();
    }
    async getModelUrl(id) {
        const url = await this.resourceService.getModelUrl(id);
        return { url };
    }
    async uploadModel(file) {
        return this.resourceService.uploadModel(file);
    }
    async deleteModel(id) {
        await this.resourceService.deleteModel(id);
        return { success: true };
    }
};
__decorate([
    Get('models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getModels", null);
__decorate([
    Get('models/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getModelUrl", null);
__decorate([
    Post('upload'),
    UseInterceptors(FileInterceptor('file')),
    __param(0, UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
            new FileTypeValidator({ fileType: /\.(glb)$/ }),
        ],
        fileIsRequired: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "uploadModel", null);
__decorate([
    Delete('models/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "deleteModel", null);
ResourceController = __decorate([
    Controller('resources'),
    UseGuards(JwtAuthGuard),
    __metadata("design:paramtypes", [ResourceService])
], ResourceController);
export { ResourceController };
//# sourceMappingURL=resource.controller.js.map