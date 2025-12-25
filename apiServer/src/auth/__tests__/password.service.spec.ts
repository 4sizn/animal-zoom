import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../password.service.js';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const password = 'testPassword123';
    const hash = await service.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should verify correct password', async () => {
    const password = 'testPassword123';
    const hash = await service.hash(password);
    const isValid = await service.compare(password, hash);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword';
    const hash = await service.hash(password);
    const isValid = await service.compare(wrongPassword, hash);

    expect(isValid).toBe(false);
  });

  it('should generate different hashes for same password', async () => {
    const password = 'testPassword123';
    const hash1 = await service.hash(password);
    const hash2 = await service.hash(password);

    expect(hash1).not.toBe(hash2);
    expect(await service.compare(password, hash1)).toBe(true);
    expect(await service.compare(password, hash2)).toBe(true);
  });
});
