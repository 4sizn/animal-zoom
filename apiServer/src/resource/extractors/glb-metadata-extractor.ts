import { Injectable } from '@nestjs/common';
import { InvalidGlbStructureException } from '../exceptions/asset-exceptions.js';

export interface GlbMetadata {
  vertexCount: number;
  meshCount: number;
  textureCount: number;
  materialCount?: number;
  animationCount?: number;
  [key: string]: unknown;
}

/**
 * Extractor for GLB file metadata
 * Parses the JSON chunk to extract useful information about the 3D model
 */
@Injectable()
export class GlbMetadataExtractor {
  private readonly JSON_CHUNK_TYPE = 0x4e4f534a; // 'JSON' in hex

  /**
   * Extract metadata from GLB file
   */
  extract(buffer: Buffer): GlbMetadata {
    try {
      // Skip 12-byte header
      let offset = 12;

      // Read JSON chunk header (8 bytes: length + type)
      const chunkLength = buffer.readUInt32LE(offset);
      const chunkType = buffer.readUInt32LE(offset + 4);
      offset += 8;

      if (chunkType !== this.JSON_CHUNK_TYPE) {
        throw new InvalidGlbStructureException('JSON chunk not found');
      }

      // Read JSON data
      const jsonData = buffer
        .slice(offset, offset + chunkLength)
        .toString('utf8');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const gltf = JSON.parse(jsonData);

      // Extract metadata
      const metadata: GlbMetadata = {
        vertexCount: 0,
        meshCount: 0,
        textureCount: 0,
        materialCount: 0,
        animationCount: 0,
      };

      // Count meshes
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (gltf.meshes) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metadata.meshCount = gltf.meshes.length;
      }

      // Count vertices from accessors
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (gltf.accessors) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        metadata.vertexCount = gltf.accessors.reduce(
          (total: number, accessor: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return total + (accessor.count || 0);
          },
          0,
        );
      }

      // Count textures/images
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (gltf.images) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metadata.textureCount = gltf.images.length;
      }

      // Count materials
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (gltf.materials) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metadata.materialCount = gltf.materials.length;
      }

      // Count animations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (gltf.animations) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        metadata.animationCount = gltf.animations.length;
      }

      return metadata;
    } catch (error) {
      if (error instanceof InvalidGlbStructureException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InvalidGlbStructureException(
        `metadata extraction failed: ${errorMessage}`,
      );
    }
  }
}
