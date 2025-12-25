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
exports.ResourceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const resource_service_1 = require("./resource.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
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
exports.ResourceController = ResourceController;
__decorate([
    (0, common_1.Get)('models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "getModelUrl", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /\.(glb)$/ }),
        ],
        fileIsRequired: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "uploadModel", null);
__decorate([
    (0, common_1.Delete)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResourceController.prototype, "deleteModel", null);
exports.ResourceController = ResourceController = __decorate([
    (0, common_1.Controller)('resources'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [resource_service_1.ResourceService])
], ResourceController);
//# sourceMappingURL=resource.controller.js.map