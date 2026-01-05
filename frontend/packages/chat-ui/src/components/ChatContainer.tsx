/**
 * ChatContainer - Main chat UI container
 */

import type React from "react";
import { useChatStore } from "../store/chatStore";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import "../styles/chat.css";

export interface ChatContainerProps {
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ className }) => {
  const { isOpen, toggleChat, connectionState } = useChatStore();

  if (!isOpen) {
    return (
      <button
        className="chat-toggle-btn"
        onClick={toggleChat}
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  // Connection status indicator
  const getConnectionStatus = () => {
    switch (connectionState) {
      case "connected":
        return { text: "연결됨", color: "#4caf50" };
      case "connecting":
        return { text: "연결 중...", color: "#ff9800" };
      case "error":
        return { text: "오류", color: "#f44336" };
      default:
        return { text: "오프라인", color: "#9e9e9e" };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className={`chat-container ${className || ""}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <h3>채팅</h3>
          <div className="connection-status">
            <span
              className="status-dot"
              style={{ backgroundColor: status.color }}
            />
            <span className="status-text">{status.text}</span>
          </div>
        </div>
        <button
          className="chat-close-btn"
          onClick={toggleChat}
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
};
