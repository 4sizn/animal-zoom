import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create asset_catalog table
  await db.schema
    .createTable('asset_catalog')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
    )
    .addColumn('assetType', 'varchar(50)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('key', 'varchar(1024)', (col) => col.notNull())
    .addColumn('category', 'varchar(100)', (col) => col.notNull())
    .addColumn('tags', 'jsonb', (col) => col.notNull().defaultTo(sql`'[]'`))
    .addColumn('version', 'varchar(20)', (col) => col.notNull())
    .addColumn('fileSize', 'bigint', (col) => col.notNull())
    .addColumn('mimeType', 'varchar(100)', (col) => col.notNull())
    .addColumn('thumbnailKey', 'varchar(1024)')
    .addColumn('metadata', 'jsonb')
    .addColumn('uploadedBy', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('active'),
    )
    .addColumn('createdAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create indexes for efficient queries
  await db.schema
    .createIndex('asset_catalog_type_category_idx')
    .on('asset_catalog')
    .columns(['assetType', 'category'])
    .execute();

  await db.schema
    .createIndex('asset_catalog_uploaded_by_idx')
    .on('asset_catalog')
    .column('uploadedBy')
    .execute();

  await db.schema
    .createIndex('asset_catalog_status_idx')
    .on('asset_catalog')
    .column('status')
    .execute();

  await db.schema
    .createIndex('asset_catalog_key_version_idx')
    .on('asset_catalog')
    .columns(['key', 'version'])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('asset_catalog').execute();
}
