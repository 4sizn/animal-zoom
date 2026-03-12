import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable("users")
		.addColumn("nickname", "text")
		.addColumn("timezone", "text")
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.alterTable("users")
		.dropColumn("nickname")
		.dropColumn("timezone")
		.execute();
}
