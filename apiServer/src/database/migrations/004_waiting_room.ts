import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add waiting_room_enabled column to rooms table
  await db.schema
    .alterTable('rooms')
    .addColumn('waiting_room_enabled', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  // Add status column to room_participants table
  await db.schema
    .alterTable('room_participants')
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('joined'),
    )
    .execute();

  // Create index for status queries
  await db.schema
    .createIndex('room_participants_status_idx')
    .on('room_participants')
    .column('status')
    .execute();

  // Create composite index for room + status queries
  await db.schema
    .createIndex('room_participants_room_status_idx')
    .on('room_participants')
    .columns(['roomId', 'status'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema
    .dropIndex('room_participants_room_status_idx')
    .execute();

  await db.schema
    .dropIndex('room_participants_status_idx')
    .execute();

  // Drop columns
  await db.schema
    .alterTable('room_participants')
    .dropColumn('status')
    .execute();

  await db.schema
    .alterTable('rooms')
    .dropColumn('waiting_room_enabled')
    .execute();
}
