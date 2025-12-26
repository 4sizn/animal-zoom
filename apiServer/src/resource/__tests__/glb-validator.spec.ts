import { GlbValidator } from '../validators/glb-validator.js';
import { InvalidGlbStructureException } from '../exceptions/asset-exceptions.js';

describe('GlbValidator', () => {
  let validator: GlbValidator;

  beforeEach(() => {
    validator = new GlbValidator();
  });

  describe('validate', () => {
    it('should validate correct GLB file structure', () => {
      // GLB header: magic (glTF), version (2), length
      const glbHeader = Buffer.alloc(12);
      const mockChunkData = Buffer.alloc(100);
      const totalLength = glbHeader.length + mockChunkData.length;

      glbHeader.write('glTF', 0, 'ascii'); // Magic
      glbHeader.writeUInt32LE(2, 4); // Version
      glbHeader.writeUInt32LE(totalLength, 8); // Total length

      const mockGlbData = Buffer.concat([glbHeader, mockChunkData]);

      expect(validator.validate(mockGlbData)).toBe(true);
    });

    it('should reject file with invalid magic number', () => {
      const invalidHeader = Buffer.alloc(12);
      invalidHeader.write('INVALID', 0, 'ascii');
      invalidHeader.writeUInt32LE(2, 4);
      invalidHeader.writeUInt32LE(1000, 8);

      expect(() => validator.validate(invalidHeader)).toThrow(
        InvalidGlbStructureException,
      );
    });

    it('should reject file with unsupported version', () => {
      const invalidHeader = Buffer.alloc(12);
      invalidHeader.write('glTF', 0, 'ascii');
      invalidHeader.writeUInt32LE(1, 4); // Version 1
      invalidHeader.writeUInt32LE(1000, 8);

      expect(() => validator.validate(invalidHeader)).toThrow(
        InvalidGlbStructureException,
      );
    });

    it('should reject file that is too small', () => {
      const tooSmall = Buffer.alloc(8);

      expect(() => validator.validate(tooSmall)).toThrow(
        InvalidGlbStructureException,
      );
    });

    it('should reject empty buffer', () => {
      const empty = Buffer.alloc(0);

      expect(() => validator.validate(empty)).toThrow(
        InvalidGlbStructureException,
      );
    });
  });
});
