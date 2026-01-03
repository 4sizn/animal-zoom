/**
 * ChatContainer - Main chat UI container
 */

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../store/chatStore';
import '../styles/chat.css';

export interface ChatContainerProps {
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ className }) => {
  const { isOpen, toggleChat } = useChatStore();

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

  return (
    <div className={`chat-container ${className || ''}`}>
      <div className="chat-header">
        <h3>채팅</h3>
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
