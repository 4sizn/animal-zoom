import { apiClient } from "./client";
import type {
  AssetCatalogResponse,
  AssetFilterParams,
  AssetResponseDto,
} from "./types";

/**
 * Simple cache implementation for asset list
 * Cache TTL: 5 minutes
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

function getCacheKey(method: string, params: any): string {
  return `${method}:${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Asset Catalog API
 * Provides access to asset metadata and catalog operations
 */
export const assetCatalogApi = {
  /**
   * List assets with optional filters and pagination
   * Results are cached for 5 minutes
   */
  async listAssets(
    filters: AssetFilterParams = {},
  ): Promise<AssetCatalogResponse> {
    const cacheKey = getCacheKey("listAssets", filters);
    const cached = getFromCache<AssetCatalogResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await apiClient.get<AssetCatalogResponse>(
      "/resources/catalog",
      {
        params: filters,
      },
    );

    setCache(cacheKey, response.data);
    return response.data;
  },

  /**
   * Get single asset by ID
   */
  async getAsset(id: string): Promise<AssetResponseDto | null> {
    const response = await apiClient.get<AssetResponseDto | null>(
      `/resources/catalog/${id}`,
    );
    return response.data;
  },

  /**
   * Get presigned URL for asset by S3 key
   * Used to download or access asset files
   */
  async getAssetUrl(key: string): Promise<{ url: string }> {
    // Encode the key to handle special characters in URL
    const encodedKey = encodeURIComponent(key);
    const response = await apiClient.get<{ url: string }>(
      `/resources/assets/${encodedKey}/url`,
    );
    return response.data;
  },

  /**
   * Clear the asset list cache
   * Useful after uploading new assets
   */
  clearCache(): void {
    cache.clear();
  },
};

export default assetCatalogApi;
