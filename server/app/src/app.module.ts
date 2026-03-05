import { Module } from "@nestjs/common";
import { AnimalZoomGateway } from "./gateway/animal-zoom.gateway";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { MailModule } from "./mail/mail.module";
import { RoomsModule } from "./rooms/rooms.module";
import { UsersModule } from "./users/users.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, MailModule, RoomsModule, DashboardModule],
  providers: [AnimalZoomGateway]
})
export class AppModule {}
