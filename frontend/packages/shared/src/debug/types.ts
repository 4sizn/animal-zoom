/**
 * Debug Panel Types
 * Type definitions for WebSocket debug UI component
 */

import type { WebSocketClientController } from "../socket/WebSocketClientController";

/**
 * Debug Panel Props
 */
export interface DebugPanelProps {
  /**
   * WebSocket client controller instance
   */
  wsController?: WebSocketClientController;

  /**
   * Current user's unique ID
   */
  userId?: string;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Connection state with color indicator
 */
export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

/**
 * Color mapping for connection states
 */
export const CONNECTION_COLORS: Record<ConnectionStatus, string> = {
  connected: "#22c55e", // green-500
  connecting: "#eab308", // yellow-500
  disconnected: "#ef4444", // red-500
  error: "#ef4444", // red-500
};

/**
 * Connection state display
 */
export const CONNECTION_LABELS: Record<ConnectionStatus, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  error: "Error",
};

/**
 * Connection state emoji indicators
 */
export const CONNECTION_EMOJI: Record<ConnectionStatus, string> = {
  connected: "🟢",
  connecting: "🟡",
  disconnected: "🔴",
  error: "🔴",
};
