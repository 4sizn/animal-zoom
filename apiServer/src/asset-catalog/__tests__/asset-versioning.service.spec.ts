import { Test, TestingModule } from '@nestjs/testing';
import { AssetVersioningService } from '../asset-versioning.service.js';
import { AssetCatalogService } from '../asset-catalog.service.js';
import { S3Service } from '../../resource/s3.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssetStatus } from '../dto/asset-catalog.dto.js';

describe('AssetVersioningService', () => {
  let service: AssetVersioningService;
  let assetCatalogService: jest.Mocked<AssetCatalogService>;
  let s3Service: jest.Mocked<S3Service>;

  beforeEach(async () => {
    const mockAssetCatalogService = {
      findAssetById: jest.fn(),
      createAsset: jest.fn(),
      updateAsset: jest.fn(),
      listAssets: jest.fn(),
      deprecateAsset: jest.fn(),
    };

    const mockS3Service = {
      copyAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetVersioningService,
        {
          provide: AssetCatalogService,
          useValue: mockAssetCatalogService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<AssetVersioningService>(AssetVersioningService);
    assetCatalogService = module.get(AssetCatalogService);
    s3Service = module.get(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewVersion', () => {
    it('should create new version of asset', async () => {
      const existingAsset = {
        id: 'asset-123',
        assetType: 'avatar' as const,
        name: 'Fox Model',
        key: 'avatars/fox/1.0.0/model.glb',
        category: 'animals',
        tags: ['fox', 'mammal'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        thumbnailKey: 'avatars/fox/1.0.0/thumbnail.png',
        metadata: { polygonCount: 5000 },
        uploadedBy: 'user-1',
        status: AssetStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newAsset = {
        ...existingAsset,
        id: 'asset-456',
        key: 'avatars/fox/1.1.0/model.glb',
        version: '1.1.0',
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(
        existingAsset,
      );
      (s3Service.copyAsset as jest.Mock).mockResolvedValue(undefined);
      (assetCatalogService.createAsset as jest.Mock).mockResolvedValue(
        newAsset,
      );

      const result = await service.createNewVersion('asset-123', '1.1.0');

      expect(result).toEqual(newAsset);
      expect(s3Service.copyAsset).toHaveBeenCalledWith(
        'avatars/fox/1.0.0/model.glb',
        'avatars/fox/1.1.0/model.glb',
      );
      expect(assetCatalogService.createAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'avatars/fox/1.1.0/model.glb',
          version: '1.1.0',
        }),
      );
    });

    it('should throw NotFoundException if asset not found', async () => {
      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createNewVersion('invalid-asset', '1.1.0'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate semantic version format', async () => {
      const existingAsset = {
        id: 'asset-123',
        version: '1.0.0',
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(
        existingAsset,
      );

      await expect(
        service.createNewVersion('asset-123', 'invalid-version'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createNewVersion('asset-123', '1.0'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent creating lower version', async () => {
      const existingAsset = {
        id: 'asset-123',
        version: '2.0.0',
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(
        existingAsset,
      );

      await expect(
        service.createNewVersion('asset-123', '1.9.0'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listVersions', () => {
    it('should list all versions for asset key', async () => {
      const versions = [
        {
          id: 'asset-1',
          key: 'avatars/fox/1.0.0/model.glb',
          version: '1.0.0',
          status: AssetStatus.DEPRECATED,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'asset-2',
          key: 'avatars/fox/1.1.0/model.glb',
          version: '1.1.0',
          status: AssetStatus.DEPRECATED,
          createdAt: new Date('2024-02-01'),
        },
        {
          id: 'asset-3',
          key: 'avatars/fox/2.0.0/model.glb',
          version: '2.0.0',
          status: AssetStatus.ACTIVE,
          createdAt: new Date('2024-03-01'),
        },
      ];

      (assetCatalogService.listAssets as jest.Mock).mockResolvedValue(versions);

      const result = await service.listVersions('avatars/fox');

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe('2.0.0'); // Latest first
      expect(result[2].version).toBe('1.0.0');
    });

    it('should return empty array if no versions found', async () => {
      (assetCatalogService.listAssets as jest.Mock).mockResolvedValue([]);

      const result = await service.listVersions('avatars/nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('deprecateOldVersion', () => {
    it('should mark old version as deprecated', async () => {
      const asset = {
        id: 'asset-123',
        version: '1.0.0',
        status: AssetStatus.DEPRECATED,
      };

      (assetCatalogService.deprecateAsset as jest.Mock).mockResolvedValue(
        asset,
      );

      const result = await service.deprecateOldVersion('asset-123');

      expect(result).toEqual(asset);
      expect(assetCatalogService.deprecateAsset).toHaveBeenCalledWith(
        'asset-123',
      );
    });
  });

  describe('compareVersions', () => {
    it('should return positive if first version is greater', () => {
      expect(service.compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
      expect(service.compareVersions('1.1.0', '1.0.0')).toBeGreaterThan(0);
      expect(service.compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
    });

    it('should return negative if first version is lesser', () => {
      expect(service.compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
      expect(service.compareVersions('1.0.0', '1.1.0')).toBeLessThan(0);
      expect(service.compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
    });

    it('should return zero if versions are equal', () => {
      expect(service.compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(service.compareVersions('2.5.3', '2.5.3')).toBe(0);
    });
  });

  describe('getLatestVersion', () => {
    it('should return latest version for asset key', async () => {
      const versions = [
        {
          id: 'asset-1',
          key: 'avatars/fox/1.0.0/model.glb',
          version: '1.0.0',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'asset-2',
          key: 'avatars/fox/2.0.0/model.glb',
          version: '2.0.0',
          createdAt: new Date('2024-03-01'),
        },
        {
          id: 'asset-3',
          key: 'avatars/fox/1.5.0/model.glb',
          version: '1.5.0',
          createdAt: new Date('2024-02-01'),
        },
      ];

      (assetCatalogService.listAssets as jest.Mock).mockResolvedValue(versions);

      const result = await service.getLatestVersion('avatars/fox');

      expect(result.version).toBe('2.0.0');
    });

    it('should throw NotFoundException if no versions found', async () => {
      (assetCatalogService.listAssets as jest.Mock).mockResolvedValue([]);

      await expect(
        service.getLatestVersion('avatars/nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
