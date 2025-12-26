import { Test, TestingModule } from '@nestjs/testing';
import { AssetCatalogService } from '../asset-catalog.service';
import { DatabaseService } from '../../database/database.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetFilterDto,
} from '../dto/asset-catalog.dto';
import { AssetType, AssetStatus } from '../dto/asset-catalog.dto';

describe('AssetCatalogService', () => {
  let service: AssetCatalogService;

  const mockDb = {
    insertInto: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    returningAll: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    executeTakeFirst: jest.fn(),
    selectFrom: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    updateTable: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    deleteFrom: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  };

  const mockDatabaseService = {
    db: mockDb,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetCatalogService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AssetCatalogService>(AssetCatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAsset', () => {
    it('should create asset metadata entry', async () => {
      const createAssetDto: CreateAssetDto = {
        assetType: AssetType.AVATAR,
        name: 'Test Avatar',
        key: 'assets/avatars/humanoid/v1/test-uuid.glb',
        category: 'humanoid',
        tags: ['male', 'casual'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        thumbnailKey: null,
        metadata: { polygonCount: 10000 },
        uploadedBy: 'user-123',
      };

      const mockAsset = {
        id: 'asset-uuid',
        ...createAssetDto,
        status: AssetStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use mockDb directly
      // First call for checkVersionConflict (should return null)
      // Second call for insert (should return mockAsset)
      mockDb.executeTakeFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockAsset);

      const result = await service.createAsset(createAssetDto);

      expect(result).toEqual(mockAsset);
      expect(mockDb.insertInto).toHaveBeenCalledWith('asset_catalog');
    });
  });

  describe('listAssets', () => {
    it('should list assets with filters (type, category, tags)', async () => {
      const filterDto: AssetFilterDto = {
        assetType: AssetType.AVATAR,
        category: 'humanoid',
        tags: ['male'],
        status: AssetStatus.ACTIVE,
        limit: 10,
        offset: 0,
      };

      const mockAssets = [
        {
          id: 'asset-1',
          assetType: AssetType.AVATAR,
          name: 'Avatar 1',
          key: 'assets/avatars/humanoid/v1/uuid1.glb',
          category: 'humanoid',
          tags: ['male', 'casual'],
          version: '1.0.0',
          status: AssetStatus.ACTIVE,
        },
      ];

      // Use mockDb directly
      mockDb.execute.mockResolvedValue(mockAssets);

      const result = await service.listAssets(filterDto);

      expect(result).toEqual(mockAssets);
      expect(mockDb.selectFrom).toHaveBeenCalledWith('asset_catalog');
    });
  });

  describe('findAssetById', () => {
    it('should find asset by ID', async () => {
      const assetId = 'asset-uuid';
      const mockAsset = {
        id: assetId,
        assetType: AssetType.AVATAR,
        name: 'Test Avatar',
        status: AssetStatus.ACTIVE,
      };

      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(mockAsset);

      const result = await service.findAssetById(assetId);

      expect(result).toEqual(mockAsset);
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', assetId);
    });

    it('should return null if asset not found', async () => {
      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(null);

      const result = await service.findAssetById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateAsset', () => {
    it('should update asset metadata', async () => {
      const assetId = 'asset-uuid';
      const updateDto: UpdateAssetDto = {
        name: 'Updated Avatar',
        tags: ['male', 'formal'],
        metadata: { polygonCount: 15000 },
      };

      const mockUpdatedAsset = {
        id: assetId,
        ...updateDto,
        updatedAt: new Date(),
      };

      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(mockUpdatedAsset);

      const result = await service.updateAsset(assetId, updateDto);

      expect(result).toEqual(mockUpdatedAsset);
      expect(mockDb.updateTable).toHaveBeenCalledWith('asset_catalog');
      expect(mockDb.where).toHaveBeenCalledWith('id', '=', assetId);
    });
  });

  describe('deprecateAsset', () => {
    it('should mark asset as deprecated', async () => {
      const assetId = 'asset-uuid';
      const mockDeprecatedAsset = {
        id: assetId,
        status: AssetStatus.DEPRECATED,
        updatedAt: new Date(),
      };

      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(mockDeprecatedAsset);

      const result = await service.deprecateAsset(assetId);

      expect(result).toEqual(mockDeprecatedAsset);
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AssetStatus.DEPRECATED,
          updatedAt: expect.anything(),
        }),
      );
    });
  });

  describe('handleVersionConflicts', () => {
    it('should handle version conflicts', async () => {
      const key = 'assets/avatars/humanoid/v1/uuid.glb';
      const version = '1.0.0';

      const mockExistingAsset = {
        id: 'existing-asset',
        key,
        version,
        status: AssetStatus.ACTIVE,
      };

      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(mockExistingAsset);

      await expect(service.checkVersionConflict(key, version)).rejects.toThrow(
        'Version conflict',
      );
    });

    it('should allow same key with different version', async () => {
      const key = 'assets/avatars/humanoid/v1/uuid.glb';
      const newVersion = '1.1.0';

      // Use mockDb directly
      mockDb.executeTakeFirst.mockResolvedValue(null);

      await expect(
        service.checkVersionConflict(key, newVersion),
      ).resolves.not.toThrow();
    });
  });

  describe('validateAssetMetadata', () => {
    it('should validate asset metadata', () => {
      const validDto: CreateAssetDto = {
        assetType: AssetType.AVATAR,
        name: 'Valid Avatar',
        key: 'assets/avatars/humanoid/v1/uuid.glb',
        category: 'humanoid',
        tags: ['male'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        thumbnailKey: null,
        metadata: {},
        uploadedBy: 'user-123',
      };

      expect(() => service.validateMetadata(validDto)).not.toThrow();
    });

    it('should reject invalid asset type', () => {
      const invalidDto = {
        assetType: 'INVALID_TYPE',
        name: 'Invalid Avatar',
      } as any;

      expect(() => service.validateMetadata(invalidDto)).toThrow(
        'Invalid asset type',
      );
    });

    it('should reject empty name', () => {
      const invalidDto = {
        assetType: AssetType.AVATAR,
        name: '',
      } as any;

      expect(() => service.validateMetadata(invalidDto)).toThrow(
        'Name is required',
      );
    });

    it('should reject invalid version format', () => {
      const invalidDto = {
        assetType: AssetType.AVATAR,
        name: 'Test',
        version: 'invalid-version',
      } as any;

      expect(() => service.validateMetadata(invalidDto)).toThrow(
        'Invalid version format',
      );
    });
  });
});
