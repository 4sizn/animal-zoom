import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely } from 'kysely';
import { Database } from './schema';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private configService;
    db: Kysely<Database>;
    private pool;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
