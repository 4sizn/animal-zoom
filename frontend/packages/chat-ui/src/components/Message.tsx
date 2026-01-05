/**
 * Message - Individual chat message component with reactions
 */

import type { ChatMessage } from "@animal-zoom/shared/types";
import type React from "react";
import { useState } from "react";
import { useChatStore } from "../store/chatStore";

export interface MessageProps {
  message: ChatMessage;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "😍", "🔥"];

export const Message: React.FC<MessageProps> = ({ message }) => {
  const userId = useChatStore((state) => state.userId);
  const { toggleReaction, getReactionCounts, hasUserReacted } = useChatStore();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isOwn = message.userId === userId;
  const reactionCounts = getReactionCounts(message.id);
  const uniqueEmojis = Object.keys(reactionCounts);

  const handleReactionClick = (emoji: string) => {
    toggleReaction(message.id, emoji);
  };

  const handleAddReaction = (emoji: string) => {
    toggleReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className={`message ${isOwn ? "message-own" : "message-other"}`}>
      <div className="message-header">
        <span className="message-author">{message.userName}</span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="message-content">{message.message}</div>

      {/* Reactions Display */}
      {uniqueEmojis.length > 0 && (
        <div className="message-reactions">
          {uniqueEmojis.map((emoji) => {
            const count = reactionCounts[emoji];
            const userReacted = hasUserReacted(message.id, emoji);

            return (
              <button
                key={emoji}
                className={`reaction-pill ${userReacted ? "reaction-active" : ""}`}
                onClick={() => handleReactionClick(emoji)}
                title={`${emoji} ${count}`}
              >
                <span className="reaction-emoji">{emoji}</span>
                <span className="reaction-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="message-actions">
        <button
          className="add-reaction-btn"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          title="반응 추가"
        >
          +
        </button>

        {showReactionPicker && (
          <div className="reaction-picker-popup">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                className="quick-reaction-btn"
                onClick={() => handleAddReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
