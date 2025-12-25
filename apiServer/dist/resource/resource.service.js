var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, BadRequestException, NotFoundException, } from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { v4 as uuidv4 } from 'uuid';
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
            throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
        }
        const isGlbFile = file.originalname.toLowerCase().endsWith('.glb') ||
            file.mimetype === 'model/gltf-binary';
        if (!isGlbFile) {
            throw new BadRequestException('Only GLB (glTF Binary) files are allowed');
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            if (!file.originalname.toLowerCase().endsWith('.glb')) {
                throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
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
            throw new NotFoundException(`Model with id ${id} not found`);
        }
        const key = `${this.modelPrefix}${id}.glb`;
        return this.s3Service.generateSignedUrl(key, 3600);
    }
    async uploadModel(file) {
        this.validateFile(file);
        const id = uuidv4();
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
            throw new NotFoundException(`Model with id ${id} not found`);
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
ResourceService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [S3Service])
], ResourceService);
export { ResourceService };
//# sourceMappingURL=resource.service.js.map