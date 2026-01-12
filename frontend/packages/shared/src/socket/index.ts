/**
 * WebSocket Module Barrel Export
 */

// Legacy SocketClient (deprecated - use WebSocketClientController instead)
export { destroySocketClient, getSocketClient, SocketClient } from "./client";
export type * from "./controller-types";

// Subscription Manager (for advanced use cases)
export { SubscriptionManager } from "./SubscriptionManager";

// Type exports
export type * from "./types";
// New OOP + RxJS WebSocket Client Controller
export {
  destroyInstance,
  getInstance,
  WebSocketClientController,
} from "./WebSocketClientController";
