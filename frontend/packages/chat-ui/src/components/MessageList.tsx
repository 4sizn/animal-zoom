/**
 * MessageList - Display chat messages
 */

import type React from "react";
import { useEffect, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { Message } from "./Message";

export const MessageList: React.FC = () => {
  const messages = useChatStore((state) => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>아직 메시지가 없습니다</p>
          <p className="empty-hint">첫 메시지를 보내보세요!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
