/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { AssetOptimizerService } from '../asset-optimizer.service.js';
import { S3Service } from '../s3.service.js';
import { AssetCatalogService } from '../../asset-catalog/asset-catalog.service.js';
import { NotFoundException } from '@nestjs/common';

describe('AssetOptimizerService', () => {
  let service: AssetOptimizerService;
  let assetCatalogService: jest.Mocked<AssetCatalogService>;

  beforeEach(async () => {
    const mockS3Service = {
      listObjects: jest.fn(),
      generateSignedUrl: jest.fn(),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const mockAssetCatalogService = {
      findAssetById: jest.fn(),
      updateAsset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetOptimizerService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: AssetCatalogService,
          useValue: mockAssetCatalogService,
        },
      ],
    }).compile();

    service = module.get<AssetOptimizerService>(AssetOptimizerService);
    assetCatalogService = module.get(AssetCatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizeAsset', () => {
    it('should track optimization status in metadata', async () => {
      const asset = {
        id: 'asset-123',
        key: 'avatars/fox/1.0.0/model.glb',
        fileSize: 2048000,
        metadata: null,
      };

      const optimizedAsset = {
        ...asset,
        metadata: {
          optimization: {
            status: 'optimized',
            originalSize: 2048000,
            optimizedSize: 1024000,
            compressionRatio: 0.5,
            optimizedAt: expect.any(String),
          },
        },
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);
      (assetCatalogService.updateAsset as jest.Mock).mockResolvedValue(
        optimizedAsset,
      );

      const result = await service.optimizeAsset('asset-123');

      expect(result.metadata).toHaveProperty('optimization');
      expect(result.metadata.optimization.status).toBe('optimized');
      expect(assetCatalogService.updateAsset).toHaveBeenCalledWith(
        'asset-123',
        expect.objectContaining({
          metadata: expect.objectContaining({
            optimization: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw NotFoundException if asset not found', async () => {
      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(null);

      await expect(service.optimizeAsset('invalid-asset')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle already optimized assets', async () => {
      const asset = {
        id: 'asset-123',
        key: 'avatars/fox/1.0.0/model.glb',
        fileSize: 1024000,
        metadata: {
          optimization: {
            status: 'optimized',
            optimizedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);
      (assetCatalogService.updateAsset as jest.Mock).mockResolvedValue(asset);

      const result = await service.optimizeAsset('asset-123');

      expect(result.metadata.optimization.status).toBe('optimized');
    });
  });

  describe('generateThumbnail', () => {
    it('should update asset with thumbnail key', async () => {
      const asset = {
        id: 'asset-123',
        key: 'avatars/fox/1.0.0/model.glb',
        thumbnailKey: null,
      };

      const updatedAsset = {
        ...asset,
        thumbnailKey: 'avatars/fox/1.0.0/thumbnail.png',
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);
      (assetCatalogService.updateAsset as jest.Mock).mockResolvedValue(
        updatedAsset,
      );

      const result = await service.generateThumbnail('asset-123');

      expect(result.thumbnailKey).toBe('avatars/fox/1.0.0/thumbnail.png');
      expect(assetCatalogService.updateAsset).toHaveBeenCalledWith(
        'asset-123',
        expect.objectContaining({
          thumbnailKey: expect.stringContaining('thumbnail.png'),
        }),
      );
    });

    it('should throw NotFoundException if asset not found', async () => {
      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(null);

      await expect(service.generateThumbnail('invalid-asset')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should skip if thumbnail already exists', async () => {
      const asset = {
        id: 'asset-123',
        key: 'avatars/fox/1.0.0/model.glb',
        thumbnailKey: 'avatars/fox/1.0.0/thumbnail.png',
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);

      const result = await service.generateThumbnail('asset-123');

      expect(result.thumbnailKey).toBe('avatars/fox/1.0.0/thumbnail.png');
      expect(assetCatalogService.updateAsset).not.toHaveBeenCalled();
    });
  });

  describe('getOptimizationStatus', () => {
    it('should return optimization status from metadata', async () => {
      const asset = {
        id: 'asset-123',
        metadata: {
          optimization: {
            status: 'optimized',
            originalSize: 2048000,
            optimizedSize: 1024000,
            compressionRatio: 0.5,
          },
        },
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);

      const result = await service.getOptimizationStatus('asset-123');

      expect(result.status).toBe('optimized');
      expect(result.compressionRatio).toBe(0.5);
    });

    it('should return pending if not optimized', async () => {
      const asset = {
        id: 'asset-123',
        metadata: null,
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(asset);

      const result = await service.getOptimizationStatus('asset-123');

      expect(result.status).toBe('pending');
    });

    it('should throw NotFoundException if asset not found', async () => {
      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getOptimizationStatus('invalid-asset'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      expect(service.calculateCompressionRatio(2048000, 1024000)).toBe(0.5);
      expect(service.calculateCompressionRatio(1000000, 500000)).toBe(0.5);
      expect(service.calculateCompressionRatio(1000000, 750000)).toBe(0.75);
    });

    it('should handle edge cases', () => {
      expect(service.calculateCompressionRatio(0, 0)).toBe(1);
      expect(service.calculateCompressionRatio(1000000, 0)).toBe(0);
    });
  });
});
