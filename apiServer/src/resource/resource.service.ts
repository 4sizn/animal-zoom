import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface ModelResource {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

@Injectable()
export class ResourceService {
  private readonly modelPrefix = 'models/';
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'model/gltf-binary',
    'application/octet-stream',
  ];

  constructor(private s3Service: S3Service) {}

  validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Check file extension (must be .glb)
    const isGlbFile =
      file.originalname.toLowerCase().endsWith('.glb') ||
      file.mimetype === 'model/gltf-binary';

    if (!isGlbFile) {
      throw new BadRequestException('Only GLB (glTF Binary) files are allowed');
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      // Allow if extension is correct even if MIME type is generic
      if (!file.originalname.toLowerCase().endsWith('.glb')) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
        );
      }
    }
  }

  async getAvailableModels(): Promise<ModelResource[]> {
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

  async getModelUrl(id: string): Promise<string> {
    const models = await this.getAvailableModels();
    const model = models.find((m) => m.id === id);

    if (!model) {
      throw new NotFoundException(`Model with id ${id} not found`);
    }

    // Generate presigned URL valid for 1 hour
    const key = `${this.modelPrefix}${id}.glb`;
    return this.s3Service.generateSignedUrl(key, 3600);
  }

  async uploadModel(file: Express.Multer.File): Promise<ModelResource> {
    // Validate file
    this.validateFile(file);

    // Generate unique ID
    const id = uuidv4();
    const key = `${this.modelPrefix}${id}.glb`;

    // Upload to S3
    const result = await this.s3Service.uploadFile(file, key);

    return {
      id,
      name: file.originalname,
      url: result.url,
      size: file.size,
      uploadedAt: new Date(),
    };
  }

  async deleteModel(id: string): Promise<void> {
    const key = `${this.modelPrefix}${id}.glb`;

    try {
      await this.s3Service.deleteFile(key);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new NotFoundException(`Model with id ${id} not found`);
    }
  }

  private extractModelId(key: string): string {
    // Extract ID from "models/uuid.glb" -> "uuid"
    const filename = key.replace(this.modelPrefix, '');
    return filename.replace('.glb', '');
  }

  private extractModelName(key: string): string {
    // Extract filename from path
    const parts = key.split('/');
    return parts[parts.length - 1];
  }

  private getPublicUrl(key: string): string {
    const bucket = this.s3Service.getBucketName();
    const region = this.s3Service.getRegion();
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
