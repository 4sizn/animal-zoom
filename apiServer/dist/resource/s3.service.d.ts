import { ConfigService } from '@nestjs/config';
export interface S3UploadResult {
    key: string;
    bucket: string;
    url: string;
}
export interface S3Object {
    key: string;
    lastModified: Date;
    size: number;
}
export declare class S3Service {
    private configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    private readonly region;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, key: string): Promise<S3UploadResult>;
    generateSignedUrl(key: string, expiresIn?: number): Promise<string>;
    listObjects(prefix?: string): Promise<S3Object[]>;
    deleteFile(key: string): Promise<void>;
    getBucketName(): string;
    getRegion(): string;
}
