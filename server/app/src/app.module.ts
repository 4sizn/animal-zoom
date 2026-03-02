import { Module } from "@nestjs/common";
import { AnimalZoomGateway } from "./gateway/animal-zoom.gateway";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { MailModule } from "./mail/mail.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, MailModule],
  providers: [AnimalZoomGateway]
})
export class AppModule {}
