import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from '../database.service.js';
import databaseConfig from '../../config/database.config.js';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
        }),
      ],
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have db instance', () => {
    expect(service.db).toBeDefined();
  });

  it('should have Kysely methods', () => {
    expect(typeof service.db.selectFrom).toBe('function');
    expect(typeof service.db.insertInto).toBe('function');
    expect(typeof service.db.updateTable).toBe('function');
    expect(typeof service.db.deleteFrom).toBe('function');
  });
});
