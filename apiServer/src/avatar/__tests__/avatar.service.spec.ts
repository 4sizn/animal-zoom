/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { AvatarService } from '../avatar.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { NotFoundException } from '@nestjs/common';

describe('AvatarService', () => {
  let service: AvatarService;
  let dbService: jest.Mocked<DatabaseService>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
    dbService = module.get(DatabaseService);
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
        primaryColor: '#ffffff',
        secondaryColor: '#000000',
        accessories: [],
      });
    });

    it('should return user avatar config', async () => {
      const customConfig = {
        modelUrl: '/models/fox.glb',
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
});
