import crypto from "node:crypto";

import { Injectable } from "@nestjs/common";
import { Kysely } from "kysely";

import type { Database } from "../database/database.module";

export type Room = {
  id: string;
  name: string;
  createdAt: Date;
};

@Injectable()
export class RoomsService {
  constructor(private readonly db: Kysely<Database>) {}

  async createRoom(input: { ownerUserId: number; name: string }): Promise<Room> {
    const id = `room_${crypto.randomBytes(16).toString("hex")}`;

    const room = await this.db
      .insertInto("rooms")
      .values({
        id,
        name: input.name,
        owner_user_id: input.ownerUserId
      })
      .returning(["id", "name", "created_at"])
      .executeTakeFirstOrThrow();

    return {
      id: room.id,
      name: room.name,
      createdAt: room.created_at
    };
  }

  async listRoomsForOwner(ownerUserId: number): Promise<Room[]> {
    const rooms = await this.db
      .selectFrom("rooms")
      .select(["id", "name", "created_at"])
      .where("owner_user_id", "=", ownerUserId)
      .orderBy("created_at", "desc")
      .execute();

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      createdAt: room.created_at
    }));
  }

  async findRoomByIdForOwner(input: {
    roomId: string;
    ownerUserId: number;
  }): Promise<Room | null> {
    const room = await this.db
      .selectFrom("rooms")
      .select(["id", "name", "created_at"])
      .where("id", "=", input.roomId)
      .where("owner_user_id", "=", input.ownerUserId)
      .executeTakeFirst();

    if (!room) {
      return null;
    }

    return {
      id: room.id,
      name: room.name,
      createdAt: room.created_at
    };
  }
}
