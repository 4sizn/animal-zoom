/**
 * WebSocketClientController Type Definitions
 * Observable-based WebSocket client types
 */

import type { Observable } from 'rxjs';
import type {
  RoomJoinedData,
  UserJoinedData,
  UserLeftData,
  RoomUpdatedData,
  ChatMessageData,
  StateUpdateEventData,
  AvatarUpdatedData,
} from './types';

/**
 * Connection State Enum
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * WebSocket Client Controller Options
 */
export interface WebSocketClientControllerOptions {
  /**
   * WebSocket server URL
   * @default process.env.VITE_WS_URL || 'http://localhost:3001'
   */
  url?: string;

  /**
   * Automatically connect on instantiation
   * @default false
   */
  autoConnect?: boolean;

  /**
   * Enable automatic reconnection
   * @default true
   */
  reconnection?: boolean;

  /**
   * Number of reconnection attempts before giving up
   * @default 5
   */
  reconnectionAttempts?: number;

  /**
   * Delay between reconnection attempts (ms)
   * @default 1000
   */
  reconnectionDelay?: number;

  /**
   * Connection timeout (ms)
   * @default 10000
   */
  timeout?: number;
}

/**
 * Observable Streams Interface
 * Defines all Observable streams exposed by the controller
 */
export interface IWebSocketObservables {
  // Connection Observables
  /**
   * Connection state stream
   * Emits: 'disconnected' | 'connecting' | 'connected' | 'error'
   */
  connectionState$: Observable<ConnectionState>;

  /**
   * Connected event stream (emits when connected)
   */
  connected$: Observable<void>;

  /**
   * Disconnected event stream (emits reason when disconnected)
   */
  disconnected$: Observable<string>;

  /**
   * Error event stream
   */
  error$: Observable<Error>;

  // Room Observables
  /**
   * Room joined event stream
   */
  roomJoined$: Observable<RoomJoinedData>;

  /**
   * User joined event stream
   */
  userJoined$: Observable<UserJoinedData>;

  /**
   * User left event stream
   */
  userLeft$: Observable<UserLeftData>;

  /**
   * Room updated event stream
   */
  roomUpdated$: Observable<RoomUpdatedData>;

  /**
   * Current room state stream
   * Emits room code or null
   */
  currentRoom$: Observable<string | null>;

  // Chat Observables
  /**
   * Chat message stream
   */
  chatMessage$: Observable<ChatMessageData>;

  // State Observables
  /**
   * State update stream (position, rotation, avatar state)
   * Note: This stream is throttled to prevent overload
   */
  stateUpdate$: Observable<StateUpdateEventData>;

  /**
   * Avatar updated stream
   */
  avatarUpdated$: Observable<AvatarUpdatedData>;
}

/**
 * Controller Methods Interface
 */
export interface IWebSocketMethods {
  /**
   * Connect to WebSocket server
   */
  connect(): void;

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void;

  /**
   * Check if currently connected
   */
  isConnected(): boolean;

  /**
   * Join a room by room code
   * @param roomCode - The room code to join
   */
  joinRoom(roomCode: string): void;

  /**
   * Leave the current room
   */
  leaveRoom(): void;

  /**
   * Send a chat message
   * @param message - The message text to send
   */
  sendChatMessage(message: string): void;

  /**
   * Update state (position, rotation, avatar state)
   * @param data - State update data
   */
  updateState(data: import('./types').StateUpdateData): void;

  /**
   * Update avatar configuration
   * @param config - Avatar configuration
   */
  updateAvatar(config: import('../api/types').AvatarConfig): void;

  /**
   * Destroy the controller and cleanup resources
   * Completes all observables and unsubscribes all internal subscriptions
   */
  destroy(): void;
}

/**
 * Complete WebSocket Client Controller Interface
 */
export interface IWebSocketClientController
  extends IWebSocketObservables,
    IWebSocketMethods {}
