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
exports.ResourceService = void 0;
const common_1 = require("@nestjs/common");
const s3_service_1 = require("./s3.service");
const uuid_1 = require("uuid");
let ResourceService = class ResourceService {
    s3Service;
    modelPrefix = 'models/';
    maxFileSize = 50 * 1024 * 1024;
    allowedMimeTypes = [
        'model/gltf-binary',
        'application/octet-stream',
    ];
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
        }
        const isGlbFile = file.originalname.toLowerCase().endsWith('.glb') ||
            file.mimetype === 'model/gltf-binary';
        if (!isGlbFile) {
            throw new common_1.BadRequestException('Only GLB (glTF Binary) files are allowed');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            if (!file.originalname.toLowerCase().endsWith('.glb')) {
                throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
            }
        }
    }
    async getAvailableModels() {
        const objects = await this.s3Service.listObjects(this.modelPrefix);
        return objects
            .filter((obj) => obj.key.endsWith('.glb'))
            .map((obj) => ({
            id: this.extractModelId(obj.key),
            name: this.extractModelName(obj.key),
            url: this.getPublicUrl(obj.key),
            size: obj.size,
            uploadedAt: obj.lastModified,
        }));
    }
    async getModelUrl(id) {
        const models = await this.getAvailableModels();
        const model = models.find((m) => m.id === id);
        if (!model) {
            throw new common_1.NotFoundException(`Model with id ${id} not found`);
        }
        const key = `${this.modelPrefix}${id}.glb`;
        return this.s3Service.generateSignedUrl(key, 3600);
    }
    async uploadModel(file) {
        this.validateFile(file);
        const id = (0, uuid_1.v4)();
        const key = `${this.modelPrefix}${id}.glb`;
        const result = await this.s3Service.uploadFile(file, key);
        return {
            id,
            name: file.originalname,
            url: result.url,
            size: file.size,
            uploadedAt: new Date(),
        };
    }
    async deleteModel(id) {
        const key = `${this.modelPrefix}${id}.glb`;
        try {
            await this.s3Service.deleteFile(key);
        }
        catch (_error) {
            throw new common_1.NotFoundException(`Model with id ${id} not found`);
        }
    }
    extractModelId(key) {
        const filename = key.replace(this.modelPrefix, '');
        return filename.replace('.glb', '');
    }
    extractModelName(key) {
        const parts = key.split('/');
        return parts[parts.length - 1];
    }
    getPublicUrl(key) {
        const bucket = this.s3Service.getBucketName();
        const region = this.s3Service.getRegion();
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
};
exports.ResourceService = ResourceService;
exports.ResourceService = ResourceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], ResourceService);
//# sourceMappingURL=resource.service.js.map