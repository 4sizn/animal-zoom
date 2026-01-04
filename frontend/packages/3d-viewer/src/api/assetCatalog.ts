/**
 * Asset Catalog API stub
 * This is a placeholder for the actual API implementation
 */

export interface AssetCatalogApi {
  getAssetUrl(key: string): Promise<{ url: string }>;
}

/**
 * Default asset catalog API implementation
 * Returns local asset URLs
 */
export const assetCatalogApi: AssetCatalogApi = {
  async getAssetUrl(key: string): Promise<{ url: string }> {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return {
      url: `${apiBaseUrl}/assets/${encodeURIComponent(key)}`
    };
  }
};
