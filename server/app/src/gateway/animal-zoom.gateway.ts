import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

type ZoomEventPayload = {
  animalId: string;
  x: number;
  y: number;
  scale: number;
};

@WebSocketGateway({
  namespace: "/zoom",
  cors: true
})
export class AnimalZoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(AnimalZoomGateway.name);

  afterInit() {
    this.logger.log("Animal zoom gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("zoom:update")
  onZoomUpdate(client: Socket, payload: ZoomEventPayload) {
    client.broadcast.emit("zoom:updated", payload);
    return { ok: true };
  }
}
