/**
 * AssetUrlResolver Tests
 * Tests environment-aware URL resolution for assets
 */

import { describe, it, expect, beforeEach } from 'bun:test';

describe('AssetUrlResolver', () => {
  let AssetUrlResolver: any;

  beforeEach(async () => {
    // Dynamic import to get fresh instance
    const module = await import('../AssetUrlResolver');
    AssetUrlResolver = module.AssetUrlResolver;
  });

  describe('resolveUrl', () => {
    it('should resolve local URLs in development mode', async () => {
      const resolver = new AssetUrlResolver('local');
      const key = 'assets/avatar/humanoid/1.0.0/uuid-1.glb';

      const url = await resolver.resolveUrl(key);

      expect(url).toContain('localhost');
      expect(url).toContain('3000');
    });

    it('should resolve S3 presigned URLs in production mode', async () => {
      const resolver = new AssetUrlResolver('s3');
      const mockAssetCatalogApi = {
        getAssetUrl: async (key: string) => ({
          url: `https://s3.amazonaws.com/bucket/${key}?signature=xyz`,
        }),
      };

      // Inject mock API
      resolver.setAssetCatalogApi(mockAssetCatalogApi);

      const key = 'assets/avatar/humanoid/1.0.0/uuid-1.glb';
      const url = await resolver.resolveUrl(key);

      expect(url).toContain('s3.amazonaws.com');
      expect(url).toContain('signature');
    });

    it('should use CDN URLs when CDN is configured', async () => {
      const resolver = new AssetUrlResolver('cdn', 'https://cdn.example.com');
      const key = 'assets/avatar/humanoid/1.0.0/uuid-1.glb';

      const url = await resolver.resolveUrl(key);

      expect(url).toBe('https://cdn.example.com/assets/avatar/humanoid/1.0.0/uuid-1.glb');
    });

    it('should cache resolved URLs to avoid redundant API calls', async () => {
      const resolver = new AssetUrlResolver('s3');
      let callCount = 0;

      const mockAssetCatalogApi = {
        getAssetUrl: async (key: string) => {
          callCount++;
          return { url: `https://s3.amazonaws.com/bucket/${key}?signature=xyz` };
        },
      };

      resolver.setAssetCatalogApi(mockAssetCatalogApi);

      const key = 'assets/avatar/humanoid/1.0.0/uuid-1.glb';

      // First call
      await resolver.resolveUrl(key);
      // Second call (should use cache)
      await resolver.resolveUrl(key);

      expect(callCount).toBe(1);
    });

    it('should handle missing keys gracefully', async () => {
      const resolver = new AssetUrlResolver('s3');
      const mockAssetCatalogApi = {
        getAssetUrl: async () => {
          throw new Error('Asset not found');
        },
      };

      resolver.setAssetCatalogApi(mockAssetCatalogApi);

      await expect(resolver.resolveUrl('invalid-key')).rejects.toThrow('Asset not found');
    });
  });

  describe('clearCache', () => {
    it('should clear URL cache', async () => {
      const resolver = new AssetUrlResolver('s3');
      let callCount = 0;

      const mockAssetCatalogApi = {
        getAssetUrl: async (key: string) => {
          callCount++;
          return { url: `https://s3.amazonaws.com/bucket/${key}` };
        },
      };

      resolver.setAssetCatalogApi(mockAssetCatalogApi);

      const key = 'assets/avatar/humanoid/1.0.0/uuid-1.glb';

      // First call
      await resolver.resolveUrl(key);
      // Clear cache
      resolver.clearCache();
      // Second call (should call API again)
      await resolver.resolveUrl(key);

      expect(callCount).toBe(2);
    });
  });
});
