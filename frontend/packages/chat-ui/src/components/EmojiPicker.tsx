/**
 * EmojiPicker - Emoji selection component
 */

import type React from "react";
import { useState } from "react";

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

// Common emoji categories
const EMOJI_DATA = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
  ],
  gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤝",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🙏",
    "✍️",
    "💪",
    "🦾",
    "🦿",
    "🦵",
  ],
  hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
  ],
  food: [
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🍿",
    "🧂",
    "🥓",
    "🥚",
    "🧇",
    "🥞",
    "🧈",
    "🍞",
    "🥐",
    "🥨",
    "🥯",
    "🍩",
  ],
  symbols: [
    "✅",
    "❌",
    "⭕",
    "💯",
    "💥",
    "💫",
    "✨",
    "🔥",
    "⚡",
    "💧",
    "🌟",
    "⭐",
    "🌈",
    "☀️",
    "🌙",
    "⚠️",
  ],
};

const CATEGORIES = [
  { key: "smileys", label: "😀 스마일", icon: "😀" },
  { key: "gestures", label: "👍 제스처", icon: "👍" },
  { key: "hearts", label: "❤️ 하트", icon: "❤️" },
  { key: "animals", label: "🐶 동물", icon: "🐶" },
  { key: "food", label: "🍕 음식", icon: "🍕" },
  { key: "symbols", label: "⭐ 기호", icon: "⭐" },
] as const;

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof EMOJI_DATA>("smileys");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Don't close automatically - allow multiple selections
  };

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <span className="emoji-picker-title">이모지 선택</span>
        <button className="emoji-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="emoji-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`emoji-category-btn ${
              activeCategory === cat.key ? "active" : ""
            }`}
            onClick={() => setActiveCategory(cat.key)}
            title={cat.label}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      <div className="emoji-grid">
        {EMOJI_DATA[activeCategory].map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            className="emoji-btn"
            onClick={() => handleEmojiClick(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
