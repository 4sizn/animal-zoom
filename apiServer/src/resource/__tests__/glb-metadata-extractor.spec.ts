import { GlbMetadataExtractor } from '../extractors/glb-metadata-extractor.js';
import { InvalidGlbStructureException } from '../exceptions/asset-exceptions.js';

describe('GlbMetadataExtractor', () => {
  let extractor: GlbMetadataExtractor;

  beforeEach(() => {
    extractor = new GlbMetadataExtractor();
  });

  describe('extract', () => {
    it('should extract metadata from valid GLB file', () => {
      // Create a minimal GLB structure
      // GLB = 12-byte header + JSON chunk + BIN chunk
      const glbHeader = Buffer.alloc(12);
      glbHeader.write('glTF', 0, 'ascii');
      glbHeader.writeUInt32LE(2, 4);
      glbHeader.writeUInt32LE(200, 8);

      const gltfJson = {
        asset: { version: '2.0' },
        meshes: [
          {
            primitives: [
              {
                attributes: {
                  POSITION: 0,
                  NORMAL: 1,
                },
              },
            ],
          },
        ],
        accessors: [
          { count: 1000 }, // POSITION accessor
          { count: 1000 }, // NORMAL accessor
        ],
        images: [{ name: 'texture1' }, { name: 'texture2' }],
      };

      const jsonString = JSON.stringify(gltfJson);
      const jsonBuffer = Buffer.from(jsonString);
      const jsonLength = jsonBuffer.length;

      // JSON chunk header: length + type (JSON = 0x4E4F534A)
      const jsonChunkHeader = Buffer.alloc(8);
      jsonChunkHeader.writeUInt32LE(jsonLength, 0);
      jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

      const mockGlbData = Buffer.concat([
        glbHeader,
        jsonChunkHeader,
        jsonBuffer,
      ]);

      const metadata = extractor.extract(mockGlbData);

      expect(metadata).toHaveProperty('vertexCount');
      expect(metadata).toHaveProperty('meshCount');
      expect(metadata).toHaveProperty('textureCount');
      expect(metadata.meshCount).toBe(1);
      expect(metadata.textureCount).toBe(2);
    });

    it('should handle GLB file without textures', () => {
      const glbHeader = Buffer.alloc(12);
      glbHeader.write('glTF', 0, 'ascii');
      glbHeader.writeUInt32LE(2, 4);
      glbHeader.writeUInt32LE(150, 8);

      const gltfJson = {
        asset: { version: '2.0' },
        meshes: [
          {
            primitives: [
              {
                attributes: {
                  POSITION: 0,
                },
              },
            ],
          },
        ],
        accessors: [{ count: 500 }],
      };

      const jsonString = JSON.stringify(gltfJson);
      const jsonBuffer = Buffer.from(jsonString);
      const jsonLength = jsonBuffer.length;

      const jsonChunkHeader = Buffer.alloc(8);
      jsonChunkHeader.writeUInt32LE(jsonLength, 0);
      jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

      const mockGlbData = Buffer.concat([
        glbHeader,
        jsonChunkHeader,
        jsonBuffer,
      ]);

      const metadata = extractor.extract(mockGlbData);

      expect(metadata.textureCount).toBe(0);
      expect(metadata.meshCount).toBe(1);
    });

    it('should throw error for invalid GLB structure', () => {
      const invalidData = Buffer.from('invalid glb data');

      expect(() => extractor.extract(invalidData)).toThrow(
        InvalidGlbStructureException,
      );
    });

    it('should handle minimal GLB file', () => {
      const glbHeader = Buffer.alloc(12);
      glbHeader.write('glTF', 0, 'ascii');
      glbHeader.writeUInt32LE(2, 4);
      glbHeader.writeUInt32LE(100, 8);

      const gltfJson = {
        asset: { version: '2.0' },
      };

      const jsonString = JSON.stringify(gltfJson);
      const jsonBuffer = Buffer.from(jsonString);
      const jsonLength = jsonBuffer.length;

      const jsonChunkHeader = Buffer.alloc(8);
      jsonChunkHeader.writeUInt32LE(jsonLength, 0);
      jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

      const mockGlbData = Buffer.concat([
        glbHeader,
        jsonChunkHeader,
        jsonBuffer,
      ]);

      const metadata = extractor.extract(mockGlbData);

      expect(metadata.meshCount).toBe(0);
      expect(metadata.textureCount).toBe(0);
      expect(metadata.vertexCount).toBe(0);
    });
  });
});
