/**
 * WebSocket Client
 * Socket.io 기반 실시간 통신 클라이언트
 */

import { io, type Socket } from "socket.io-client";
import { tokenManager } from "../api/client";
import type { AvatarConfig } from "../api/types";
import type {
  EventListeners,
  SocketClientOptions,
  StateUpdateData,
  // ClientEvents,
  // ServerEvents,
} from "./types";

/**
 * WebSocket Client Configuration
 */
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";
const DEFAULT_OPTIONS: SocketClientOptions = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
};

/**
 * WebSocket Client Class
 */
export class SocketClient {
  private socket: Socket | null = null;
  private listeners: EventListeners = {};
  private currentRoom: string | null = null;
  private isConnecting = false;

  constructor(options: SocketClientOptions = {}) {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const url = mergedOptions.url || WS_URL;

    // Create socket instance
    this.socket = io(url, {
      autoConnect: mergedOptions.autoConnect,
      reconnection: mergedOptions.reconnection,
      reconnectionAttempts: mergedOptions.reconnectionAttempts,
      reconnectionDelay: mergedOptions.reconnectionDelay,
      timeout: mergedOptions.timeout,
      auth: (cb) => {
        // Send JWT token for authentication
        const token = tokenManager.getToken();
        cb({ token });
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      this.isConnecting = false;
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Connected", this.socket?.id);
      }
      this.listeners.onConnect?.();
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnecting = false;
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Disconnected", reason);
      }
      this.listeners.onDisconnect?.(reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      this.isConnecting = false;
      console.error("[WebSocket] Connection Error", error);
      this.listeners.onError?.(error);
    });

    // Room events
    this.socket.on("room:joined", (data) => {
      this.currentRoom = data.roomCode;
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Room Joined", data);
      }
      this.listeners.onRoomJoined?.(data);
    });

    this.socket.on("user:joined", (data) => {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] User Joined", data);
      }
      this.listeners.onUserJoined?.(data);
    });

    this.socket.on("user:left", (data) => {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] User Left", data);
      }
      this.listeners.onUserLeft?.(data);
    });

    this.socket.on("room:updated", (data) => {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Room Updated", data);
      }
      this.listeners.onRoomUpdated?.(data);
    });

    // Chat events
    this.socket.on("chat:message", (data) => {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Chat Message", data);
      }
      this.listeners.onChatMessage?.(data);
    });

    // State events
    this.socket.on("state:update", (data) => {
      // Don't log every state update (too noisy)
      this.listeners.onStateUpdate?.(data);
    });

    this.socket.on("avatar:updated", (data) => {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.log("[WebSocket] Avatar Updated", data);
      }
      this.listeners.onAvatarUpdated?.(data);
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (!this.socket) {
      console.error("[WebSocket] Socket not initialized");
      return;
    }

    if (this.isConnecting || this.socket.connected) {
      console.warn("[WebSocket] Already connected or connecting");
      return;
    }

    const token = tokenManager.getToken();
    if (!token) {
      console.error("[WebSocket] No authentication token found");
      return;
    }

    this.isConnecting = true;
    this.socket.connect();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (!this.socket) return;

    this.socket.disconnect();
    this.currentRoom = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current room code
   */
  getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  /**
   * Join a room
   */
  joinRoom(roomCode: string): void {
    if (!this.socket?.connected) {
      console.error("[WebSocket] Not connected");
      return;
    }

    this.socket.emit("room:join", { roomCode });
  }

  /**
   * Leave current room
   */
  leaveRoom(): void {
    if (!this.socket?.connected) {
      console.error("[WebSocket] Not connected");
      return;
    }

    this.socket.emit("room:leave");
    this.currentRoom = null;
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (!this.socket?.connected) {
      console.error("[WebSocket] Not connected");
      return;
    }

    if (!this.currentRoom) {
      console.error("[WebSocket] Not in a room");
      return;
    }

    this.socket.emit("chat:message", { message });
  }

  /**
   * Update state (position, rotation)
   */
  updateState(data: StateUpdateData): void {
    if (!this.socket?.connected) return;
    if (!this.currentRoom) return;

    this.socket.emit("state:update", data);
  }

  /**
   * Update avatar configuration
   */
  updateAvatar(config: AvatarConfig): void {
    if (!this.socket?.connected) {
      console.error("[WebSocket] Not connected");
      return;
    }

    if (!this.currentRoom) {
      console.error("[WebSocket] Not in a room");
      return;
    }

    this.socket.emit("avatar:update", config);
  }

  /**
   * Set event listeners
   */
  setListeners(listeners: EventListeners): void {
    this.listeners = { ...this.listeners, ...listeners };
  }

  /**
   * Remove all event listeners
   */
  clearListeners(): void {
    this.listeners = {};
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Cleanup and destroy socket
   */
  destroy(): void {
    if (!this.socket) return;

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.listeners = {};
    this.currentRoom = null;
  }
}

/**
 * Singleton instance
 */
let socketClientInstance: SocketClient | null = null;

/**
 * Get or create socket client instance
 */
export function getSocketClient(options?: SocketClientOptions): SocketClient {
  if (!socketClientInstance) {
    socketClientInstance = new SocketClient(options);
  }
  return socketClientInstance;
}

/**
 * Destroy singleton instance
 */
export function destroySocketClient(): void {
  if (socketClientInstance) {
    socketClientInstance.destroy();
    socketClientInstance = null;
  }
}

export default SocketClient;
