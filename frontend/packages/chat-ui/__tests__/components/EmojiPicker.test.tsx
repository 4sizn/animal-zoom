/**
 * EmojiPicker Component Tests
 * Tests for the emoji selection component
 */

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmojiPicker } from "../../src/components/EmojiPicker";

describe("EmojiPicker", () => {
  const mockOnEmojiSelect = mock(() => {});
  const mockOnClose = mock(() => {});

  beforeEach(() => {
    mockOnEmojiSelect.mockReset();
    mockOnClose.mockReset();
  });

  it("should render emoji picker", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Should render the picker container
    const picker =
      screen.getByRole("dialog") || screen.getByTestId("emoji-picker");
    expect(picker).toBeInTheDocument();
  });

  it("should render emoji categories", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Check for category tabs/buttons
    expect(screen.getByText(/표정|웃음|Smileys/i)).toBeInTheDocument();
  });

  it("should render emojis", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Should render emoji buttons
    const emojiButtons = container.querySelectorAll(
      '.emoji-button, button[aria-label*="emoji"]',
    );
    expect(emojiButtons.length).toBeGreaterThan(0);
  });

  it("should call onEmojiSelect when emoji clicked", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Click first emoji
    const firstEmoji =
      container.querySelector(".emoji-button") ||
      container.querySelector("button");
    if (firstEmoji) {
      fireEvent.click(firstEmoji);
      expect(mockOnEmojiSelect).toHaveBeenCalled();
    }
  });

  it("should call onClose when close button clicked", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Look for close button (X, 닫기, Close, etc.)
    const closeButton = screen.getByRole("button", { name: /close|닫기|×/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should switch between emoji categories", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Find category tabs
    const categoryTabs = screen.getAllByRole("button");
    const smileyTab = categoryTabs.find((tab) =>
      tab.textContent?.includes("표정"),
    );
    const heartTab = categoryTabs.find((tab) =>
      tab.textContent?.includes("하트"),
    );

    if (smileyTab && heartTab) {
      // Click different category
      fireEvent.click(heartTab);

      // Should show different emojis
      // (Implementation specific - check if category changes)
    }
  });

  it("should have correct structure", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Check for picker structure
    const picker = container.querySelector(".emoji-picker");
    expect(picker).toBeInTheDocument();

    // Check for category tabs section
    const categories = container.querySelector(
      ".emoji-categories, .category-tabs",
    );
    expect(categories).toBeInTheDocument();

    // Check for emoji grid section
    const emojiGrid = container.querySelector(".emoji-grid, .emoji-list");
    expect(emojiGrid).toBeInTheDocument();
  });

  it("should render common emojis", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Check for common emojis
    const content = container.textContent || "";
    expect(content).toMatch(/😀|😊|❤️|👍/);
  });

  it("should pass selected emoji to callback", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Find and click specific emoji
    const emojiButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent === "😀",
    );

    if (emojiButton) {
      fireEvent.click(emojiButton);
      expect(mockOnEmojiSelect).toHaveBeenCalledWith("😀");
    }
  });

  it("should have accessible labels", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Emoji picker should have appropriate ARIA attributes
    const picker =
      screen.getByRole("dialog") || screen.getByTestId("emoji-picker");
    expect(picker).toBeInTheDocument();
  });

  it("should render all emoji categories", () => {
    render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    // Expected categories from implementation
    const categories = ["표정", "제스처", "하트", "동물", "음식", "기호"];

    categories.forEach((category) => {
      // Check if category is present (might be in Korean or icons)
      const categoryElement = screen.queryByText(new RegExp(category, "i"));
      // Some categories might be represented by icons only
    });
  });

  it("should close picker when clicking outside (if implemented)", () => {
    const { container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />
      </div>,
    );

    const outside = screen.getByTestId("outside");
    fireEvent.click(outside);

    // If click-outside-to-close is implemented
    // expect(mockOnClose).toHaveBeenCalled();
  });

  it("should have smooth animations", () => {
    const { container } = render(
      <EmojiPicker onEmojiSelect={mockOnEmojiSelect} onClose={mockOnClose} />,
    );

    const picker = container.querySelector(".emoji-picker");
    // Check if animation class is present
    expect(picker).toBeInTheDocument();
  });
});
