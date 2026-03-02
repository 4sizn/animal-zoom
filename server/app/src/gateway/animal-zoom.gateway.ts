import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Server, Socket } from "socket.io";

void JwtService;

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

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    void this.server;
    this.logger.log("Animal zoom gateway initialized");
  }

  async handleConnection(client: Socket) {
    type HandshakeWithAuth = {
      auth?: {
        token?: unknown;
      };
      headers?: {
        authorization?: string | string[];
      };
    };
    type ClientData = {
      user?: unknown;
    };

    const handshake = client.handshake as unknown as HandshakeWithAuth;
    const rawAuthHeader = client.handshake.headers?.authorization;
    const authHeader = Array.isArray(rawAuthHeader)
      ? rawAuthHeader[0]
      : rawAuthHeader;

    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : undefined;

    const tokenFromAuth =
      typeof handshake.auth?.token === "string" ? handshake.auth.token : undefined;

    const token = bearerToken ?? tokenFromAuth;

    if (!token) {
      this.logger.warn(`Client missing token: ${client.id}`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      (client.data as unknown as ClientData).user = payload;
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Client invalid token: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("zoom:update")
  onZoomUpdate(client: Socket, payload: ZoomEventPayload) {
    if (!(client.data as unknown as { user?: unknown }).user) {
      return { ok: false, error: "unauthorized" };
    }
    client.broadcast.emit("zoom:updated", payload);
    return { ok: true };
  }
}
