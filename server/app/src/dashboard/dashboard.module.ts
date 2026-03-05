import { Module } from "@nestjs/common";

import { RoomsModule } from "../rooms/rooms.module";
import { UsersModule } from "../users/users.module";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [UsersModule, RoomsModule],
  controllers: [DashboardController]
})
export class DashboardModule {}
