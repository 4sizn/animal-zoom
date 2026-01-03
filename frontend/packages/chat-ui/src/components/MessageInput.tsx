/**
 * MessageInput - Input field for sending messages
 */

import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage } from '@animal-zoom/shared/types';

export const MessageInput: React.FC = () => {
  const { inputValue, setInputValue, addMessage, roomId, userId, userName } =
    useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;
    if (!roomId || !userId || !userName) {
      console.warn('Cannot send message: missing room or user info');
      return;
    }

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      roomId,
      userId,
      userName,
      message: inputValue.trim(),
      timestamp: new Date(),
      type: 'text',
    };

    addMessage(message);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        placeholder="메시지를 입력하세요..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className="send-button" disabled={!inputValue.trim()}>
        전송
      </button>
    </form>
  );
};
