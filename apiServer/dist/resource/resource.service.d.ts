import { S3Service } from './s3.service';
export interface ModelResource {
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: Date;
}
export declare class ResourceService {
    private s3Service;
    private readonly modelPrefix;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(s3Service: S3Service);
    validateFile(file: Express.Multer.File): void;
    getAvailableModels(): Promise<ModelResource[]>;
    getModelUrl(id: string): Promise<string>;
    uploadModel(file: Express.Multer.File): Promise<ModelResource>;
    deleteModel(id: string): Promise<void>;
    private extractModelId;
    private extractModelName;
    private getPublicUrl;
}
