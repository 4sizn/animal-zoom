import { sql } from 'kysely';
export async function up(db) {
    await sql `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
    await db.schema
        .createTable('users')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql `uuid_generate_v4()`))
        .addColumn('type', 'varchar(20)', (col) => col.notNull().defaultTo('guest'))
        .addColumn('username', 'varchar(255)')
        .addColumn('email', 'varchar(255)')
        .addColumn('password', 'varchar(255)')
        .addColumn('displayName', 'varchar(255)')
        .addColumn('avatarCustomization', 'jsonb')
        .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql `now()`))
        .addColumn('updatedAt', 'timestamp', (col) => col.notNull().defaultTo(sql `now()`))
        .execute();
    await db.schema
        .createTable('rooms')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql `uuid_generate_v4()`))
        .addColumn('code', 'varchar(20)', (col) => col.notNull().unique())
        .addColumn('name', 'varchar(255)')
        .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('active'))
        .addColumn('currentParticipants', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('maxParticipants', 'integer', (col) => col.notNull().defaultTo(50))
        .addColumn('customization', 'jsonb')
        .addColumn('lastActivityAt', 'timestamp')
        .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql `now()`))
        .addColumn('updatedAt', 'timestamp', (col) => col.notNull().defaultTo(sql `now()`))
        .execute();
    await db.schema
        .createTable('room_participants')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql `uuid_generate_v4()`))
        .addColumn('userId', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
        .addColumn('roomId', 'uuid', (col) => col.notNull().references('rooms.id').onDelete('cascade'))
        .addColumn('role', 'varchar(20)', (col) => col.notNull().defaultTo('participant'))
        .addColumn('isActive', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('joinedAt', 'timestamp')
        .addColumn('leftAt', 'timestamp')
        .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql `now()`))
        .execute();
    await db.schema
        .createIndex('users_email_idx')
        .on('users')
        .column('email')
        .execute();
    await db.schema
        .createIndex('rooms_code_idx')
        .on('rooms')
        .column('code')
        .execute();
    await db.schema
        .createIndex('room_participants_user_room_idx')
        .on('room_participants')
        .columns(['userId', 'roomId'])
        .execute();
}
export async function down(db) {
    await db.schema.dropTable('room_participants').execute();
    await db.schema.dropTable('rooms').execute();
    await db.schema.dropTable('users').execute();
    await sql `DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
//# sourceMappingURL=001_initial_schema.js.map