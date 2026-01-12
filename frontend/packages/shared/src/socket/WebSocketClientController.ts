/**
 * WebSocketClientController
 * OOP + RxJS based WebSocket client with Observable event streams
 */

import { BehaviorSubject, type Observable, Subject } from "rxjs";
import { io, type Socket } from "socket.io-client";
import { tokenManager } from "../api/client";
import type { AvatarConfig } from "../api/types";
import type {
  ConnectionState,
  IWebSocketClientController,
  WebSocketClientControllerOptions,
} from "./controller-types";
import { SubscriptionManager } from "./SubscriptionManager";
import type {
  AvatarUpdatedData,
  ChatMessageData,
  RoomJoinedData,
  RoomUpdatedData,
  StateUpdateData,
  StateUpdateEventData,
  UserJoinedData,
  UserLeftData,
} from "./types";

/**
 * Default Configuration
 */
const DEFAULT_OPTIONS: Required<WebSocketClientControllerOptions> = {
  url: import.meta.env.VITE_WS_URL || "http://localhost:3000",
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
};

/**
 * WebSocketClientController Class
 *
 * A fully OOP-based WebSocket client using RxJS for reactive event handling.
 * All events are exposed as type-safe Observable streams.
 *
 * @example
 * ```typescript
 * const controller = new WebSocketClientController({ autoConnect: false });
 *
 * // Subscribe to connection state
 * controller.connectionState$.subscribe(state => {
 *   console.log('Connection state:', state);
 * });
 *
 * // Subscribe to chat messages
 * controller.chatMessage$.subscribe(msg => {
 *   console.log(`${msg.senderName}: ${msg.message}`);
 * });
 *
 * // Connect and join room
 * controller.connect();
 * controller.joinRoom('ROOM123');
 *
 * // Cleanup
 * controller.destroy();
 * ```
 */
export class WebSocketClientController implements IWebSocketClientController {
  // ==================== Private Properties ====================
  private socket: Socket | null = null;
  private options: Required<WebSocketClientControllerOptions>;
  private isConnecting = false;
  private subscriptionManager: SubscriptionManager;

  // Connection State Subjects
  private connectionStateSubject: BehaviorSubject<ConnectionState>;
  private connectedSubject: Subject<void>;
  private disconnectedSubject: Subject<string>;
  private errorSubject: Subject<Error>;

  // Room Subjects
  private roomJoinedSubject: Subject<RoomJoinedData>;
  private userJoinedSubject: Subject<UserJoinedData>;
  private userLeftSubject: Subject<UserLeftData>;
  private roomUpdatedSubject: Subject<RoomUpdatedData>;
  private currentRoomSubject: BehaviorSubject<string | null>;

  // Chat Subjects
  private chatMessageSubject: Subject<ChatMessageData>;

  // State Subjects
  private stateUpdateSubject: Subject<StateUpdateEventData>;
  private avatarUpdatedSubject: Subject<AvatarUpdatedData>;

  // Waiting Room Subjects
  private userWaitingSubject: Subject<any>;
  private userAdmittedSubject: Subject<any>;
  private userRejectedSubject: Subject<any>;

  // ==================== Public Observable Streams ====================

  /**
   * Connection state stream
   * Emits current connection state: 'disconnected' | 'connecting' | 'connected' | 'error'
   */
  public readonly connectionState$: Observable<ConnectionState>;

  /**
   * Connected event stream
   * Emits when connection is established
   */
  public readonly connected$: Observable<void>;

  /**
   * Disconnected event stream
   * Emits disconnect reason when connection is lost
   */
  public readonly disconnected$: Observable<string>;

  /**
   * Error event stream
   * Emits connection and socket errors
   */
  public readonly error$: Observable<Error>;

  /**
   * Room joined event stream
   * Emits when successfully joined a room
   */
  public readonly roomJoined$: Observable<RoomJoinedData>;

  /**
   * User joined event stream
   * Emits when another user joins the room
   */
  public readonly userJoined$: Observable<UserJoinedData>;

  /**
   * User left event stream
   * Emits when a user leaves the room
   */
  public readonly userLeft$: Observable<UserLeftData>;

  /**
   * Room updated event stream
   * Emits when room configuration changes
   */
  public readonly roomUpdated$: Observable<RoomUpdatedData>;

  /**
   * Current room stream
   * Emits current room code or null
   */
  public readonly currentRoom$: Observable<string | null>;

  /**
   * Chat message stream
   * Emits incoming chat messages
   */
  public readonly chatMessage$: Observable<ChatMessageData>;

  /**
   * State update stream
   * Emits participant state updates (position, rotation)
   * Note: This stream is throttled to prevent overload
   */
  public readonly stateUpdate$: Observable<StateUpdateEventData>;

  /**
   * Avatar updated stream
   * Emits when a participant updates their avatar
   */
  public readonly avatarUpdated$: Observable<AvatarUpdatedData>;

  /**
   * User waiting stream
   * Emits when a user joins the waiting room
   */
  public readonly userWaiting$: Observable<any>;

  /**
   * User admitted stream
   * Emits when a user is admitted from waiting room
   */
  public readonly userAdmitted$: Observable<any>;

  /**
   * User rejected stream
   * Emits when a user is rejected from waiting room
   */
  public readonly userRejected$: Observable<any>;

  // ==================== Constructor ====================

  constructor(options: WebSocketClientControllerOptions = {}) {
    // Merge options with defaults
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Initialize subscription manager for memory safety
    this.subscriptionManager = new SubscriptionManager();

    // Initialize Connection Subjects
    this.connectionStateSubject = new BehaviorSubject<ConnectionState>(
      "disconnected",
    );
    this.connectedSubject = new Subject<void>();
    this.disconnectedSubject = new Subject<string>();
    this.errorSubject = new Subject<Error>();

    // Initialize Room Subjects
    this.roomJoinedSubject = new Subject<RoomJoinedData>();
    this.userJoinedSubject = new Subject<UserJoinedData>();
    this.userLeftSubject = new Subject<UserLeftData>();
    this.roomUpdatedSubject = new Subject<RoomUpdatedData>();
    this.currentRoomSubject = new BehaviorSubject<string | null>(null);

    // Initialize Chat Subjects
    this.chatMessageSubject = new Subject<ChatMessageData>();

    // Initialize State Subjects
    this.stateUpdateSubject = new Subject<StateUpdateEventData>();
    this.avatarUpdatedSubject = new Subject<AvatarUpdatedData>();

    // Initialize Waiting Room Subjects
    this.userWaitingSubject = new Subject<any>();
    this.userAdmittedSubject = new Subject<any>();
    this.userRejectedSubject = new Subject<any>();

    // Expose public Observable streams (read-only)
    this.connectionState$ = this.connectionStateSubject.asObservable();
    this.connected$ = this.connectedSubject.asObservable();
    this.disconnected$ = this.disconnectedSubject.asObservable();
    this.error$ = this.errorSubject.asObservable();

    this.roomJoined$ = this.roomJoinedSubject.asObservable();
    this.userJoined$ = this.userJoinedSubject.asObservable();
    this.userLeft$ = this.userLeftSubject.asObservable();
    this.roomUpdated$ = this.roomUpdatedSubject.asObservable();
    this.currentRoom$ = this.currentRoomSubject.asObservable();

    this.chatMessage$ = this.chatMessageSubject.asObservable();

    this.stateUpdate$ = this.stateUpdateSubject.asObservable();
    this.avatarUpdated$ = this.avatarUpdatedSubject.asObservable();

    this.userWaiting$ = this.userWaitingSubject.asObservable();
    this.userAdmitted$ = this.userAdmittedSubject.asObservable();
    this.userRejected$ = this.userRejectedSubject.asObservable();

    // Initialize Socket.io connection (but don't connect yet unless autoConnect is true)
    this.initializeSocket();

    // Auto-connect if requested
    if (this.options.autoConnect) {
      this.connect();
    }
  }

  // ==================== Public Methods ====================

  /**
   * Connect to WebSocket server
   */
  public connect(): void {
    if (!this.socket) {
      console.error("[WebSocketClientController] Socket not initialized");
      return;
    }

    if (this.isConnecting || this.socket.connected) {
      console.warn(
        "[WebSocketClientController] Already connected or connecting",
      );
      return;
    }

    const token = tokenManager.getToken();
    if (!token) {
      console.error(
        "[WebSocketClientController] No authentication token found",
      );
      this.errorSubject.next(new Error("No authentication token"));
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "[WebSocketClientController] Connecting to WebSocket server...",
      );
    }

    this.isConnecting = true;
    this.connectionStateSubject.next("connecting");
    this.socket.connect();
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (!this.socket) return;

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "[WebSocketClientController] Disconnecting from WebSocket server...",
      );
    }

    this.socket.disconnect();
    this.connectionStateSubject.next("disconnected");
    this.currentRoomSubject.next(null);
    this.isConnecting = false;
  }

  /**
   * Check if currently connected
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Join a room
   * @param roomCode - The room code to join
   */
  public joinRoom(roomCode: string): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot join room: not connected",
      );
      return;
    }

    if (!roomCode || roomCode.trim().length === 0) {
      console.error(
        "[WebSocketClientController] Cannot join room: invalid room code",
      );
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Joining room:", roomCode);
    }

    this.socket.emit("room:join", { roomCode: roomCode.trim() });
  }

  /**
   * Leave current room
   */
  public leaveRoom(): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot leave room: not connected",
      );
      return;
    }

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) {
      console.warn("[WebSocketClientController] Not in a room");
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Leaving room:", currentRoom);
    }

    this.socket.emit("room:leave");
    this.currentRoomSubject.next(null);
  }

  /**
   * Send chat message
   * @param message - The message text to send
   */
  public sendChatMessage(message: string): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot send message: not connected",
      );
      return;
    }

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) {
      console.error(
        "[WebSocketClientController] Cannot send message: not in a room",
      );
      return;
    }

    if (!message || message.trim().length === 0) {
      console.warn("[WebSocketClientController] Cannot send empty message");
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Sending chat message:", message);
    }

    this.socket.emit("chat:message", {
      roomCode: currentRoom,
      message: message.trim(),
    });
  }

  /**
   * Update state (position, rotation, avatar state)
   * @param data - State update data
   */
  public updateState(data: StateUpdateData): void {
    if (!this.socket?.connected) return;

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) return;

    // Validate data
    if (!data.position || !data.rotation) {
      console.error("[WebSocketClientController] Invalid state data");
      return;
    }

    this.socket.emit("state:update", data);
  }

  /**
   * Update avatar configuration
   * @param config - Avatar configuration
   */
  public updateAvatar(config: AvatarConfig): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot update avatar: not connected",
      );
      return;
    }

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) {
      console.error(
        "[WebSocketClientController] Cannot update avatar: not in a room",
      );
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Updating avatar:", config);
    }

    this.socket.emit("avatar:update", config);
  }

  /**
   * Join waiting room
   * @param roomCode - The room code to join
   */
  public joinWaitingRoom(roomCode: string): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot join waiting room: not connected",
      );
      return;
    }

    if (!roomCode || roomCode.trim().length === 0) {
      console.error(
        "[WebSocketClientController] Cannot join waiting room: invalid room code",
      );
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Joining waiting room:", roomCode);
    }

    this.socket.emit("room:joinWaitingRoom", { roomCode: roomCode.trim() });
  }

  /**
   * Admit a user from waiting room (host only)
   * @param roomCode - The room code
   * @param userId - The user ID to admit
   */
  public admitUser(roomCode: string, userId: string): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot admit user: not connected",
      );
      return;
    }

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) {
      console.error(
        "[WebSocketClientController] Cannot admit user: not in a room",
      );
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Admitting user:", userId);
    }

    this.socket.emit("room:admitUser", { roomCode, userId });
  }

  /**
   * Reject a user from waiting room (host only)
   * @param roomCode - The room code
   * @param userId - The user ID to reject
   */
  public rejectUser(roomCode: string, userId: string): void {
    if (!this.socket?.connected) {
      console.error(
        "[WebSocketClientController] Cannot reject user: not connected",
      );
      return;
    }

    const currentRoom = this.currentRoomSubject.value;
    if (!currentRoom) {
      console.error(
        "[WebSocketClientController] Cannot reject user: not in a room",
      );
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log("[WebSocketClientController] Rejecting user:", userId);
    }

    this.socket.emit("room:rejectUser", { roomCode, userId });
  }

  /**
   * Destroy controller and cleanup resources
   * Completes all Subjects and cleans up subscriptions
   */
  public destroy(): void {
    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        "[WebSocketClientController] Destroying controller and cleaning up resources",
      );
    }

    // Cleanup socket first
    if (this.socket) {
      // Remove all event listeners
      this.socket.removeAllListeners();
      // Disconnect from server
      this.socket.disconnect();
      this.socket = null;
    }

    // Complete all subjects (this will notify subscribers that the stream has ended)
    this.connectionStateSubject.complete();
    this.connectedSubject.complete();
    this.disconnectedSubject.complete();
    this.errorSubject.complete();

    this.roomJoinedSubject.complete();
    this.userJoinedSubject.complete();
    this.userLeftSubject.complete();
    this.roomUpdatedSubject.complete();
    this.currentRoomSubject.complete();

    this.chatMessageSubject.complete();

    this.stateUpdateSubject.complete();
    this.avatarUpdatedSubject.complete();

    this.userWaitingSubject.complete();
    this.userAdmittedSubject.complete();
    this.userRejectedSubject.complete();

    // Reset internal state
    this.isConnecting = false;

    // Unsubscribe all tracked subscriptions (if any)
    this.subscriptionManager.unsubscribeAll();
  }

  // ==================== Private Methods ====================

  /**
   * Initialize Socket.io connection
   * Creates the socket instance with configuration
   */
  private initializeSocket(): void {
    const url = this.options.url;

    this.socket = io(url, {
      autoConnect: this.options.autoConnect,
      reconnection: this.options.reconnection,
      reconnectionAttempts: this.options.reconnectionAttempts,
      reconnectionDelay: this.options.reconnectionDelay,
      timeout: this.options.timeout,
      auth: (cb) => {
        // Send JWT token for authentication
        const token = tokenManager.getToken();
        cb({ token });
      },
    });

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io event handlers
   * Maps Socket.io events to RxJS Subjects
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      this.isConnecting = false;
      this.connectionStateSubject.next("connected");
      this.connectedSubject.next();

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Connected", this.socket?.id);
      }
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnecting = false;
      this.connectionStateSubject.next("disconnected");
      this.disconnectedSubject.next(reason);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Disconnected", reason);
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      this.isConnecting = false;
      this.connectionStateSubject.next("error");
      this.errorSubject.next(error);

      console.error("[WebSocketClientController] Connection Error", error);
    });

    // Room events - TODO Phase 3: Implement detailed event handling
    this.socket.on("room:joined", (data: RoomJoinedData) => {
      this.currentRoomSubject.next(data.roomCode);
      this.roomJoinedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Room Joined", data);
      }
    });

    this.socket.on("user:joined", (data: UserJoinedData) => {
      this.userJoinedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] User Joined", data);
      }
    });

    this.socket.on("user:left", (data: UserLeftData) => {
      this.userLeftSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] User Left", data);
      }
    });

    this.socket.on("room:updated", (data: RoomUpdatedData) => {
      this.roomUpdatedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Room Updated", data);
      }
    });

    // Chat events
    this.socket.on("chat:message", (data: ChatMessageData) => {
      this.chatMessageSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Chat Message", data);
      }
    });

    // State events
    this.socket.on("state:update", (data: StateUpdateEventData) => {
      // Don't log every state update (too noisy)
      this.stateUpdateSubject.next(data);
    });

    this.socket.on("avatar:updated", (data: AvatarUpdatedData) => {
      this.avatarUpdatedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] Avatar Updated", data);
      }
    });

    // Waiting room events
    this.socket.on("user:waiting", (data: any) => {
      this.userWaitingSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] User Waiting", data);
      }
    });

    this.socket.on("user:admitted", (data: any) => {
      this.userAdmittedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] User Admitted", data);
      }
    });

    this.socket.on("user:rejected", (data: any) => {
      this.userRejectedSubject.next(data);

      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocketClientController] User Rejected", data);
      }
    });
  }
}

/**
 * Singleton instance (optional pattern)
 */
let singletonInstance: WebSocketClientController | null = null;

/**
 * Get singleton instance of WebSocketClientController
 *
 * @param options - Optional configuration (only used on first call)
 * @returns Singleton instance
 *
 * @example
 * ```typescript
 * const controller = WebSocketClientController.getInstance();
 * controller.connect();
 * ```
 */
export function getInstance(
  options?: WebSocketClientControllerOptions,
): WebSocketClientController {
  if (!singletonInstance) {
    singletonInstance = new WebSocketClientController(options);
  }
  return singletonInstance;
}

/**
 * Destroy singleton instance
 * Useful for testing or when you need to reset the singleton
 */
export function destroyInstance(): void {
  if (singletonInstance) {
    singletonInstance.destroy();
    singletonInstance = null;
  }
}

export default WebSocketClientController;
