/**
 * Debug Panel Component
 * Real-time debugging UI for WebSocket connection, user, and room info
 */

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { ChatMessageData } from "../socket/types";
import type { ConnectionStatus, DebugPanelProps } from "./types";
import { CONNECTION_EMOJI, CONNECTION_LABELS } from "./types";
import "./DebugPanel.css";

/**
 * DebugPanel - A collapsible debugging overlay for monitoring WebSocket state
 *
 * @param props - Component props
 * @param props.userId - Current user's unique identifier
 * @param props.wsController - WebSocket client controller instance (optional)
 * @param props.className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <DebugPanel
 *   userId="user-123"
 *   wsController={controller}
 * />
 * ```
 */
export const DebugPanel: React.FC<DebugPanelProps> = ({
  userId,
  wsController,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // WebSocket state
  const [connectionState, setConnectionState] =
    useState<ConnectionStatus>("disconnected");
  const [socketId, setSocketId] = useState<string | undefined>();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [latestMessage, setLatestMessage] = useState<ChatMessageData | null>(
    null,
  );

  /**
   * Toggle panel visibility
   */
  const togglePanel = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Handle keyboard navigation (Enter/Space)
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        togglePanel();
      }
    },
    [togglePanel],
  );

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, []);

  /**
   * Subscribe to WebSocket observables
   */
  useEffect(() => {
    if (!wsController) {
      setConnectionState("disconnected");
      setSocketId(undefined);
      setCurrentRoom(null);
      return;
    }

    // Subscribe to connection state
    const connectionSub = wsController.connectionState$.subscribe((state) => {
      setConnectionState(state as ConnectionStatus);

      // Update socket ID when connected
      if (state === "connected") {
        setSocketId(
          wsController.isConnected()
            ? (wsController as any).socket?.id
            : undefined,
        );
      } else {
        setSocketId(undefined);
      }
    });

    // Subscribe to current room
    const roomSub = wsController.currentRoom$.subscribe((room) => {
      setCurrentRoom(room);
    });

    // Subscribe to chat messages
    const messageSub = wsController.chatMessage$.subscribe((message) => {
      setLatestMessage(message);
    });

    // Cleanup subscriptions
    return () => {
      connectionSub.unsubscribe();
      roomSub.unsubscribe();
      messageSub.unsubscribe();
    };
  }, [wsController]);

  /**
   * Format timestamp as relative time
   */
  const formatRelativeTime = useCallback((timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}초 전`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    }
  }, []);

  return (
    <div
      data-testid="debug-panel-container"
      className={`debug-panel-container ${className}`}
    >
      {/* Toggle Button */}
      <button
        className="debug-toggle-button"
        onClick={togglePanel}
        onKeyDown={handleKeyDown}
        aria-label="Debug Panel Toggle"
        aria-expanded={isExpanded}
      >
        🐛
      </button>

      {/* Panel Content */}
      {isExpanded && (
        <div data-testid="debug-panel-content" className="debug-panel-content">
          <div className="debug-panel-header">
            <h3>🐛 Debug Panel</h3>
          </div>

          <div className="debug-panel-body">
            {/* WebSocket Status Section */}
            <div className="debug-section">
              <div className="debug-section-title">WebSocket</div>
              <div className="debug-status">
                <span
                  className={`debug-status-indicator status-${connectionState}`}
                >
                  {CONNECTION_EMOJI[connectionState]}
                </span>
                <span>{CONNECTION_LABELS[connectionState]}</span>
              </div>
              <div className="debug-info-row">
                <span className="debug-label">Socket ID:</span>
                <span className="debug-value">{socketId || "-"}</span>
              </div>
            </div>

            {/* User Info Section */}
            <div className="debug-section">
              <div className="debug-section-title">👤 User</div>
              <div className="debug-info-row">
                <span className="debug-label">User ID:</span>
                <span className="debug-value">{userId || "Guest"}</span>
                {userId && (
                  <button
                    className="debug-copy-button"
                    onClick={() => copyToClipboard(userId)}
                    aria-label="Copy user ID"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
            </div>

            {/* Room Info Section */}
            <div className="debug-section">
              <div className="debug-section-title">🏠 Room</div>
              {currentRoom ? (
                <div className="debug-info-row">
                  <span className="debug-label">Room Code:</span>
                  <span className="debug-value">{currentRoom}</span>
                  <button
                    className="debug-copy-button"
                    onClick={() => copyToClipboard(currentRoom)}
                    aria-label="Copy room code"
                  >
                    📋 Copy
                  </button>
                </div>
              ) : (
                <div className="debug-info-row">
                  <span className="debug-value">Not in a room</span>
                </div>
              )}
            </div>

            {/* Latest Message Section */}
            <div className="debug-section">
              <div className="debug-section-title">💬 Latest Message</div>
              {latestMessage ? (
                <div className="debug-message">
                  <div>
                    <span className="debug-message-sender">
                      {latestMessage.senderName}:
                    </span>{" "}
                    {latestMessage.message}
                  </div>
                  <span className="debug-message-time">
                    {formatRelativeTime(latestMessage.timestamp)}
                  </span>
                </div>
              ) : (
                <div className="debug-message">
                  <span className="debug-value">No messages</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
