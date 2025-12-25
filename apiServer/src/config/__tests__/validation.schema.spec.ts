import { validate } from '../validation.schema.js';

describe('Environment Validation Schema', () => {
  const validConfig = {
    NODE_ENV: 'development',
    PORT: '3000',
    API_PREFIX: 'api',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USERNAME: 'postgres',
    DB_PASSWORD: 'postgres',
    DB_DATABASE: 'animal_zoom',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '24h',
    GUEST_TOKEN_EXPIRES_IN: '24h',
    WS_PORT: '3001',
    MAX_PARTICIPANTS_PER_ROOM: '50',
    ROOM_IDLE_TIMEOUT_MINUTES: '30',
  };

  it('should validate correct configuration', () => {
    expect(() => validate(validConfig)).not.toThrow();
  });

  it('should convert string numbers to numbers', () => {
    const result = validate(validConfig);

    expect(typeof result.PORT).toBe('number');
    expect(typeof result.DB_PORT).toBe('number');
    expect(typeof result.WS_PORT).toBe('number');
    expect(typeof result.MAX_PARTICIPANTS_PER_ROOM).toBe('number');
    expect(typeof result.ROOM_IDLE_TIMEOUT_MINUTES).toBe('number');
  });

  it('should throw error for missing required variables', () => {
    const invalidConfig = { ...validConfig };
    delete invalidConfig.DB_HOST;

    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw error for invalid NODE_ENV', () => {
    const invalidConfig = {
      ...validConfig,
      NODE_ENV: 'invalid',
    };

    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should allow valid NODE_ENV values', () => {
    const environments = ['development', 'production', 'test'];

    environments.forEach((env) => {
      const config = { ...validConfig, NODE_ENV: env };
      expect(() => validate(config)).not.toThrow();
    });
  });

  it('should allow optional S3 configuration', () => {
    const configWithS3 = {
      ...validConfig,
      S3_BUCKET: 'test-bucket',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'test-key',
      S3_SECRET_ACCESS_KEY: 'test-secret',
    };

    expect(() => validate(configWithS3)).not.toThrow();
  });

  it('should validate without optional fields', () => {
    const minimalConfig = { ...validConfig };

    expect(() => validate(minimalConfig)).not.toThrow();
  });
});
