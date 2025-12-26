import { Injectable } from '@nestjs/common';
import { InvalidGlbStructureException } from '../exceptions/asset-exceptions.js';

/**
 * Validator for GLB (GL Transmission Format Binary) files
 * GLB file structure:
 * - 12-byte header: magic (4 bytes), version (4 bytes), length (4 bytes)
 * - Chunks: JSON chunk, BIN chunk (optional)
 */
@Injectable()
export class GlbValidator {
  private readonly GLB_MAGIC = 0x46546c67; // 'glTF' in hex
  private readonly GLB_VERSION = 2;
  private readonly MIN_GLB_SIZE = 12; // Minimum size for header

  /**
   * Validate GLB file structure
   */
  validate(buffer: Buffer): boolean {
    if (buffer.length < this.MIN_GLB_SIZE) {
      throw new InvalidGlbStructureException('file too small');
    }

    // Read header
    const magic = buffer.readUInt32LE(0);
    const version = buffer.readUInt32LE(4);
    const length = buffer.readUInt32LE(8);

    // Validate magic number
    if (magic !== this.GLB_MAGIC) {
      throw new InvalidGlbStructureException('incorrect magic number');
    }

    // Validate version
    if (version !== this.GLB_VERSION) {
      throw new InvalidGlbStructureException('unsupported version');
    }

    // Validate length
    if (length > buffer.length) {
      throw new InvalidGlbStructureException(
        'declared length exceeds actual size',
      );
    }

    return true;
  }
}
