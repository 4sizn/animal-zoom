/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { RoomConfigService } from '../room-config.service';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { LightingPreset } from '../dto/update-room-config.dto';

describe('RoomConfigService', () => {
  let service: RoomConfigService;
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
        RoomConfigService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<RoomConfigService>(RoomConfigService);
    dbService = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoomConfig', () => {
    it('should return default config if room has no customization', async () => {
      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        id: 'room-1',
        customization: null,
      });

      const result = await service.getRoomConfig('ABC123');

      expect(result).toEqual({
        lightingPreset: LightingPreset.DEFAULT,
        floorColor: '#8B4513',
        wallColor: '#ffffff',
        furniture: [],
        decorations: [],
      });
    });

    it('should return room config', async () => {
      const customConfig = {
        lightingPreset: LightingPreset.BRIGHT,
        floorColor: '#8B4513',
        wallColor: '#f0f0f0',
        furniture: ['desk', 'chair'],
        decorations: ['plant'],
      };

      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue({
        id: 'room-1',
        customization: customConfig,
      });

      const result = await service.getRoomConfig('ABC123');

      expect(result).toEqual(customConfig);
    });

    it('should throw NotFoundException if room not found', async () => {
      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(service.getRoomConfig('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRoomConfig', () => {
    it('should update room config when user is host', async () => {
      const currentConfig = {
        lightingPreset: LightingPreset.DEFAULT,
        floorColor: '#8B4513',
        wallColor: '#ffffff',
        furniture: [],
        decorations: [],
      };

      // First call: get room
      // Second call: check participant role
      // Third call: get current config
      (dbService.db.executeTakeFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: 'room-1',
          customization: currentConfig,
        })
        .mockResolvedValueOnce({
          role: 'host',
        })
        .mockResolvedValueOnce({
          id: 'room-1',
          customization: currentConfig,
        });

      (dbService.db.execute as jest.Mock).mockResolvedValue(undefined);

      const updateDto = {
        lightingPreset: LightingPreset.BRIGHT,
      };

      const result = await service.updateRoomConfig(
        'ABC123',
        'user-123',
        updateDto,
      );

      expect(result.lightingPreset).toBe(LightingPreset.BRIGHT);
      expect(dbService.db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          customization: expect.objectContaining({
            lightingPreset: LightingPreset.BRIGHT,
          }),
        }),
      );
    });

    it('should throw ForbiddenException if user is not host', async () => {
      (dbService.db.executeTakeFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: 'room-1',
          customization: null,
        })
        .mockResolvedValueOnce({
          role: 'participant',
        });

      await expect(
        service.updateRoomConfig('ABC123', 'user-123', {
          lightingPreset: LightingPreset.BRIGHT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if room not found', async () => {
      (dbService.db.executeTakeFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.updateRoomConfig('INVALID', 'user-123', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should merge updates with existing config', async () => {
      const currentConfig = {
        lightingPreset: LightingPreset.BRIGHT,
        floorColor: '#8B4513',
        wallColor: '#ffffff',
        furniture: ['desk'],
        decorations: [],
      };

      (dbService.db.executeTakeFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: 'room-1',
          customization: currentConfig,
        })
        .mockResolvedValueOnce({
          role: 'host',
        })
        .mockResolvedValueOnce({
          id: 'room-1',
          customization: currentConfig,
        });

      (dbService.db.execute as jest.Mock).mockResolvedValue(undefined);

      const updateDto = {
        furniture: ['desk', 'chair'],
      };

      const result = await service.updateRoomConfig(
        'ABC123',
        'user-123',
        updateDto,
      );

      expect(result.lightingPreset).toBe(LightingPreset.BRIGHT);
      expect(result.furniture).toEqual(['desk', 'chair']);
    });
  });
});
