import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create chat_messages table
  await db.schema
    .createTable('chat_messages')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
    )
    .addColumn('room_id', 'uuid', (col) =>
      col.references('rooms.id').onDelete('cascade').notNull(),
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('set null'),
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('message_type', 'varchar(20)', (col) =>
      col.notNull().defaultTo('text'),
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  // Create index for faster room message queries
  await db.schema
    .createIndex('chat_messages_room_id_created_at_idx')
    .on('chat_messages')
    .columns(['room_id', 'created_at'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('chat_messages').execute();
}
