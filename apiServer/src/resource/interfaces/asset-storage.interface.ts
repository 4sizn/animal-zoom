export interface AssetStorageInterface {
  /**
   * Upload a file to storage
   */
  uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<{
    key: string;
    bucket?: string;
    url: string;
  }>;

  /**
   * Generate a URL for accessing the asset
   */
  generateAssetUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * List assets by prefix with pagination
   */
  listAssetsByPrefix(
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
  }>;

  /**
   * Copy an asset from one location to another
   */
  copyAsset(sourceKey: string, destinationKey: string): Promise<void>;

  /**
   * Delete an asset
   */
  deleteFile(key: string): Promise<void>;
}
