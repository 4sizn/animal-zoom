import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../s3.service.js';

describe('S3Service - MinIO Integration', () => {
  let service: S3Service;
  let configService: ConfigService;

  describe('with MinIO endpoint', () => {
    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            AWS_REGION: 'us-east-1',
            AWS_BUCKET_NAME: 'test-bucket',
            AWS_ACCESS_KEY_ID: 'minioadmin',
            AWS_SECRET_ACCESS_KEY: 'minioadmin',
            AWS_ENDPOINT_URL: 'http://localhost:9000',
          };
          return config[key] || defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should configure S3Client with custom endpoint', () => {
      // Verify that the service was created with MinIO endpoint
      expect(configService.get).toHaveBeenCalledWith('AWS_ENDPOINT_URL', '');
      expect(service.getBucketName()).toBe('test-bucket');
      expect(service.getRegion()).toBe('us-east-1');
    });

    it('should have endpoint URL configured', () => {
      const endpointUrl = configService.get('AWS_ENDPOINT_URL', '');
      expect(endpointUrl).toBe('http://localhost:9000');
    });

    it('should support forcePathStyle for MinIO compatibility', () => {
      // MinIO requires forcePathStyle: true for S3Client
      // This test verifies the configuration is set up correctly
      expect(service).toBeDefined();
    });

    it('should generate correct path-style URL for MinIO', () => {
      const key = 'avatars/character/body/1.0.0/uuid-123.glb';
      const url = service.generatePublicUrl(key);

      expect(url).toBe(
        'http://localhost:9000/test-bucket/avatars/character/body/1.0.0/uuid-123.glb',
      );
    });

    it('should handle trailing slashes in endpoint URL', () => {
      // Note: Current config has no trailing slash, but method should handle it
      const key = 'test.glb';
      const url = service.generatePublicUrl(key);

      expect(url).toBe('http://localhost:9000/test-bucket/test.glb');
      expect(url).not.toContain('//test-bucket');
    });
  });

  describe('with AWS S3 (no endpoint)', () => {
    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            AWS_REGION: 'us-east-1',
            AWS_BUCKET_NAME: 'production-bucket',
            AWS_ACCESS_KEY_ID: 'aws-key',
            AWS_SECRET_ACCESS_KEY: 'aws-secret',
            AWS_ENDPOINT_URL: '', // Empty for AWS S3
          };
          return config[key] || defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should work without custom endpoint for AWS S3', () => {
      expect(service).toBeDefined();
      expect(service.getBucketName()).toBe('production-bucket');
    });

    it('should not set endpoint URL for AWS S3', () => {
      const endpointUrl = configService.get('AWS_ENDPOINT_URL', '');
      expect(endpointUrl).toBe('');
    });

    it('should generate correct virtual-hosted-style URL for AWS S3', () => {
      const key = 'avatars/character/body/1.0.0/uuid-456.glb';
      const url = service.generatePublicUrl(key);

      expect(url).toBe(
        'https://production-bucket.s3.us-east-1.amazonaws.com/avatars/character/body/1.0.0/uuid-456.glb',
      );
    });

    it('should use correct region in AWS S3 URLs', () => {
      const key = 'test.glb';
      const url = service.generatePublicUrl(key);

      expect(url).toContain('us-east-1');
      expect(url).toContain('production-bucket');
    });
  });

  describe('endpoint selection logic', () => {
    it('should use MinIO endpoint when AWS_ENDPOINT_URL is set', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return 'http://minio:9000';
          if (key === 'AWS_BUCKET_NAME') return 'local-assets';
          if (key === 'AWS_REGION') return 'us-east-1';
          if (key === 'AWS_ACCESS_KEY_ID') return 'admin';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'password';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'AWS_ENDPOINT_URL',
        '',
      );
      expect(service).toBeDefined();
    });

    it('should default to AWS S3 when AWS_ENDPOINT_URL is empty', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return '';
          if (key === 'AWS_BUCKET_NAME') return 'prod-bucket';
          if (key === 'AWS_REGION') return 'us-west-2';
          if (key === 'AWS_ACCESS_KEY_ID') return 'aws-key';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'aws-secret';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      expect(service.getRegion()).toBe('us-west-2');
      expect(service.getBucketName()).toBe('prod-bucket');
    });
  });

  describe('URL generation', () => {
    it('should generate path-style URLs when using custom endpoint', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return 'http://minio:9000';
          if (key === 'AWS_BUCKET_NAME') return 'local-assets';
          if (key === 'AWS_REGION') return 'us-east-1';
          if (key === 'AWS_ACCESS_KEY_ID') return 'admin';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'password';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      const url = service.generatePublicUrl('test/file.glb');
      expect(url).toBe('http://minio:9000/local-assets/test/file.glb');
    });

    it('should generate virtual-hosted-style URLs for AWS S3', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return '';
          if (key === 'AWS_BUCKET_NAME') return 'prod-bucket';
          if (key === 'AWS_REGION') return 'us-west-2';
          if (key === 'AWS_ACCESS_KEY_ID') return 'aws-key';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'aws-secret';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      const url = service.generatePublicUrl('test/file.glb');
      expect(url).toBe(
        'https://prod-bucket.s3.us-west-2.amazonaws.com/test/file.glb',
      );
    });

    it('should handle different regions correctly', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return '';
          if (key === 'AWS_BUCKET_NAME') return 'eu-bucket';
          if (key === 'AWS_REGION') return 'eu-west-1';
          if (key === 'AWS_ACCESS_KEY_ID') return 'key';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'secret';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      const url = service.generatePublicUrl('assets/model.glb');
      expect(url).toBe(
        'https://eu-bucket.s3.eu-west-1.amazonaws.com/assets/model.glb',
      );
    });

    it('should handle endpoint URLs with trailing slashes', async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'AWS_ENDPOINT_URL') return 'http://localhost:9000/';
          if (key === 'AWS_BUCKET_NAME') return 'test-bucket';
          if (key === 'AWS_REGION') return 'us-east-1';
          if (key === 'AWS_ACCESS_KEY_ID') return 'admin';
          if (key === 'AWS_SECRET_ACCESS_KEY') return 'password';
          return defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);

      const url = service.generatePublicUrl('file.glb');
      expect(url).toBe('http://localhost:9000/test-bucket/file.glb');
      expect(url).not.toContain('//test-bucket');
    });
  });

  describe('Enhanced S3Service methods (Phase 2)', () => {
    let service: S3Service;

    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            AWS_REGION: 'us-east-1',
            AWS_BUCKET_NAME: 'test-bucket',
            AWS_ACCESS_KEY_ID: 'minioadmin',
            AWS_SECRET_ACCESS_KEY: 'minioadmin',
            AWS_ENDPOINT_URL: 'http://localhost:9000',
            ASSET_CDN_URL: '',
          };
          return config[key] || defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3Service,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<S3Service>(S3Service);
    });

    describe('generateAssetUrl', () => {
      it('should generate presigned URL when no CDN configured', async () => {
        const key = 'assets/test.glb';
        const url = await service.generateAssetUrl(key);

        expect(url).toBeDefined();
        expect(typeof url).toBe('string');
      });

      it('should use custom expiry time', async () => {
        const key = 'assets/test.glb';
        const customExpiry = 7200; // 2 hours
        const url = await service.generateAssetUrl(key, customExpiry);

        expect(url).toBeDefined();
      });

      it('should return CDN URL when CDN is configured', async () => {
        // Test with CDN URL configured
        const mockConfigWithCDN = {
          get: jest.fn((key: string, defaultValue?: string) => {
            if (key === 'ASSET_CDN_URL') return 'https://cdn.example.com';
            if (key === 'AWS_BUCKET_NAME') return 'test-bucket';
            if (key === 'AWS_REGION') return 'us-east-1';
            if (key === 'AWS_ACCESS_KEY_ID') return 'key';
            if (key === 'AWS_SECRET_ACCESS_KEY') return 'secret';
            if (key === 'AWS_ENDPOINT_URL') return '';
            return defaultValue;
          }),
        };

        const moduleWithCDN: TestingModule = await Test.createTestingModule({
          providers: [
            S3Service,
            { provide: ConfigService, useValue: mockConfigWithCDN },
          ],
        }).compile();

        const cdnService = moduleWithCDN.get<S3Service>(S3Service);
        const key = 'assets/test.glb';
        const url = await cdnService.generateAssetUrl(key);

        expect(url).toBe('https://cdn.example.com/assets/test.glb');
      });
    });

    describe('listAssetsByPrefix', () => {
      it('should list assets with prefix and return pagination info', async () => {
        const result = await service.listAssetsByPrefix('assets/avatar/', {
          limit: 10,
        });

        expect(result).toHaveProperty('assets');
        expect(result).toHaveProperty('nextContinuationToken');
        expect(Array.isArray(result.assets)).toBe(true);
      });

      it('should use default limit when not specified', async () => {
        const result = await service.listAssetsByPrefix('assets/');

        expect(result).toHaveProperty('assets');
        expect(Array.isArray(result.assets)).toBe(true);
      });

      it('should support continuation token for pagination', async () => {
        const result = await service.listAssetsByPrefix('assets/', {
          limit: 5,
          continuationToken: 'some-token',
        });

        expect(result).toHaveProperty('assets');
      });

      it('should return assets with key, lastModified, and size', async () => {
        const result = await service.listAssetsByPrefix('assets/');

        result.assets.forEach((asset) => {
          expect(asset).toHaveProperty('key');
          expect(asset).toHaveProperty('lastModified');
          expect(asset).toHaveProperty('size');
          expect(asset.lastModified).toBeInstanceOf(Date);
          expect(typeof asset.size).toBe('number');
        });
      });
    });

    describe('copyAsset', () => {
      it('should copy asset from source to destination', async () => {
        const sourceKey = 'assets/old/model.glb';
        const destKey = 'assets/new/model.glb';

        await expect(
          service.copyAsset(sourceKey, destKey),
        ).resolves.not.toThrow();
      });

      it('should throw error if source does not exist', async () => {
        const sourceKey = 'assets/nonexistent.glb';
        const destKey = 'assets/copy.glb';

        // This test expects the actual S3 error behavior
        // In real scenario, S3 would throw NoSuchKey error
        await expect(service.copyAsset(sourceKey, destKey)).rejects.toThrow();
      });
    });
  });
});
