import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable("user_3d_profiles")
		.addColumn("user_id", "integer", (col) =>
			col.primaryKey().references("users.id").onDelete("cascade"),
		)
		.addColumn("avatar_type", "text", (col) =>
			col.notNull().defaultTo("apollo"),
		)
		.addColumn("environment_theme", "text", (col) =>
			col.notNull().defaultTo("cafe"),
		)
		.addColumn("created_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable("user_3d_profiles").execute();
}
