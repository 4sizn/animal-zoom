/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from '../resource.service.js';
import { S3Service } from '../s3.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('ResourceService', () => {
  let service: ResourceService;
  let s3Service: jest.Mocked<S3Service>;

  beforeEach(async () => {
    const mockS3Service = {
      listObjects: jest.fn(),
      generateSignedUrl: jest.fn(),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getBucketName: jest.fn().mockReturnValue('test-bucket'),
      getRegion: jest.fn().mockReturnValue('us-east-1'),
      generatePublicUrl: jest.fn((key: string) => `https://test-bucket.s3.us-east-1.amazonaws.com/${key}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    s3Service = module.get(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should accept valid GLB file', () => {
      const file = {
        originalname: 'model.glb',
        mimetype: 'model/gltf-binary',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).not.toThrow();
    });

    it('should reject file exceeding max size', () => {
      const file = {
        originalname: 'model.glb',
        mimetype: 'model/gltf-binary',
        size: 51 * 1024 * 1024, // 51MB
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it('should reject non-GLB file', () => {
      const file = {
        originalname: 'model.obj',
        mimetype: 'application/octet-stream',
        size: 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).toThrow(BadRequestException);
    });

    it('should accept GLB file with generic MIME type', () => {
      const file = {
        originalname: 'model.glb',
        mimetype: 'application/octet-stream',
        size: 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(file)).not.toThrow();
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of models', async () => {
      const mockObjects = [
        {
          key: 'models/uuid-1.glb',
          lastModified: new Date(),
          size: 1024,
        },
        {
          key: 'models/uuid-2.glb',
          lastModified: new Date(),
          size: 2048,
        },
      ];

      s3Service.listObjects.mockResolvedValue(mockObjects);

      const result = await service.getAvailableModels();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('uuid-1');
      expect(result[0].name).toBe('uuid-1.glb');
      expect(result[1].id).toBe('uuid-2');
    });

    it('should filter non-GLB files', async () => {
      const mockObjects = [
        {
          key: 'models/uuid-1.glb',
          lastModified: new Date(),
          size: 1024,
        },
        {
          key: 'models/thumbnail.png',
          lastModified: new Date(),
          size: 512,
        },
      ];

      s3Service.listObjects.mockResolvedValue(mockObjects);

      const result = await service.getAvailableModels();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
    });

    it('should return empty array when no models exist', async () => {
      s3Service.listObjects.mockResolvedValue([]);

      const result = await service.getAvailableModels();

      expect(result).toEqual([]);
    });
  });

  describe('getModelUrl', () => {
    it('should return presigned URL for existing model', async () => {
      const mockObjects = [
        {
          key: 'models/uuid-1.glb',
          lastModified: new Date(),
          size: 1024,
        },
      ];

      s3Service.listObjects.mockResolvedValue(mockObjects);
      s3Service.generateSignedUrl.mockResolvedValue(
        'https://presigned-url.com',
      );

      const result = await service.getModelUrl('uuid-1');

      expect(result).toBe('https://presigned-url.com');
      expect(s3Service.generateSignedUrl).toHaveBeenCalledWith(
        'models/uuid-1.glb',
        3600,
      );
    });

    it('should throw NotFoundException for non-existent model', async () => {
      s3Service.listObjects.mockResolvedValue([]);

      await expect(service.getModelUrl('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadModel', () => {
    it('should upload valid model', async () => {
      const file = {
        originalname: 'test-model.glb',
        mimetype: 'model/gltf-binary',
        size: 1024 * 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      s3Service.uploadFile.mockResolvedValue({
        key: 'models/uuid.glb',
        bucket: 'test-bucket',
        url: 'https://test-bucket.s3.us-east-1.amazonaws.com/models/uuid.glb',
      });

      const result = await service.uploadModel(file);

      expect(result.name).toBe('test-model.glb');
      expect(result.size).toBe(1024 * 1024);
      expect(result.id).toBeDefined();
      expect(s3Service.uploadFile).toHaveBeenCalled();
    });

    it('should reject invalid file', async () => {
      const file = {
        originalname: 'test.obj',
        mimetype: 'application/octet-stream',
        size: 1024,
      } as Express.Multer.File;

      await expect(service.uploadModel(file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteModel', () => {
    it('should delete existing model', async () => {
      s3Service.deleteFile.mockResolvedValue(undefined);

      await service.deleteModel('uuid-1');

      expect(s3Service.deleteFile).toHaveBeenCalledWith('models/uuid-1.glb');
    });

    it('should throw NotFoundException for non-existent model', async () => {
      s3Service.deleteFile.mockRejectedValue(new Error('Not found'));

      await expect(service.deleteModel('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
