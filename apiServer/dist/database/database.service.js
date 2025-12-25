var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
let DatabaseService = class DatabaseService {
    configService;
    db;
    pool;
    constructor(configService) {
        this.configService = configService;
        this.pool = new Pool({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', 'postgres'),
            database: this.configService.get('DB_DATABASE', 'animal_zoom'),
            max: 10,
        });
        this.db = new Kysely({
            dialect: new PostgresDialect({
                pool: this.pool,
            }),
        });
    }
    async onModuleInit() {
        try {
            await this.db.selectFrom('users').select('id').limit(1).execute();
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.log('⚠️ Database connection failed (tables may not exist yet):', error);
        }
    }
    async onModuleDestroy() {
        await this.db.destroy();
        await this.pool.end();
    }
};
DatabaseService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], DatabaseService);
export { DatabaseService };
//# sourceMappingURL=database.service.js.map