import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  JoinRoomEventDto,
  ChatMessageDto,
  SyncStateDto,
} from '../dto/room-events.dto.js';

describe('Room Events DTOs', () => {
  describe('JoinRoomEventDto', () => {
    it('should validate correct data', async () => {
      const dto = plainToInstance(JoinRoomEventDto, {
        roomCode: 'ABC123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty roomCode', async () => {
      const dto = plainToInstance(JoinRoomEventDto, {
        roomCode: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ChatMessageDto', () => {
    it('should validate correct chat message', async () => {
      const dto = plainToInstance(ChatMessageDto, {
        roomCode: 'ABC123',
        message: 'Hello world',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject empty message', async () => {
      const dto = plainToInstance(ChatMessageDto, {
        roomCode: 'ABC123',
        message: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SyncStateDto', () => {
    it('should validate with position and rotation', async () => {
      const dto = plainToInstance(SyncStateDto, {
        roomCode: 'ABC123',
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with optional fields', async () => {
      const dto = plainToInstance(SyncStateDto, {
        roomCode: 'ABC123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
