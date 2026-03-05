import { Body, Controller, Get, HttpException, Param, Post, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoomsService } from "./rooms.service";

type JwtUser = { id: number; email: string };
type JwtRequest = { user: JwtUser };

@Controller("rooms")
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(@Req() req: JwtRequest, @Body() body: unknown) {
    const data = (body ?? {}) as Record<string, unknown>;
    const name = typeof data.name === "string" ? data.name.trim() : "";

    if (name.length === 0) {
      throw new HttpException({ ok: false, error: "invalid name" }, 400);
    }

    const room = await this.roomsService.createRoom({ ownerUserId: req.user.id, name });
    return { ok: true, room };
  }

  @Get(":roomId")
  async getRoom(@Req() req: JwtRequest, @Param("roomId") roomId: string) {
    const room = await this.roomsService.findRoomByIdForOwner({
      roomId,
      ownerUserId: req.user.id
    });

    if (!room) {
      throw new HttpException({ ok: false, error: "not found" }, 404);
    }

    return { ok: true, room };
  }
}
