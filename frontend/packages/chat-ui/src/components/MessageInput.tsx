/**
 * MessageInput - Input field for sending messages
 */

import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { EmojiPicker } from './EmojiPicker';
import type { ChatMessage } from '@animal-zoom/shared/types';

export const MessageInput: React.FC = () => {
  const { inputValue, setInputValue, addMessage, roomId, userId, userName } =
    useChatStore();
  const { sendMessage, connectionState } = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;
    if (!roomId || !userId || !userName) {
      console.warn('Cannot send message: missing room or user info');
      return;
    }

    // Send via WebSocket if connected, otherwise add locally
    if (connectionState === 'connected') {
      sendMessage(inputValue.trim());
      setInputValue('');
    } else {
      // Fallback: add message locally for demo mode
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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(inputValue + emoji);
  };

  return (
    <div style={{ position: 'relative' }}>
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <form className="message-input-container" onSubmit={handleSubmit}>
        <button
          type="button"
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="이모지 추가"
        >
          😀
        </button>
        <input
          type="text"
          className="message-input"
          placeholder="메시지를 입력하세요..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputValue.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
};
