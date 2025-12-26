/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AssetCatalogController } from '../asset-catalog.controller.js';
import { AssetCatalogService } from '../asset-catalog.service.js';
import { AssetType, AssetStatus } from '../dto/asset-catalog.dto.js';

describe('AssetCatalogController', () => {
  let controller: AssetCatalogController;
  let service: AssetCatalogService;

  const mockAssetCatalogService = {
    listAssets: jest.fn(),
    findAssetById: jest.fn(),
    createAsset: jest.fn(),
    updateAsset: jest.fn(),
    deprecateAsset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetCatalogController],
      providers: [
        {
          provide: AssetCatalogService,
          useValue: mockAssetCatalogService,
        },
      ],
    }).compile();

    controller = module.get<AssetCatalogController>(AssetCatalogController);
    service = module.get<AssetCatalogService>(AssetCatalogService);

    // Setup spies
    jest.spyOn(service, 'listAssets');
    jest.spyOn(service, 'findAssetById');
    jest.spyOn(service, 'createAsset');
    jest.spyOn(service, 'updateAsset');
    jest.spyOn(service, 'deprecateAsset');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /resources/catalog', () => {
    it('should list all assets', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          assetType: AssetType.AVATAR,
          name: 'Test Avatar',
          key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
          category: 'humanoid',
          tags: ['male'],
          version: '1.0.0',
          fileSize: 1024000,
          mimeType: 'model/gltf-binary',
          metadata: { polygonCount: 5000 },
          uploadedBy: 'user-123',
          status: AssetStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAssetCatalogService.listAssets.mockResolvedValue({
        items: mockAssets,
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await controller.listAssets({});

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(service.listAssets).toHaveBeenCalledWith({});
    });

    it('should filter assets by type', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          assetType: AssetType.AVATAR,
          name: 'Avatar',
          key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
          category: 'humanoid',
          tags: [],
          version: '1.0.0',
          fileSize: 1024,
          mimeType: 'model/gltf-binary',
          metadata: {},
          uploadedBy: 'user',
          status: AssetStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAssetCatalogService.listAssets.mockResolvedValue({
        items: mockAssets,
        total: 1,
        page: 1,
        limit: 10,
      });

      await controller.listAssets({ assetType: AssetType.AVATAR });

      expect(service.listAssets).toHaveBeenCalledWith({
        assetType: AssetType.AVATAR,
      });
    });

    it('should support pagination', async () => {
      mockAssetCatalogService.listAssets.mockResolvedValue({
        items: [],
        total: 50,
        page: 2,
        limit: 20,
      });

      const result = await controller.listAssets({ page: 2, limit: 20 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(service.listAssets).toHaveBeenCalledWith({ page: 2, limit: 20 });
    });
  });

  describe('GET /resources/catalog/:id', () => {
    it('should return asset by id', async () => {
      const mockAsset = {
        id: 'asset-1',
        assetType: AssetType.AVATAR,
        name: 'Test Avatar',
        key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
        category: 'humanoid',
        tags: ['male'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        metadata: { polygonCount: 5000 },
        uploadedBy: 'user-123',
        status: AssetStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAssetCatalogService.findAssetById.mockResolvedValue(mockAsset);

      const result = await controller.getAsset('asset-1');

      expect(result?.id).toBe('asset-1');
      expect(service.findAssetById).toHaveBeenCalledWith('asset-1');
    });

    it('should return null for invalid id', async () => {
      mockAssetCatalogService.findAssetById.mockResolvedValue(null);

      const result = await controller.getAsset('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('POST /resources/catalog', () => {
    it('should create asset metadata', async () => {
      const createDto = {
        assetType: AssetType.AVATAR,
        name: 'New Avatar',
        key: 'assets/avatar/humanoid/1.0.0/new-uuid.glb',
        category: 'humanoid',
        tags: ['female'],
        version: '1.0.0',
        fileSize: 2048000,
        mimeType: 'model/gltf-binary',
        metadata: { polygonCount: 10000 },
        uploadedBy: 'admin',
      };

      const mockCreatedAsset = {
        id: 'new-asset-id',
        ...createDto,
        status: AssetStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAssetCatalogService.createAsset.mockResolvedValue(mockCreatedAsset);

      const result = await controller.createAsset(createDto);

      expect(result.id).toBe('new-asset-id');
      expect(result.name).toBe('New Avatar');
      expect(service.createAsset).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PATCH /resources/catalog/:id', () => {
    it('should update asset metadata', async () => {
      const updateDto = {
        name: 'Updated Avatar Name',
        tags: ['male', 'formal'],
      };

      const mockUpdatedAsset = {
        id: 'asset-1',
        assetType: AssetType.AVATAR,
        name: 'Updated Avatar Name',
        key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
        category: 'humanoid',
        tags: ['male', 'formal'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        metadata: {},
        uploadedBy: 'user',
        status: AssetStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAssetCatalogService.updateAsset.mockResolvedValue(mockUpdatedAsset);

      const result = await controller.updateAsset('asset-1', updateDto);

      expect(result.name).toBe('Updated Avatar Name');
      expect(result.tags).toContain('formal');
      expect(service.updateAsset).toHaveBeenCalledWith('asset-1', updateDto);
    });
  });

  describe('DELETE /resources/catalog/:id', () => {
    it('should deprecate asset', async () => {
      const mockDeprecatedAsset = {
        id: 'asset-1',
        assetType: AssetType.AVATAR,
        name: 'Test Avatar',
        key: 'assets/avatar/humanoid/1.0.0/uuid-1.glb',
        category: 'humanoid',
        tags: [],
        version: '1.0.0',
        fileSize: 1024,
        mimeType: 'model/gltf-binary',
        metadata: {},
        uploadedBy: 'user',
        status: AssetStatus.DEPRECATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAssetCatalogService.deprecateAsset.mockResolvedValue(
        mockDeprecatedAsset,
      );

      const result = await controller.deprecateAsset('asset-1');

      expect(result.status).toBe(AssetStatus.DEPRECATED);
      expect(service.deprecateAsset).toHaveBeenCalledWith('asset-1');
    });
  });
});
