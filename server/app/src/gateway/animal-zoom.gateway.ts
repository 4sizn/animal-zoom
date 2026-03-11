import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	type OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Kysely } from "kysely";
import type { Server, Socket } from "socket.io";
import type { Database } from "../database/database.module";

void JwtService;

type ZoomEventPayload = {
	animalId: string;
	x: number;
	y: number;
	scale: number;
};

type RoomPayload = {
	roomId: string;
};

type RoomMessagePayload = {
	roomId: string;
	text: string;
};

type RoomHistoryPayload = {
	roomId: string;
	limit?: number;
};

type RoomMessageDto = {
	id: number;
	roomId: string;
	authorUserId: number;
	text: string;
	createdAt: Date;
};

@WebSocketGateway({
	namespace: "/zoom",
	cors: true,
})
export class AnimalZoomGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private static readonly MESSAGE_MAX_LENGTH = 500;
	private static readonly MESSAGE_RATE_LIMIT_MAX = 5;
	private static readonly MESSAGE_RATE_LIMIT_WINDOW_MS = 5_000;

	@WebSocketServer()
	private server!: Server;

	private readonly logger = new Logger(AnimalZoomGateway.name);
	private readonly messageRateLimitBySocket = new Map<string, number[]>();

	constructor(
		private readonly jwtService: JwtService,
		private readonly db: Kysely<Database>,
	) {}

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
			typeof handshake.auth?.token === "string"
				? handshake.auth.token
				: undefined;

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
		this.messageRateLimitBySocket.delete(client.id);
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

	@SubscribeMessage("room:join")
	async onRoomJoin(client: Socket, payload: RoomPayload) {
		if (!this.getUserId(client)) {
			return { ok: false, error: "unauthorized" };
		}

		const roomId = this.parseRoomId(payload.roomId);
		if (!roomId) {
			return { ok: false, error: "invalid_room_id" };
		}

		if (!(await this.roomExists(roomId))) {
			return { ok: false, error: "room_not_found" };
		}

		client.join(this.getRoomName(roomId));
		return { ok: true };
	}

	@SubscribeMessage("room:leave")
	onRoomLeave(client: Socket, payload: RoomPayload) {
		if (!this.getUserId(client)) {
			return { ok: false, error: "unauthorized" };
		}

		const roomId = this.parseRoomId(payload.roomId);
		if (!roomId) {
			return { ok: false, error: "invalid_room_id" };
		}

		client.leave(this.getRoomName(roomId));
		return { ok: true };
	}

	@SubscribeMessage("room:message")
	async onRoomMessage(client: Socket, payload: RoomMessagePayload) {
		const userId = this.getUserId(client);
		if (!userId) {
			return { ok: false, error: "unauthorized" };
		}

		const roomId = this.parseRoomId(payload.roomId);
		if (!roomId) {
			return { ok: false, error: "invalid_room_id" };
		}

		if (!(await this.roomExists(roomId))) {
			return { ok: false, error: "room_not_found" };
		}

		if (!this.consumeMessageRateLimit(client.id)) {
			return { ok: false, error: "rate_limited" };
		}

		const text = typeof payload.text === "string" ? payload.text.trim() : "";
		if (!text) {
			return { ok: false, error: "invalid_text" };
		}

		if (text.length > AnimalZoomGateway.MESSAGE_MAX_LENGTH) {
			return { ok: false, error: "message_too_long" };
		}

		const created = await this.db
			.insertInto("room_messages")
			.values({
				room_id: roomId,
				author_user_id: userId,
				text,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		const message = this.toRoomMessageDto(created);
		this.server
			.to(this.getRoomName(roomId))
			.emit("room:message:created", message);

		return { ok: true, message };
	}

	@SubscribeMessage("room:history")
	async onRoomHistory(client: Socket, payload: RoomHistoryPayload) {
		if (!this.getUserId(client)) {
			return { ok: false, error: "unauthorized" };
		}

		const roomId = this.parseRoomId(payload.roomId);
		if (!roomId) {
			return { ok: false, error: "invalid_room_id" };
		}

		if (!(await this.roomExists(roomId))) {
			return { ok: false, error: "room_not_found" };
		}

		const limit =
			typeof payload.limit === "number" &&
			Number.isFinite(payload.limit) &&
			payload.limit > 0
				? Math.floor(payload.limit)
				: 50;

		const rows = await this.db
			.selectFrom("room_messages")
			.selectAll()
			.where("room_id", "=", roomId)
			.orderBy("created_at", "desc")
			.limit(limit)
			.execute();

		const messages = rows.reverse().map((row) => this.toRoomMessageDto(row));
		return { ok: true, messages };
	}

	private getRoomName(roomId: string) {
		return `room:${roomId}`;
	}

	private parseRoomId(roomId: unknown) {
		if (typeof roomId !== "string") {
			return null;
		}

		const value = roomId.trim();
		return value.length > 0 ? value : null;
	}

	private consumeMessageRateLimit(socketId: string) {
		const now = Date.now();
		const cutoff = now - AnimalZoomGateway.MESSAGE_RATE_LIMIT_WINDOW_MS;
		const current = this.messageRateLimitBySocket.get(socketId) ?? [];
		const withinWindow = current.filter((timestamp) => timestamp > cutoff);

		if (withinWindow.length >= AnimalZoomGateway.MESSAGE_RATE_LIMIT_MAX) {
			this.messageRateLimitBySocket.set(socketId, withinWindow);
			return false;
		}

		withinWindow.push(now);
		this.messageRateLimitBySocket.set(socketId, withinWindow);
		return true;
	}

	private async roomExists(roomId: string) {
		const room = await this.db
			.selectFrom("rooms")
			.select("id")
			.where("id", "=", roomId)
			.executeTakeFirst();

		return room !== undefined;
	}

	private getUserId(client: Socket) {
		const user = (client.data as unknown as { user?: { sub?: unknown } }).user;
		if (!user) {
			return null;
		}

		const id = Number(user.sub);
		return Number.isSafeInteger(id) && id > 0 ? id : null;
	}

	private toRoomMessageDto(row: {
		id: number;
		room_id: string;
		author_user_id: number;
		text: string;
		created_at: Date;
	}): RoomMessageDto {
		return {
			id: row.id,
			roomId: row.room_id,
			authorUserId: row.author_user_id,
			text: row.text,
			createdAt: row.created_at,
		};
	}
}
