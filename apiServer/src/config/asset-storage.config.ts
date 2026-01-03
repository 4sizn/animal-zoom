/**
 * Asset Storage Configuration
 * Defines configuration for asset storage (S3/MinIO) and CDN
 */

export interface AssetStorageConfig {
  /** Storage mode: 's3' for AWS S3, 'local' for local filesystem, 'hybrid' for both */
  mode: 'S3' | 'local' | 'hybrid';

  /** S3/MinIO endpoint URL (e.g., http://minio:9000 for MinIO) */
  endpointUrl?: string;

  /** S3 bucket name */
  bucketName: string;

  /** AWS region */
  region: string;

  /** AWS access key ID */
  accessKeyId?: string;

  /** AWS secret access key */
  secretAccessKey?: string;

  /** CDN URL for asset delivery (optional, improves performance) */
  cdnUrl?: string;

  /** Local assets path (for 'local' or 'hybrid' modes) */
  localAssetsPath?: string;
}

/**
 * Load asset storage configuration from environment variables
 */
export function getAssetStorageConfig(): AssetStorageConfig {
  return {
    mode: (process.env.ASSET_STORAGE_MODE as any) || 's3',
    endpointUrl: process.env.AWS_ENDPOINT_URL,
    bucketName: process.env.AWS_BUCKET_NAME || '',
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    cdnUrl: process.env.ASSET_CDN_URL,
    localAssetsPath: process.env.LOCAL_ASSETS_PATH || './uploads',
  };
}
