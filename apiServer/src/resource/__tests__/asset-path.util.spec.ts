import {
  generateAssetPath,
  getFileExtension,
  parseAssetPath,
} from '../utils/asset-path.util.js';
import { AssetType } from '../../asset-catalog/dto/asset-catalog.dto.js';

describe('Asset Path Utilities', () => {
  describe('generateAssetPath', () => {
    it('should generate structured asset path for avatar', () => {
      const path = generateAssetPath(
        AssetType.AVATAR,
        'humanoid',
        '1.0.0',
        'test-id',
        '.glb',
      );

      expect(path).toBe('assets/avatar/humanoid/1.0.0/test-id.glb');
    });

    it('should generate structured asset path for texture', () => {
      const path = generateAssetPath(
        AssetType.TEXTURE,
        'skin',
        '2.1.0',
        'texture-id',
        '.png',
      );

      expect(path).toBe('assets/texture/skin/2.1.0/texture-id.png');
    });

    it('should handle different versions', () => {
      const path = generateAssetPath(
        AssetType.AVATAR,
        'animal',
        '10.5.3',
        'uuid-abc',
        '.glb',
      );

      expect(path).toBe('assets/avatar/animal/10.5.3/uuid-abc.glb');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(getFileExtension('model.glb')).toBe('.glb');
      expect(getFileExtension('texture.png')).toBe('.png');
      expect(getFileExtension('file.tar.gz')).toBe('.gz');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('noextension')).toBe('');
    });

    it('should handle filenames with multiple dots', () => {
      expect(getFileExtension('my.file.name.txt')).toBe('.txt');
    });
  });

  describe('parseAssetPath', () => {
    it('should parse valid asset path', () => {
      const result = parseAssetPath(
        'assets/avatar/humanoid/1.0.0/uuid-123.glb',
      );

      expect(result).toEqual({
        assetType: 'avatar',
        category: 'humanoid',
        version: '1.0.0',
        id: 'uuid-123',
        extension: '.glb',
      });
    });

    it('should parse path without extension', () => {
      const result = parseAssetPath('assets/texture/skin/2.0.0/texture-id');

      expect(result).toEqual({
        assetType: 'texture',
        category: 'skin',
        version: '2.0.0',
        id: 'texture-id',
        extension: '',
      });
    });

    it('should return null for invalid path format', () => {
      expect(parseAssetPath('invalid/path')).toBeNull();
      expect(parseAssetPath('assets/avatar/file.glb')).toBeNull();
      expect(parseAssetPath('')).toBeNull();
    });

    it('should handle paths with complex IDs', () => {
      const result = parseAssetPath(
        'assets/avatar/humanoid/1.0.0/550e8400-e29b-41d4-a716-446655440000.glb',
      );

      expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});
