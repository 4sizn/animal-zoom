var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RoomGateway_1;
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomService } from '../room/room.service.js';
import { JoinRoomEventDto, LeaveRoomEventDto, ChatMessageDto, SyncStateDto, } from './dto/room-events.dto.js';
let RoomGateway = RoomGateway_1 = class RoomGateway {
    roomService;
    server;
    logger = new Logger(RoomGateway_1.name);
    userRooms = new Map();
    constructor(roomService) {
        this.roomService = roomService;
    }
    handleConnection(client) {
        try {
            const userId = client.data.user?.sub;
            if (!userId) {
                this.logger.warn('Client connected without user data');
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);
            client.emit('connected', { message: 'Connected to server' });
        }
        catch (error) {
            this.logger.error('Connection error:', error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const roomCode = this.userRooms.get(client.id);
        const userId = client.data.user?.sub;
        if (roomCode && userId) {
            try {
                await this.roomService.leaveRoom(userId, roomCode);
                void client.leave(roomCode);
                this.userRooms.delete(client.id);
                this.server.to(roomCode).emit('user:left', {
                    userId,
                    roomCode,
                });
                this.logger.log(`Client disconnected: ${client.id}, left room: ${roomCode}`);
            }
            catch (error) {
                this.logger.error('Disconnect error:', error);
            }
        }
    }
    async handleJoinRoom(data, client) {
        try {
            const userId = client.data.user.sub;
            const { roomCode } = data;
            const result = await this.roomService.joinRoom(userId, roomCode);
            await client.join(roomCode);
            this.userRooms.set(client.id, roomCode);
            const participants = await this.roomService.getRoomParticipants(roomCode);
            client.emit('room:joined', {
                room: result.room,
                isHost: result.isHost,
                participants,
            });
            client.to(roomCode).emit('user:joined', {
                userId,
                roomCode,
                participants,
            });
            this.logger.log(`User ${userId} joined room ${roomCode}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Join room error:', error);
            const errorMessage = error.message || 'Unknown error';
            client.emit('error', { message: errorMessage });
            return { success: false, error: errorMessage };
        }
    }
    async handleLeaveRoom(data, client) {
        try {
            const userId = client.data.user.sub;
            const { roomCode } = data;
            await this.roomService.leaveRoom(userId, roomCode);
            await client.leave(roomCode);
            this.userRooms.delete(client.id);
            this.server.to(roomCode).emit('user:left', {
                userId,
                roomCode,
            });
            client.emit('room:left', { roomCode });
            this.logger.log(`User ${userId} left room ${roomCode}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Leave room error:', error);
            const errorMessage = error.message || 'Unknown error';
            client.emit('error', { message: errorMessage });
            return { success: false, error: errorMessage };
        }
    }
    handleChatMessage(data, client) {
        try {
            const userId = client.data.user.sub;
            const username = client.data.user.username;
            const { roomCode, message } = data;
            this.server.to(roomCode).emit('chat:message', {
                userId,
                username,
                message,
                timestamp: new Date(),
            });
            this.logger.log(`Chat message in room ${roomCode} from ${username}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Chat message error:', error);
            const errorMessage = error.message || 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }
    handleStateSync(data, client) {
        try {
            const userId = client.data.user.sub;
            const { roomCode, position, rotation, avatarState } = data;
            client.to(roomCode).emit('state:update', {
                userId,
                position,
                rotation,
                avatarState,
                timestamp: new Date(),
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error('State sync error:', error);
            const errorMessage = error.message || 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }
    async handleGetParticipants(data) {
        try {
            const participants = await this.roomService.getRoomParticipants(data.roomCode);
            return { success: true, participants };
        }
        catch (error) {
            this.logger.error('Get participants error:', error);
            const errorMessage = error.message || 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }
    broadcastAvatarUpdate(userId, avatarConfig) {
        const userRooms = [];
        this.userRooms.forEach((roomCode, _socketId) => {
            if (!userRooms.includes(roomCode)) {
                userRooms.push(roomCode);
            }
        });
        userRooms.forEach((roomCode) => {
            this.server.to(roomCode).emit('avatar:updated', {
                userId,
                avatarConfig,
                timestamp: new Date(),
            });
        });
        this.logger.log(`Avatar updated for user ${userId}, broadcast to ${userRooms.length} rooms`);
    }
    broadcastRoomConfigUpdate(roomCode, roomConfig) {
        this.server.to(roomCode).emit('room:updated', {
            roomCode,
            roomConfig,
            timestamp: new Date(),
        });
        this.logger.log(`Room config updated for room ${roomCode}`);
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], RoomGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('room:join'),
    __param(0, MessageBody()),
    __param(1, ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [JoinRoomEventDto,
        Socket]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleJoinRoom", null);
__decorate([
    SubscribeMessage('room:leave'),
    __param(0, MessageBody()),
    __param(1, ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LeaveRoomEventDto,
        Socket]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleLeaveRoom", null);
__decorate([
    SubscribeMessage('chat:message'),
    __param(0, MessageBody()),
    __param(1, ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChatMessageDto,
        Socket]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleChatMessage", null);
__decorate([
    SubscribeMessage('state:sync'),
    __param(0, MessageBody()),
    __param(1, ConnectedSocket()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SyncStateDto,
        Socket]),
    __metadata("design:returntype", void 0)
], RoomGateway.prototype, "handleStateSync", null);
__decorate([
    SubscribeMessage('room:getParticipants'),
    __param(0, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoomGateway.prototype, "handleGetParticipants", null);
RoomGateway = RoomGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [RoomService])
], RoomGateway);
export { RoomGateway };
//# sourceMappingURL=room.gateway.js.map