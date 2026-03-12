import { Controller, Get, HttpException, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoomsService } from "../rooms/rooms.service";
import { UsersService } from "../users/users.service";

type JwtUser = { id: number; email: string };
type JwtRequest = { user: JwtUser };

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
	constructor(
		private readonly usersService: UsersService,
		private readonly roomsService: RoomsService,
	) {}

	@Get()
	async getDashboard(@Req() req: JwtRequest) {
		const user = await this.usersService.findById(req.user.id);
		if (!user) {
			throw new HttpException({ ok: false, error: "unauthorized" }, 401);
		}

		const rooms = await this.roomsService.listRoomsForOwner(req.user.id);

		return {
			ok: true,
			user: {
				id: user.id,
				email: user.email,
				createdAt: user.createdAt,
				nickname: user.nickname ?? null,
				timezone: user.timezone ?? null,
			},
			rooms,
		};
	}
}
