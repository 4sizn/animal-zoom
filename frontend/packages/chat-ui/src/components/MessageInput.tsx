/**
 * MessageInput - Input field for sending messages with mention support
 */

import type { ChatMessage } from "@animal-zoom/shared/types";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";
import { completeMention, getMentionSuggestions } from "../utils/mentionParser";
import { EmojiPicker } from "./EmojiPicker";
import { MentionSuggestions } from "./MentionSuggestions";

export const MessageInput: React.FC = () => {
  const { inputValue, setInputValue, addMessage, roomId, userId, userName } =
    useChatStore();
  const { sendMessage, connectionState, messages } = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get list of available users from recent messages
  const availableUsers = Array.from(
    new Set(messages.map((msg) => msg.userName)),
  ).filter((name) => name !== userName);

  // Update mention suggestions when input changes
  useEffect(() => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart || 0;
    const suggestions = getMentionSuggestions(
      inputValue,
      cursorPosition,
      availableUsers,
    );

    setMentionSuggestions(suggestions);
    setSelectedSuggestionIndex(0);
  }, [inputValue, availableUsers.join(",")]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Close mention suggestions on submit
    setMentionSuggestions([]);

    if (!inputValue.trim()) return;
    if (!roomId || !userId || !userName) {
      console.warn("Cannot send message: missing room or user info");
      return;
    }

    // Send via WebSocket if connected, otherwise add locally
    if (connectionState === "connected") {
      sendMessage(inputValue.trim());
      setInputValue("");
    } else {
      // Fallback: add message locally for demo mode
      const message: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        roomId,
        userId,
        userName,
        message: inputValue.trim(),
        timestamp: new Date(),
        type: "text",
      };

      addMessage(message);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle mention suggestion navigation
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          Math.min(prev + 1, mentionSuggestions.length - 1),
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === "Tab" || e.key === "Enter") {
        if (mentionSuggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          handleMentionSelect(mentionSuggestions[selectedSuggestionIndex]);
          return;
        }
      }

      if (e.key === "Escape") {
        setMentionSuggestions([]);
        return;
      }
    }

    // Normal Enter to send (if no suggestions active)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMentionSelect = (username: string) => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart || 0;
    const { text, newCursorPosition } = completeMention(
      inputValue,
      cursorPosition,
      username,
    );

    setInputValue(text);
    setMentionSuggestions([]);

    // Set cursor position after React updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition,
        );
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(inputValue + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {mentionSuggestions.length > 0 && (
        <MentionSuggestions
          suggestions={mentionSuggestions}
          selectedIndex={selectedSuggestionIndex}
          onSelect={handleMentionSelect}
          onClose={() => setMentionSuggestions([])}
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
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder="메시지를 입력하세요... (@로 멘션)"
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
