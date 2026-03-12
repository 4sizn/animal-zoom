import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Kysely } from "kysely";

import type { Database } from "../database/database.module";

export type PublicUser = {
	id: number;
	email: string;
	createdAt: Date;
	nickname?: string | null;
	timezone?: string | null;
};

@Injectable()
export class UsersService {
	constructor(private readonly db: Kysely<Database>) {}

	async createUser(input: {
		email: string;
		password: string;
	}): Promise<PublicUser> {
		const saltRounds = Number.parseInt(
			process.env.BCRYPT_SALT_ROUNDS ?? "10",
			10,
		);
		const passwordHash = await bcrypt.hash(input.password, saltRounds);

		try {
			const user = await this.db
				.insertInto("users")
				.values({
					email: input.email,
					password_hash: passwordHash,
				})
				.returning(["id", "email", "created_at", "nickname", "timezone"])
				.executeTakeFirstOrThrow();

			return {
				id: user.id,
				email: user.email,
				createdAt: user.created_at,
				nickname: user.nickname,
				timezone: user.timezone,
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			if (message.includes("duplicate key") || message.includes("unique")) {
				throw new ConflictException("email already exists");
			}
			throw error;
		}
	}

	async findByEmail(email: string) {
		return await this.db
			.selectFrom("users")
			.select(["id", "email", "password_hash", "created_at"])
			.where("email", "=", email)
			.executeTakeFirst();
	}

	async findById(id: number) {
		const user = await this.db
			.selectFrom("users")
			.select(["id", "email", "created_at", "nickname", "timezone"])
			.where("id", "=", id)
			.executeTakeFirst();

		if (!user) {
			return undefined;
		}

		return {
			id: user.id,
			email: user.email,
			createdAt: user.created_at,
			nickname: user.nickname,
			timezone: user.timezone,
		};
	}

	async findByIdForAuth(id: number) {
		return await this.db
			.selectFrom("users")
			.select([
				"id",
				"email",
				"password_hash",
				"created_at",
				"nickname",
				"timezone",
			])
			.where("id", "=", id)
			.executeTakeFirst();
	}

	async updateProfile(input: {
		userId: number;
		nickname: string | null;
		timezone: string | null;
	}): Promise<PublicUser> {
		const updated = await this.db
			.updateTable("users")
			.set({
				nickname: input.nickname,
				timezone: input.timezone,
				updated_at: new Date(),
			})
			.where("id", "=", input.userId)
			.returning(["id", "email", "created_at", "nickname", "timezone"])
			.executeTakeFirstOrThrow();

		return {
			id: updated.id,
			email: updated.email,
			createdAt: updated.created_at,
			nickname: updated.nickname,
			timezone: updated.timezone,
		};
	}

	async updatePassword(input: {
		userId: number;
		password: string;
	}): Promise<void> {
		const saltRounds = Number.parseInt(
			process.env.BCRYPT_SALT_ROUNDS ?? "10",
			10,
		);
		const passwordHash = await bcrypt.hash(input.password, saltRounds);
		await this.db
			.updateTable("users")
			.set({ password_hash: passwordHash, updated_at: new Date() })
			.where("id", "=", input.userId)
			.execute();
	}

	async setPasswordResetToken(input: {
		email: string;
		token: string;
		expiresAt: Date;
	}): Promise<void> {
		await this.db
			.updateTable("users")
			.set({
				reset_password_token: input.token,
				reset_password_token_expires_at: input.expiresAt,
				updated_at: new Date(),
			})
			.where("email", "=", input.email)
			.execute();
	}
}
