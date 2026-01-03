/**
 * AssetUrlResolver
 * Environment-aware URL resolution for assets
 * Supports: local development, S3 presigned URLs, and CDN
 */

type AssetMode = 'local' | 's3' | 'cdn';

interface AssetCatalogApi {
  getAssetUrl(key: string): Promise<{ url: string }>;
}

export class AssetUrlResolver {
  private mode: AssetMode;
  private cdnBaseUrl?: string;
  private apiBaseUrl: string;
  private cache: Map<string, string>;
  private assetCatalogApi?: AssetCatalogApi;

  constructor(
    mode: AssetMode = 'local',
    cdnBaseUrl?: string,
    apiBaseUrl?: string
  ) {
    this.mode = mode;
    this.cdnBaseUrl = cdnBaseUrl;
    this.apiBaseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.cache = new Map();
  }

  /**
   * Set the asset catalog API instance (for dependency injection in tests)
   */
  setAssetCatalogApi(api: AssetCatalogApi): void {
    this.assetCatalogApi = api;
  }

  /**
   * Resolve asset key to accessible URL based on environment
   */
  async resolveUrl(key: string): Promise<string> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    let url: string;

    switch (this.mode) {
      case 'local':
        // Development: Direct access via API server
        url = `${this.apiBaseUrl}/assets/${encodeURIComponent(key)}`;
        break;

      case 'cdn':
        // Production with CDN
        if (!this.cdnBaseUrl) {
          throw new Error('CDN base URL not configured');
        }
        url = `${this.cdnBaseUrl}/${key}`;
        break;

      case 's3':
      default:
        // Production: Get presigned URL from API
        url = await this.getPresignedUrl(key);
        break;
    }

    // Cache the resolved URL
    this.cache.set(key, url);

    return url;
  }

  /**
   * Get presigned URL from asset catalog API
   */
  private async getPresignedUrl(key: string): Promise<string> {
    if (!this.assetCatalogApi) {
      // Use dynamic import to avoid circular dependency in tests
      const { assetCatalogApi } = await import('../api/assetCatalog');
      this.assetCatalogApi = assetCatalogApi;
    }

    const response = await this.assetCatalogApi.getAssetUrl(key);
    return response.url;
  }

  /**
   * Clear the URL cache
   * Useful when assets are updated or re-uploaded
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current asset mode
   */
  getMode(): AssetMode {
    return this.mode;
  }
}

/**
 * Create default resolver based on environment
 */
export function createDefaultResolver(): AssetUrlResolver {
  const mode = (import.meta.env.VITE_ASSET_MODE as AssetMode) || 'local';
  const cdnBaseUrl = import.meta.env.VITE_CDN_BASE_URL;
  const apiBaseUrl = import.meta.env.VITE_API_URL;

  return new AssetUrlResolver(mode, cdnBaseUrl, apiBaseUrl);
}

export default AssetUrlResolver;
