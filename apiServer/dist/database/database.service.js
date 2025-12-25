"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const kysely_1 = require("kysely");
const pg_1 = require("pg");
let DatabaseService = class DatabaseService {
    configService;
    db;
    pool;
    constructor(configService) {
        this.configService = configService;
        this.pool = new pg_1.Pool({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', 'postgres'),
            database: this.configService.get('DB_DATABASE', 'animal_zoom'),
            max: 10,
        });
        this.db = new kysely_1.Kysely({
            dialect: new kysely_1.PostgresDialect({
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
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map