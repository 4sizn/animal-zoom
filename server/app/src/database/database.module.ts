import { Module, type OnModuleDestroy } from "@nestjs/common";
import { type Generated, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

export interface UsersTable {
	id: Generated<number>;
	email: string;
	password_hash: string;
	nickname: string | null;
	timezone: string | null;
	reset_password_token: string | null;
	reset_password_token_expires_at: Date | null;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
}

export interface RoomsTable {
	id: string;
	name: string;
	owner_user_id: number;
	created_at: Generated<Date>;
	updated_at: Generated<Date>;
}

export interface RoomMessagesTable {
	id: Generated<number>;
	room_id: string;
	author_user_id: number;
	text: string;
	created_at: Generated<Date>;
}

export interface Database {
	users: UsersTable;
	rooms: RoomsTable;
	room_messages: RoomMessagesTable;
}

function createKysely(): Kysely<Database> {
	const connectionString = process.env.DATABASE_URL;

	const pool = new Pool(
		connectionString !== undefined
			? { connectionString }
			: {
					host: process.env.POSTGRES_HOST ?? "localhost",
					port: Number(process.env.POSTGRES_PORT ?? 5432),
					database: process.env.POSTGRES_DB,
					user: process.env.POSTGRES_USER,
					password: process.env.POSTGRES_PASSWORD,
				},
	);

	return new Kysely<Database>({
		dialect: new PostgresDialect({ pool }),
	});
}

@Module({
	providers: [
		{
			provide: Kysely,
			useFactory: createKysely,
		},
	],
	exports: [Kysely],
})
export class DatabaseModule implements OnModuleDestroy {
	constructor(private readonly db: Kysely<Database>) {}

	async onModuleDestroy() {
		await this.db.destroy();
	}
}
