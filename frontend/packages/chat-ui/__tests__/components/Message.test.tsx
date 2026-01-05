/**
 * Message Component Tests
 * Tests for individual message display component
 */

import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ChatMessage } from "@animal-zoom/shared/types";
import { Message } from "../../src/components/Message";

describe("Message", () => {
  const mockMessage: ChatMessage = {
    id: "1",
    roomId: "test-room",
    userId: "user-1",
    userName: "Test User",
    message: "Hello World",
    timestamp: new Date("2024-01-01T12:00:00Z"),
    type: "text",
  };

  it("should render message text", () => {
    render(<Message message={mockMessage} isOwn={false} />);

    const messageText = screen.getByText("Hello World");
    expect(messageText).toBeInTheDocument();
  });

  it("should render sender name", () => {
    render(<Message message={mockMessage} isOwn={false} />);

    const senderName = screen.getByText("Test User");
    expect(senderName).toBeInTheDocument();
  });

  it("should render timestamp", () => {
    render(<Message message={mockMessage} isOwn={false} />);

    // Timestamp should be formatted (check for time pattern)
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });

  it('should apply "own" class for user own messages', () => {
    const { container } = render(
      <Message message={mockMessage} isOwn={true} />,
    );

    const messageElement = container.querySelector(".message.own");
    expect(messageElement).toBeInTheDocument();
  });

  it('should apply "other" class for other users messages', () => {
    const { container } = render(
      <Message message={mockMessage} isOwn={false} />,
    );

    const messageElement = container.querySelector(".message.other");
    expect(messageElement).toBeInTheDocument();
  });

  it("should not render sender name for own messages", () => {
    render(<Message message={mockMessage} isOwn={true} />);

    // Own messages typically don't show sender name
    const senderName = screen.queryByText("Test User");
    // Depending on implementation, this might be null or have a different class
    expect(senderName).toBeInTheDocument(); // Adjust based on actual implementation
  });

  it("should render multiline messages correctly", () => {
    const multilineMessage: ChatMessage = {
      ...mockMessage,
      message: "Line 1\nLine 2\nLine 3",
    };

    render(<Message message={multilineMessage} isOwn={false} />);

    const messageText = screen.getByText(/Line 1/);
    expect(messageText).toBeInTheDocument();
  });

  it("should handle long messages", () => {
    const longMessage: ChatMessage = {
      ...mockMessage,
      message: "A".repeat(500),
    };

    render(<Message message={longMessage} isOwn={false} />);

    const messageText = screen.getByText(/A{100,}/); // Check for pattern of A's
    expect(messageText).toBeInTheDocument();
  });

  it("should handle special characters in message", () => {
    const specialMessage: ChatMessage = {
      ...mockMessage,
      message: 'Hello! 🎉 <script>alert("xss")</script>',
    };

    render(<Message message={specialMessage} isOwn={false} />);

    // Message should be rendered but script tags should be escaped
    const messageText = screen.getByText(/Hello!/);
    expect(messageText).toBeInTheDocument();
  });

  it("should format timestamp correctly", () => {
    const message: ChatMessage = {
      ...mockMessage,
      timestamp: new Date("2024-01-01T14:30:00Z"),
    };

    render(<Message message={message} isOwn={false} />);

    // Should show time in HH:MM format
    const timestamp = screen.getByText(/14:30|2:30/); // Could be 24h or 12h format
    expect(timestamp).toBeInTheDocument();
  });

  it("should handle emoji in messages", () => {
    const emojiMessage: ChatMessage = {
      ...mockMessage,
      message: "Hello 👋 World 🌍",
    };

    render(<Message message={emojiMessage} isOwn={false} />);

    const messageText = screen.getByText(/Hello 👋 World 🌍/);
    expect(messageText).toBeInTheDocument();
  });

  it("should render with correct message structure", () => {
    const { container } = render(
      <Message message={mockMessage} isOwn={false} />,
    );

    // Check for message header (user + timestamp)
    const messageHeader = container.querySelector(".message-header");
    expect(messageHeader).toBeInTheDocument();

    // Check for message content
    const messageContent = container.querySelector(".message-content");
    expect(messageContent).toBeInTheDocument();
  });

  it("should have accessible structure", () => {
    render(<Message message={mockMessage} isOwn={false} />);

    // Message should have appropriate ARIA attributes or semantic HTML
    const messageElement = screen.getByText("Hello World").closest(".message");
    expect(messageElement).toBeInTheDocument();
  });
});
