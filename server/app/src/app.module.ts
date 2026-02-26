import { Module } from "@nestjs/common";
import { AnimalZoomGateway } from "./gateway/animal-zoom.gateway";

@Module({
  providers: [AnimalZoomGateway]
})
export class AppModule {}
