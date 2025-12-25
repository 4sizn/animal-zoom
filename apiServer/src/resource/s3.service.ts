import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';

    // For local development, allow missing credentials (use LocalStack or mock)
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not configured. S3 operations will fail.',
      );
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<S3UploadResult> {
    const command = new PutObjectCommand({
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

  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return signedUrl;
  }

  async listObjects(prefix?: string): Promise<S3Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    const response = await this.s3Client.send(command);

    return (
      response.Contents?.map((obj) => ({
        key: obj.Key || '',
        lastModified: obj.LastModified || new Date(),
        size: obj.Size || 0,
      })) || []
    );
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);

    this.logger.log(`File deleted from S3: ${key}`);
  }

  getBucketName(): string {
    return this.bucketName;
  }

  getRegion(): string {
    return this.region;
  }
}
