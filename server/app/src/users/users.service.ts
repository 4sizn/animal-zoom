import { ConflictException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Kysely } from "kysely";

import type { Database } from "../database/database.module";

export type PublicUser = {
  id: number;
  email: string;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly db: Kysely<Database>) {}

  async createUser(input: { email: string; password: string }): Promise<PublicUser> {
    const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    try {
      const user = await this.db
        .insertInto("users")
        .values({
          email: input.email,
          password_hash: passwordHash
        })
        .returning(["id", "email", "created_at"])
        .executeTakeFirstOrThrow();

      return {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
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
    return await this.db
      .selectFrom("users")
      .select(["id", "email", "created_at"])
      .where("id", "=", id)
      .executeTakeFirst();
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
        updated_at: new Date()
      })
      .where("email", "=", input.email)
      .execute();
  }
}
