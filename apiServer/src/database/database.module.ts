import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Global database module providing Kysely instance
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
