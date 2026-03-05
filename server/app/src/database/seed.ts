import "dotenv/config";

import crypto from "node:crypto";

import * as bcrypt from "bcrypt";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./database.module";

type SeedUser = { email: string; password: string };

const DEFAULT_DEV_SEED_USERS: SeedUser[] = [
  { email: "dev1@animal-zoom.local", password: "password123!" },
  { email: "dev2@animal-zoom.local", password: "password123!" },
  { email: "admin@animal-zoom.local", password: "password123!" }
];

type ParseSeedUsersResult = {
  users: SeedUser[];
  envProvided: boolean;
  envExtraCount: number;
};

function parseSeedUsers(): ParseSeedUsersResult {
  const users: SeedUser[] = [...DEFAULT_DEV_SEED_USERS];
  const seenEmails = new Set(users.map((u) => u.email.trim()));

  const raw = process.env.DEV_SEED_USERS_JSON;
  if (raw === undefined || raw.trim().length === 0) {
    return { users, envProvided: false, envExtraCount: 0 };
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("DEV_SEED_USERS_JSON must be a JSON array");
  }

  let envExtraCount = 0;
  for (const item of parsed) {
    const record = (item ?? {}) as Record<string, unknown>;
    const emailRaw = typeof record.email === "string" ? record.email : "";
    const password = typeof record.password === "string" ? record.password : "";

    const email = emailRaw.trim();
    if (email.length === 0 || password.length === 0) {
      continue;
    }

    if (seenEmails.has(email)) {
      continue;
    }

    seenEmails.add(email);
    users.push({ email, password });
    envExtraCount += 1;
  }

  return { users, envProvided: true, envExtraCount };
}

async function seed() {
  const { users: seedUsers, envExtraCount, envProvided } = parseSeedUsers();

  console.log("Seed users: defaults always included");
  if (envProvided) {
    console.log(`Seed users: env extra count: ${envExtraCount}`);
  }

  if (seedUsers.length === 0) {
    console.log("No seed users configured; skipping seed");
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool(
    connectionString !== undefined
      ? { connectionString }
      : {
          host: process.env.POSTGRES_HOST ?? "localhost",
          port: Number(process.env.POSTGRES_PORT ?? 5432),
          database: process.env.POSTGRES_DB,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD
        }
  );

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool })
  });

  try {
    const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);

    const createdUserIds: number[] = [];
    for (const user of seedUsers) {
      const passwordHash = await bcrypt.hash(user.password, saltRounds);

      await db
        .insertInto("users")
        .values({
          email: user.email,
          password_hash: passwordHash
        })
        .onConflict((oc) => oc.column("email").doNothing())
        .execute();

      const existing = await db
        .selectFrom("users")
        .select(["id"])
        .where("email", "=", user.email)
        .executeTakeFirst();

      if (existing) {
        createdUserIds.push(existing.id);
      }
    }

    const firstUserId = createdUserIds[0];
    if (firstUserId !== undefined) {
      const roomId = `room_${crypto.randomBytes(16).toString("hex")}`;
      await db
        .insertInto("rooms")
        .values({
          id: roomId,
          name: "Sample room",
          owner_user_id: firstUserId
        })
        .execute();
    }
  } finally {
    await db.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
