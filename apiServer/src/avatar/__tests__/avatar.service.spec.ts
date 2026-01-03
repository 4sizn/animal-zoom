/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { AvatarService } from '../avatar.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { AssetCatalogService } from '../../asset-catalog/asset-catalog.service.js';
import { NotFoundException } from '@nestjs/common';

describe('AvatarService', () => {
  let service: AvatarService;
  let dbService: jest.Mocked<DatabaseService>;
  let assetCatalogService: jest.Mocked<AssetCatalogService>;

  beforeEach(async () => {
    const mockDbService = {
      db: {
        selectFrom: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        executeTakeFirst: jest.fn(),
        updateTable: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      },
    };

    const mockAssetCatalogService = {
      findAssetById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
        {
          provide: AssetCatalogService,
          useValue: mockAssetCatalogService,
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
    dbService = module.get(DatabaseService);
    assetCatalogService = module.get(AssetCatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyAvatar', () => {
    it('should return default config if user has no customization', async () => {
      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        avatarCustomization: null,
      });

      const result = await service.getMyAvatar('user-123');

      expect(result).toEqual({
        modelUrl: null,
        modelAssetId: null,
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      });
    });

    it('should return user avatar config', async () => {
      const customConfig = {
        modelUrl: '/models/fox.glb',
        modelAssetId: null,
        primaryColor: '#ff0000',
        secondaryColor: '#00ff00',
        accessories: ['hat', 'glasses'],
      };

      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        avatarCustomization: customConfig,
      });

      const result = await service.getMyAvatar('user-123');

      expect(result).toEqual(customConfig);
    });

    it('should throw NotFoundException if user not found', async () => {
      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getMyAvatar('invalid-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMyAvatar', () => {
    it('should update avatar config', async () => {
      const currentConfig = {
        modelUrl: null,
        modelAssetId: null,
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        avatarCustomization: currentConfig,
      });
      (dbService.db.execute as jest.Mock).mockResolvedValue(undefined);

      const updateDto = {
        primaryColor: '#ff0000',
      };

      const result = await service.updateMyAvatar('user-123', updateDto);

      expect(result).toEqual({
        ...currentConfig,
        primaryColor: '#ff0000',
      });
      expect(dbService.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarCustomization: expect.objectContaining({
            primaryColor: '#ff0000',
          }),
        }),
      );
    });

    it('should merge updates with existing config', async () => {
      const currentConfig = {
        modelUrl: '/models/fox.glb',
        modelAssetId: null,
        primaryColor: '#ff0000',
        secondaryColor: '#00ff00',
        accessories: ['hat'],
      };

      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        avatarCustomization: currentConfig,
      });
      (dbService.db.execute as jest.Mock).mockResolvedValue(undefined);

      const updateDto = {
        accessories: ['hat', 'glasses'],
      };

      const result = await service.updateMyAvatar('user-123', updateDto);

      expect(result.modelUrl).toBe('/models/fox.glb');
      expect(result.primaryColor).toBe('#ff0000');
      expect(result.accessories).toEqual(['hat', 'glasses']);
    });
  });

  describe('getAvatarByUserId', () => {
    it('should return avatar for specified user', async () => {
      const customConfig = {
        modelUrl: '/models/fox.glb',
        modelAssetId: null,
        primaryColor: '#ff0000',
        secondaryColor: '#00ff00',
        accessories: [],
      };

      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        avatarCustomization: customConfig,
      });

      const result = await service.getAvatarByUserId('other-user');

      expect(result).toEqual(customConfig);
    });
  });

  describe('resolveModelUrl', () => {
    it('should resolve asset ID to key from asset catalog', async () => {
      const config = {
        modelUrl: null,
        modelAssetId: 'asset-123',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue({
        id: 'asset-123',
        key: 'avatars/fox/1.0.0/model.glb',
        name: 'Fox Model',
      });

      const result = await service.resolveModelUrl(config);

      expect(result).toBe('avatars/fox/1.0.0/model.glb');
      expect(assetCatalogService.findAssetById).toHaveBeenCalledWith(
        'asset-123',
      );
    });

    it('should fallback to modelUrl if asset ID not found', async () => {
      const config = {
        modelUrl: '/models/fallback.glb',
        modelAssetId: 'invalid-asset',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      (assetCatalogService.findAssetById as jest.Mock).mockResolvedValue(null);

      const result = await service.resolveModelUrl(config);

      expect(result).toBe('/models/fallback.glb');
    });

    it('should fallback to modelUrl if asset catalog throws error', async () => {
      const config = {
        modelUrl: '/models/fallback.glb',
        modelAssetId: 'asset-123',
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      (assetCatalogService.findAssetById as jest.Mock).mockRejectedValue(
        new Error('Service unavailable'),
      );

      const result = await service.resolveModelUrl(config);

      expect(result).toBe('/models/fallback.glb');
    });

    it('should return null if neither asset ID nor modelUrl exists', async () => {
      const config = {
        modelUrl: null,
        modelAssetId: null,
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      const result = await service.resolveModelUrl(config);

      expect(result).toBeNull();
      expect(assetCatalogService.findAssetById).not.toHaveBeenCalled();
    });

    it('should use modelUrl if no asset ID provided', async () => {
      const config = {
        modelUrl: '/models/direct.glb',
        modelAssetId: null,
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      };

      const result = await service.resolveModelUrl(config);

      expect(result).toBe('/models/direct.glb');
      expect(assetCatalogService.findAssetById).not.toHaveBeenCalled();
    });
  });
});
