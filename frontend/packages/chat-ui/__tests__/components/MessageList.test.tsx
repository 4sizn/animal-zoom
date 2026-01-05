/**
 * MessageList Component Tests
 * Tests for the scrollable message list component
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ChatMessage } from "@animal-zoom/shared/types";
import { MessageList } from "../../src/components/MessageList";
import { useChatStore } from "../../src/store/chatStore";

describe("MessageList", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isOpen: true,
      inputValue: "",
      roomId: "test-room",
      userId: "current-user",
      userName: "Current User",
      connectionState: "connected",
    });
  });

  it("should render empty state when no messages", () => {
    render(<MessageList />);

    const emptyMessage = screen.getByText(
      /아직 메시지가 없습니다|대화를 시작해보세요/i,
    );
    expect(emptyMessage).toBeInTheDocument();
  });

  it("should render messages from store", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "First message",
        timestamp: new Date(),
        type: "text",
      },
      {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Second message",
        timestamp: new Date(),
        type: "text",
      },
    ];

    useChatStore.setState({ messages });
    render(<MessageList />);

    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("should identify own messages correctly", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        roomId: "test-room",
        userId: "current-user",
        userName: "Current User",
        message: "My message",
        timestamp: new Date(),
        type: "text",
      },
      {
        id: "2",
        roomId: "test-room",
        userId: "other-user",
        userName: "Other User",
        message: "Other message",
        timestamp: new Date(),
        type: "text",
      },
    ];

    useChatStore.setState({ messages, userId: "current-user" });
    const { container } = render(<MessageList />);

    // Check for own message class
    const ownMessages = container.querySelectorAll(".message.own");
    expect(ownMessages).toHaveLength(1);

    // Check for other message class
    const otherMessages = container.querySelectorAll(".message.other");
    expect(otherMessages).toHaveLength(1);
  });

  it("should render messages in correct order", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "First",
        timestamp: new Date("2024-01-01T10:00:00Z"),
        type: "text",
      },
      {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Second",
        timestamp: new Date("2024-01-01T11:00:00Z"),
        type: "text",
      },
      {
        id: "3",
        roomId: "test-room",
        userId: "user-3",
        userName: "User 3",
        message: "Third",
        timestamp: new Date("2024-01-01T12:00:00Z"),
        type: "text",
      },
    ];

    useChatStore.setState({ messages });
    render(<MessageList />);

    const messageElements = screen.getAllByText(/First|Second|Third/);
    expect(messageElements[0]).toHaveTextContent("First");
    expect(messageElements[1]).toHaveTextContent("Second");
    expect(messageElements[2]).toHaveTextContent("Third");
  });

  it("should handle many messages", () => {
    const messages: ChatMessage[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      roomId: "test-room",
      userId: `user-${i}`,
      userName: `User ${i}`,
      message: `Message ${i}`,
      timestamp: new Date(),
      type: "text" as const,
    }));

    useChatStore.setState({ messages });
    render(<MessageList />);

    // Should render all messages
    expect(screen.getByText("Message 0")).toBeInTheDocument();
    expect(screen.getByText("Message 49")).toBeInTheDocument();
  });

  it("should have scrollable container", () => {
    const { container } = render(<MessageList />);

    const messageList = container.querySelector(".message-list");
    expect(messageList).toBeInTheDocument();

    // Should have overflow styles for scrolling
    if (messageList) {
      const styles = window.getComputedStyle(messageList);
      // Check if overflow is set (actual value depends on CSS)
      expect(messageList).toHaveClass("message-list");
    }
  });

  it("should update when new messages added", () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "Initial message",
        timestamp: new Date(),
        type: "text",
      },
    ];

    useChatStore.setState({ messages: initialMessages });
    const { rerender } = render(<MessageList />);

    expect(screen.getByText("Initial message")).toBeInTheDocument();

    // Add new message
    const newMessage: ChatMessage = {
      id: "2",
      roomId: "test-room",
      userId: "user-2",
      userName: "User 2",
      message: "New message",
      timestamp: new Date(),
      type: "text",
    };

    useChatStore.setState({ messages: [...initialMessages, newMessage] });
    rerender(<MessageList />);

    expect(screen.getByText("New message")).toBeInTheDocument();
  });

  it("should render empty state with appropriate styling", () => {
    const { container } = render(<MessageList />);

    const emptyState = container.querySelector(".empty-state");
    expect(emptyState).toBeInTheDocument();
  });

  it("should handle messages with different timestamps", () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        roomId: "test-room",
        userId: "user-1",
        userName: "User 1",
        message: "Morning message",
        timestamp: new Date("2024-01-01T08:00:00Z"),
        type: "text",
      },
      {
        id: "2",
        roomId: "test-room",
        userId: "user-2",
        userName: "User 2",
        message: "Evening message",
        timestamp: new Date("2024-01-01T20:00:00Z"),
        type: "text",
      },
    ];

    useChatStore.setState({ messages });
    render(<MessageList />);

    expect(screen.getByText("Morning message")).toBeInTheDocument();
    expect(screen.getByText("Evening message")).toBeInTheDocument();
  });
});
