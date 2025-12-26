import { Test, TestingModule } from '@nestjs/testing';
import { AssetUploadService } from '../asset-upload.service.js';
import { S3Service } from '../s3.service.js';
import { AssetCatalogService } from '../../asset-catalog/asset-catalog.service.js';
import { GlbValidator } from '../validators/glb-validator.js';
import { GlbMetadataExtractor } from '../extractors/glb-metadata-extractor.js';
import { AssetType } from '../../asset-catalog/dto/asset-catalog.dto.js';
import { AssetUploadException } from '../exceptions/asset-exceptions.js';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-123'),
}));

describe('AssetUploadService', () => {
  let service: AssetUploadService;

  const mockS3Service = {
    uploadFile: jest.fn(),
    generateSignedUrl: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockAssetCatalogService = {
    createAsset: jest.fn(),
  };

  const mockGlbValidator = {
    validate: jest.fn(),
  };

  const mockMetadataExtractor = {
    extract: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetUploadService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: AssetCatalogService, useValue: mockAssetCatalogService },
        { provide: GlbValidator, useValue: mockGlbValidator },
        { provide: GlbMetadataExtractor, useValue: mockMetadataExtractor },
      ],
    }).compile();

    service = module.get<AssetUploadService>(AssetUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAsset', () => {
    it('should upload asset to structured path', async () => {
      const mockFile = {
        buffer: Buffer.from('mock glb data'),
        originalname: 'test-avatar.glb',
        mimetype: 'model/gltf-binary',
        size: 1024000,
      } as Express.Multer.File;

      const uploadOptions = {
        assetType: AssetType.AVATAR,
        category: 'humanoid',
        version: '1.0.0',
        name: 'Test Avatar',
        tags: ['male', 'casual'],
        uploadedBy: 'user-123',
      };

      const mockMetadata = {
        polygonCount: 10000,
        vertexCount: 5000,
        textureCount: 2,
      };

      const mockS3Result = {
        key: 'assets/avatar/humanoid/1.0.0/uuid-123.glb',
        bucket: 'test-bucket',
        url: 'https://test-bucket.s3.amazonaws.com/assets/avatar/humanoid/1.0.0/uuid-123.glb',
      };

      const mockCatalogEntry = {
        id: 'catalog-uuid',
        assetType: AssetType.AVATAR,
        name: 'Test Avatar',
        key: mockS3Result.key,
        category: 'humanoid',
        tags: ['male', 'casual'],
        version: '1.0.0',
        fileSize: 1024000,
        mimeType: 'model/gltf-binary',
        metadata: mockMetadata,
        uploadedBy: 'user-123',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGlbValidator.validate.mockReturnValue(true);
      mockMetadataExtractor.extract.mockReturnValue(mockMetadata);
      mockS3Service.uploadFile.mockResolvedValue(mockS3Result);
      mockAssetCatalogService.createAsset.mockResolvedValue(mockCatalogEntry);

      const result = await service.uploadAsset(mockFile, uploadOptions);

      expect(result).toEqual(mockCatalogEntry);
      expect(mockGlbValidator.validate).toHaveBeenCalledWith(mockFile.buffer);
      expect(mockMetadataExtractor.extract).toHaveBeenCalledWith(
        mockFile.buffer,
      );
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'assets/avatar/humanoid/1.0.0/uuid-123.glb',
      );
      expect(mockAssetCatalogService.createAsset).toHaveBeenCalled();
    });

    it('should validate GLB structure before upload', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid data'),
        originalname: 'invalid.glb',
        mimetype: 'model/gltf-binary',
        size: 1024,
      } as Express.Multer.File;

      const uploadOptions = {
        assetType: AssetType.AVATAR,
        category: 'humanoid',
        version: '1.0.0',
        name: 'Invalid File',
        tags: [],
        uploadedBy: 'user-123',
      };

      mockGlbValidator.validate.mockImplementation(() => {
        throw new Error('Invalid GLB structure');
      });

      await expect(
        service.uploadAsset(mockFile, uploadOptions),
      ).rejects.toThrow(AssetUploadException);

      expect(mockS3Service.uploadFile).not.toHaveBeenCalled();
      expect(mockAssetCatalogService.createAsset).not.toHaveBeenCalled();
    });

    it('should rollback catalog entry on S3 upload failure', async () => {
      const mockFile = {
        buffer: Buffer.from('mock glb data'),
        originalname: 'test.glb',
        mimetype: 'model/gltf-binary',
        size: 1024,
      } as Express.Multer.File;

      const uploadOptions = {
        assetType: AssetType.AVATAR,
        category: 'humanoid',
        version: '1.0.0',
        name: 'Test',
        tags: [],
        uploadedBy: 'user-123',
      };

      mockGlbValidator.validate.mockReturnValue(true);
      mockMetadataExtractor.extract.mockReturnValue({});
      mockS3Service.uploadFile.mockRejectedValue(new Error('S3 upload failed'));

      await expect(
        service.uploadAsset(mockFile, uploadOptions),
      ).rejects.toThrow(AssetUploadException);

      expect(mockAssetCatalogService.createAsset).not.toHaveBeenCalled();
    });

    it('should rollback S3 file on catalog entry failure', async () => {
      const mockFile = {
        buffer: Buffer.from('mock glb data'),
        originalname: 'test.glb',
        mimetype: 'model/gltf-binary',
        size: 1024,
      } as Express.Multer.File;

      const uploadOptions = {
        assetType: AssetType.AVATAR,
        category: 'humanoid',
        version: '1.0.0',
        name: 'Test',
        tags: [],
        uploadedBy: 'user-123',
      };

      const mockS3Result = {
        key: 'assets/avatar/humanoid/1.0.0/uuid-123.glb',
        bucket: 'test-bucket',
        url: 'https://test-bucket.s3.amazonaws.com/uuid-123.glb',
      };

      mockGlbValidator.validate.mockReturnValue(true);
      mockMetadataExtractor.extract.mockReturnValue({});
      mockS3Service.uploadFile.mockResolvedValue(mockS3Result);
      mockAssetCatalogService.createAsset.mockRejectedValue(
        new Error('Catalog creation failed'),
      );

      await expect(
        service.uploadAsset(mockFile, uploadOptions),
      ).rejects.toThrow('Catalog creation failed');

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(mockS3Result.key);
    });
  });
});
