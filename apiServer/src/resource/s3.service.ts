import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AssetStorageInterface } from './interfaces/asset-storage.interface.js';

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
export class S3Service implements AssetStorageInterface {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly endpointUrl: string;
  private readonly cdnUrl: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';
    this.cdnUrl = this.configService.get<string>('ASSET_CDN_URL', '');

    // For local development, allow missing credentials (use LocalStack or mock)
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const endpointUrl = this.configService.get<string>('AWS_ENDPOINT_URL', '');
    this.endpointUrl = endpointUrl;

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not configured. S3 operations will fail.',
      );
    }

    // Log endpoint selection
    if (endpointUrl) {
      this.logger.log(
        `Using custom S3 endpoint: ${endpointUrl} (MinIO/LocalStack)`,
      );
    } else {
      this.logger.log(`Using AWS S3 in region: ${this.region}`);
    }

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: endpointUrl || undefined,
      forcePathStyle: !!endpointUrl, // Required for MinIO/LocalStack
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
  }

  /**
   * Check if using custom endpoint (MinIO/LocalStack) vs AWS S3
   */
  private isUsingCustomEndpoint(): boolean {
    return !!this.endpointUrl;
  }

  /**
   * Generate public URL for an object
   * Returns proper URL format based on endpoint configuration:
   * - MinIO/LocalStack: http://localhost:9000/bucket-name/key (path-style)
   * - AWS S3: https://bucket.s3.region.amazonaws.com/key (virtual-hosted-style)
   */
  generatePublicUrl(key: string): string {
    if (this.isUsingCustomEndpoint()) {
      // Path-style URL for MinIO/LocalStack
      const endpoint = this.endpointUrl.replace(/\/$/, ''); // Remove trailing slash
      return `${endpoint}/${this.bucketName}/${key}`;
    } else {
      // Virtual-hosted-style URL for AWS S3
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }
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
      CacheControl: 'public, max-age=31536000, immutable', // 1 year cache for assets
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
      url: this.generatePublicUrl(key),
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

  getEndpointUrl(): string {
    return this.endpointUrl;
  }

  /**
   * Generate asset URL with CDN support
   * If ASSET_CDN_URL is configured, returns CDN URL
   * Otherwise, returns presigned URL
   */
  async generateAssetUrl(key: string, expiresIn = 3600): Promise<string> {
    // Use CDN URL if configured
    if (this.cdnUrl) {
      const cdnBaseUrl = this.cdnUrl.replace(/\/$/, ''); // Remove trailing slash
      return `${cdnBaseUrl}/${key}`;
    }

    // Fall back to presigned URL
    return this.generateSignedUrl(key, expiresIn);
  }

  /**
   * List assets by prefix with pagination support
   */
  async listAssetsByPrefix(
    prefix: string,
    options?: {
      limit?: number;
      continuationToken?: string;
    },
  ): Promise<{
    assets: Array<{
      key: string;
      lastModified: Date;
      size: number;
    }>;
    nextContinuationToken?: string;
  }> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: options?.limit || 1000,
      ContinuationToken: options?.continuationToken,
    });

    const response = await this.s3Client.send(command);

    return {
      assets:
        response.Contents?.map((obj) => ({
          key: obj.Key || '',
          lastModified: obj.LastModified || new Date(),
          size: obj.Size || 0,
        })) || [],
      nextContinuationToken: response.NextContinuationToken,
    };
  }

  /**
   * Copy asset from source to destination (for versioning support)
   */
  async copyAsset(sourceKey: string, destinationKey: string): Promise<void> {
    const command = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: destinationKey,
    });

    await this.s3Client.send(command);

    this.logger.log(`Asset copied from ${sourceKey} to ${destinationKey}`);
  }
}
