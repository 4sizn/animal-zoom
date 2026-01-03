/**
 * WebSocket Module Barrel Export
 */

// Legacy SocketClient (deprecated - use WebSocketClientController instead)
export { SocketClient, getSocketClient, destroySocketClient } from './client';

// New OOP + RxJS WebSocket Client Controller
export {
  WebSocketClientController,
  getInstance,
  destroyInstance,
} from './WebSocketClientController';

// Subscription Manager (for advanced use cases)
export { SubscriptionManager } from './SubscriptionManager';

// Type exports
export type * from './types';
export type * from './controller-types';
