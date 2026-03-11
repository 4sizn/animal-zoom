import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("room_messages")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("room_id", "text", (col) => col.notNull().references("rooms.id"))
		.addColumn("author_user_id", "integer", (col) =>
			col.notNull().references("users.id"),
		)
		.addColumn("text", "text", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();

	await db.schema
		.createIndex("room_messages_room_id_created_at_idx")
		.on("room_messages")
		.columns(["room_id", "created_at"])
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("room_messages").execute();
}
