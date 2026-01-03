/**
 * Message - Individual chat message component
 */

import React from 'react';
import type { ChatMessage } from '@animal-zoom/shared/types';
import { useChatStore } from '../store/chatStore';

export interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const userId = useChatStore((state) => state.userId);
  const isOwn = message.userId === userId;

  return (
    <div className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
      <div className="message-header">
        <span className="message-author">{message.userName}</span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="message-content">{message.message}</div>
    </div>
  );
};
