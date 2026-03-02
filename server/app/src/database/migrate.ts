import "dotenv/config";

import { promises as fs } from "node:fs";
import path from "node:path";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./database.module";

async function migrateToLatest() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool(
    connectionString !== undefined
      ? { connectionString }
      : {
          host: process.env.POSTGRES_HOST ?? "localhost",
          port: Number(process.env.POSTGRES_PORT ?? 5432),
          database: process.env.POSTGRES_DB,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD
        }
  );

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool })
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations")
    })
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((result) => {
    if (result.status === "Success") {
      console.log(`migration ${result.migrationName} executed successfully`);
    } else if (result.status === "Error") {
      console.error(`migration ${result.migrationName} failed`);
    }
  });

  await db.destroy();

  if (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

migrateToLatest().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
