/**
 * MentionSuggestions - Autocomplete suggestions for @mentions
 */

import type React from "react";
import { useEffect, useRef } from "react";

export interface MentionSuggestionsProps {
  suggestions: string[];
  onSelect: (username: string) => void;
  onClose: () => void;
  selectedIndex?: number;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  suggestions,
  onSelect,
  onClose,
  selectedIndex = 0,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to selected item
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(
        ".mention-suggestion-item.selected",
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mention-suggestions" ref={listRef}>
      {suggestions.map((username, index) => (
        <button
          key={username}
          className={`mention-suggestion-item ${
            index === selectedIndex ? "selected" : ""
          }`}
          onClick={() => onSelect(username)}
          onMouseDown={(e) => {
            // Prevent input blur
            e.preventDefault();
          }}
        >
          <span className="mention-suggestion-at">@</span>
          <span className="mention-suggestion-username">{username}</span>
        </button>
      ))}
    </div>
  );
};
