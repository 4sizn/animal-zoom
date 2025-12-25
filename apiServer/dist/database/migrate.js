"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const pg_1 = require("pg");
const fs_1 = require("fs");
const kysely_1 = require("kysely");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function migrateToLatest() {
    const db = new kysely_1.Kysely({
        dialect: new kysely_1.PostgresDialect({
            pool: new pg_1.Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                user: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_DATABASE || 'animal_zoom',
            }),
        }),
    });
    const migrator = new kysely_1.Migrator({
        db,
        provider: new kysely_1.FileMigrationProvider({
            fs: fs_1.promises,
            path,
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    });
    const { error, results } = await migrator.migrateToLatest();
    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`✅ Migration "${it.migrationName}" was executed successfully`);
        }
        else if (it.status === 'Error') {
            console.error(`❌ Failed to execute migration "${it.migrationName}"`);
        }
    });
    if (error) {
        console.error('❌ Failed to migrate');
        console.error(error);
        process.exit(1);
    }
    await db.destroy();
    console.log('✅ All migrations completed');
}
void migrateToLatest();
//# sourceMappingURL=migrate.js.map