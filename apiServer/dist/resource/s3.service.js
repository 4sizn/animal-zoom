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
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = S3Service_1 = class S3Service {
    configService;
    logger = new common_1.Logger(S3Service_1.name);
    s3Client;
    bucketName;
    region;
    constructor(configService) {
        this.configService = configService;
        this.region = this.configService.get('AWS_REGION', 'us-east-1');
        this.bucketName = this.configService.get('AWS_BUCKET_NAME') || '';
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        if (!accessKeyId || !secretAccessKey) {
            this.logger.warn('AWS credentials not configured. S3 operations will fail.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: accessKeyId && secretAccessKey
                ? {
                    accessKeyId,
                    secretAccessKey,
                }
                : undefined,
        });
    }
    async uploadFile(file, key) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
            },
        });
        await this.s3Client.send(command);
        this.logger.log(`File uploaded to S3: ${key}`);
        return {
            key,
            bucket: this.bucketName,
            url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
        };
    }
    async generateSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
            expiresIn,
        });
        return signedUrl;
    }
    async listObjects(prefix) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
        });
        const response = await this.s3Client.send(command);
        return (response.Contents?.map((obj) => ({
            key: obj.Key || '',
            lastModified: obj.LastModified || new Date(),
            size: obj.Size || 0,
        })) || []);
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
        this.logger.log(`File deleted from S3: ${key}`);
    }
    getBucketName() {
        return this.bucketName;
    }
    getRegion() {
        return this.region;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map