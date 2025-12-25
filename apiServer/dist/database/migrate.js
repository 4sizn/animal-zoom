import * as path from 'path';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider, } from 'kysely';
import { config } from 'dotenv';
config();
async function migrateToLatest() {
    const db = new Kysely({
        dialect: new PostgresDialect({
            pool: new Pool({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                user: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_DATABASE || 'animal_zoom',
            }),
        }),
    });
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
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