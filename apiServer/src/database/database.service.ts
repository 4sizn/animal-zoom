import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './schema';

/**
 * Kysely database service for dependency injection
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public db: Kysely<Database>;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'animal_zoom'),
      max: 10,
    });

    this.db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
    });
  }

  async onModuleInit() {
    try {
      // Test connection
      await this.db.selectFrom('users').select('id').limit(1).execute();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.log(
        '⚠️ Database connection failed (tables may not exist yet):',
        error,
      );
    }
  }

  async onModuleDestroy() {
    await this.db.destroy();
    await this.pool.end();
  }
}
