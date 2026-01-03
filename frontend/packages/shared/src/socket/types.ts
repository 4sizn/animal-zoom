/**
 * WebSocket Event Types
 * 실시간 통신을 위한 Socket.io 이벤트 타입 정의
 */

import type {
  User,
  Participant,
  AvatarConfig,
  RoomConfig,
} from '../api/types';

// ==================== Client -> Server Events ====================

export interface ClientEvents {
  // Room Events
  'room:join': (data: { roomCode: string }) => void;
  'room:leave': () => void;

  // Chat Events
  'chat:message': (data: { message: string }) => void;

  // State Events
  'state:update': (data: StateUpdateData) => void;
  'avatar:update': (data: AvatarConfig) => void;
}

export interface StateUpdateData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  avatarState?: string;
}

// ==================== Server -> Client Events ====================

export interface ServerEvents {
  // Connection Events
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'error': (error: Error) => void;

  // Room Events
  'room:joined': (data: RoomJoinedData) => void;
  'user:joined': (data: UserJoinedData) => void;
  'user:left': (data: UserLeftData) => void;
  'room:updated': (data: RoomUpdatedData) => void;

  // Chat Events
  'chat:message': (data: ChatMessageData) => void;

  // State Events
  'state:update': (data: StateUpdateEventData) => void;
  'avatar:updated': (data: AvatarUpdatedData) => void;
}

// ==================== Event Data Types ====================

export interface RoomJoinedData {
  roomCode: string;
  room: {
    id: string;
    code: string;
    name?: string;
    maxParticipants: number;
  };
  participants: Participant[];
  self: Participant;
}

export interface UserJoinedData {
  user: User;
  participant: Participant;
}

export interface UserLeftData {
  userId: string;
  participant: Participant;
}

export interface RoomUpdatedData {
  roomCode: string;
  config: RoomConfig;
}

export interface ChatMessageData {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface StateUpdateEventData {
  userId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  avatarState?: string;
}

export interface AvatarUpdatedData {
  userId: string;
  config: AvatarConfig;
}

// ==================== WebSocket Client Options ====================

export interface SocketClientOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

// ==================== Event Listeners ====================

export type EventListener<T = any> = (data: T) => void;

export interface EventListeners {
  // Connection
  onConnect?: EventListener<void>;
  onDisconnect?: EventListener<string>;
  onError?: EventListener<Error>;

  // Room
  onRoomJoined?: EventListener<RoomJoinedData>;
  onUserJoined?: EventListener<UserJoinedData>;
  onUserLeft?: EventListener<UserLeftData>;
  onRoomUpdated?: EventListener<RoomUpdatedData>;

  // Chat
  onChatMessage?: EventListener<ChatMessageData>;

  // State
  onStateUpdate?: EventListener<StateUpdateEventData>;
  onAvatarUpdated?: EventListener<AvatarUpdatedData>;
}
