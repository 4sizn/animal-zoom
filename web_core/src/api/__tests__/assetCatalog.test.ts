/**
 * Asset Catalog API Tests
 */

import './setup';
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { apiClient } from '../client';

// Mock apiClient methods
const mockApiClient = apiClient as any;

describe('Asset Catalog API', () => {
  let assetCatalogApi: typeof import('../assetCatalog').assetCatalogApi;

  beforeEach(async () => {
    // Dynamic import to get fresh instance
    const module = await import('../assetCatalog');
    assetCatalogApi = module.assetCatalogApi;
  });

  describe('listAssets', () => {
    it('should fetch asset list from API', async () => {
      const mockResponse = {
        items: [
          {
            id: 'asset-1',
            assetType: 'avatar',
            name: 'Test Avatar',
            key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
            category: 'humanoid',
            tags: ['male'],
            version: '1.0.0',
            fileSize: 1024000,
            mimeType: 'model/gltf-binary',
            metadata: {},
            uploadedBy: 'user-123',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockApiClient.get = mock(() => Promise.resolve({ data: mockResponse }));

      const result = await assetCatalogApi.listAssets({});

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockApiClient.get).toHaveBeenCalledWith('/resources/catalog', {
        params: {},
      });
    });

    it('should filter assets by type', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockApiClient.get = mock(() => Promise.resolve({ data: mockResponse }));

      await assetCatalogApi.listAssets({ assetType: 'avatar' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/resources/catalog', {
        params: { assetType: 'avatar' },
      });
    });

    it('should support pagination parameters', async () => {
      const mockResponse = {
        items: [],
        total: 50,
        page: 2,
        limit: 20,
      };

      mockApiClient.get = mock(() => Promise.resolve({ data: mockResponse }));

      const result = await assetCatalogApi.listAssets({ page: 2, limit: 20 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(mockApiClient.get).toHaveBeenCalledWith('/resources/catalog', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  describe('getAsset', () => {
    it('should fetch single asset by ID', async () => {
      const mockAsset = {
        id: 'asset-1',
        assetType: 'avatar',
        name: 'Test Avatar',
        key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
        category: 'humanoid',
        tags: ['male'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        metadata: {},
        uploadedBy: 'user-123',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.get = mock(() => Promise.resolve({ data: mockAsset }));

      const result = await assetCatalogApi.getAsset('asset-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('asset-1');
      expect(mockApiClient.get).toHaveBeenCalledWith('/resources/catalog/asset-1');
    });

    it('should return null for non-existent asset', async () => {
      mockApiClient.get = mock(() => Promise.resolve({ data: null }));

      const result = await assetCatalogApi.getAsset('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('getAssetUrl', () => {
    it('should fetch presigned URL for asset', async () => {
      const mockUrl = { url: 'https://s3.amazonaws.com/bucket/asset.glb?signature=xyz' };

      mockApiClient.get = mock(() => Promise.resolve({ data: mockUrl }));

      const result = await assetCatalogApi.getAssetUrl('assets/avatar/humanoid/1.0.0/uuid-1.glb');

      expect(result.url).toContain('s3.amazonaws.com');
      expect(mockApiClient.get).toHaveBeenCalled();
    });
  });

  describe('Asset Catalog API - Cache Behavior', () => {
    it('should cache asset list for 5 minutes', async () => {
      const mockResponse = {
        items: [{ id: 'asset-1', name: 'Test' } as any],
        total: 1,
        page: 1,
        limit: 10,
      };

      let callCount = 0;
      mockApiClient.get = mock(() => {
        callCount++;
        return Promise.resolve({ data: mockResponse });
      });

      // Clear any existing cache
      assetCatalogApi.clearCache();

      // First call
      const result1 = await assetCatalogApi.listAssets({});
      expect(result1.items).toHaveLength(1);

      // Second call (should use cache)
      const result2 = await assetCatalogApi.listAssets({});
      expect(result2.items).toHaveLength(1);

      // Should only call API once due to caching
      expect(callCount).toBe(1);
    });
  });
});
