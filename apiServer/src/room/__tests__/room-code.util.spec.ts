import { generateRoomCode, isValidRoomCode } from '../room-code.util.js';

describe('Room Code Utilities', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should generate uppercase alphanumeric code', () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      // With 36^6 possibilities, 100 codes should all be unique
      expect(codes.size).toBe(100);
    });
  });

  describe('isValidRoomCode', () => {
    it('should validate correct room codes', () => {
      expect(isValidRoomCode('ABC123')).toBe(true);
      expect(isValidRoomCode('XYZABC')).toBe(true);
      expect(isValidRoomCode('123456')).toBe(true);
    });

    it('should reject invalid room codes', () => {
      expect(isValidRoomCode('abc123')).toBe(false); // lowercase
      expect(isValidRoomCode('ABC')).toBe(false); // too short
      expect(isValidRoomCode('ABCD1234')).toBe(false); // too long
      expect(isValidRoomCode('ABC-12')).toBe(false); // special chars
      expect(isValidRoomCode('')).toBe(false); // empty
    });
  });
});
