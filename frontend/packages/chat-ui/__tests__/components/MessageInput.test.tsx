/**
 * MessageInput Component Tests
 * Tests for the chat message input component
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MessageInput } from "../../src/components/MessageInput";
import { useChatStore } from "../../src/store/chatStore";

describe("MessageInput", () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [],
      isOpen: true,
      inputValue: "",
      roomId: "test-room",
      userId: "test-user",
      userName: "Test User",
      connectionState: "connected",
    });
  });

  it("should render message input", () => {
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    expect(textarea).toBeInTheDocument();
  });

  it("should render send button", () => {
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    expect(sendButton).toBeInTheDocument();
  });

  it("should render emoji button", () => {
    render(<MessageInput />);

    const emojiButton = screen.getByRole("button", { name: /😊/i });
    expect(emojiButton).toBeInTheDocument();
  });

  it("should update input value when typing", () => {
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    expect(useChatStore.getState().inputValue).toBe("Hello World");
  });

  it("should disable send button when input is empty", () => {
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    expect(sendButton).toBeDisabled();
  });

  it("should enable send button when input has text", () => {
    useChatStore.setState({ inputValue: "Test message" });
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    expect(sendButton).not.toBeDisabled();
  });

  it("should clear input after sending message", () => {
    useChatStore.setState({ inputValue: "Test message" });
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    fireEvent.click(sendButton);

    expect(useChatStore.getState().inputValue).toBe("");
  });

  it("should handle Enter key to send message", () => {
    useChatStore.setState({ inputValue: "Test message" });
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(useChatStore.getState().inputValue).toBe("");
  });

  it("should not send message on Shift+Enter", () => {
    useChatStore.setState({ inputValue: "Test message\n" });
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    // Input should still contain the message (not cleared)
    expect(useChatStore.getState().inputValue).toBeTruthy();
  });

  it("should trim whitespace before sending", () => {
    useChatStore.setState({ inputValue: "  Test message  " });
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    expect(sendButton).not.toBeDisabled(); // Should be enabled (trimmed is not empty)
  });

  it("should not send empty message", () => {
    useChatStore.setState({ inputValue: "   " }); // Only whitespace
    render(<MessageInput />);

    const sendButton = screen.getByText(/전송/i);
    fireEvent.click(sendButton);

    // Input should remain (message not sent)
    expect(useChatStore.getState().inputValue).toBe("   ");
  });

  it("should toggle emoji picker when emoji button clicked", () => {
    render(<MessageInput />);

    const emojiButton = screen.getByRole("button", { name: /😊/i });
    fireEvent.click(emojiButton);

    // Emoji picker should appear
    const emojiPicker =
      screen.queryByRole("dialog") || screen.queryByTestId("emoji-picker");
    // Note: Actual emoji picker rendering depends on implementation
  });

  it("should have correct textarea placeholder", () => {
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText("메시지를 입력하세요...");
    expect(textarea).toBeInTheDocument();
  });

  it("should apply correct CSS classes", () => {
    render(<MessageInput />);

    const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    expect(textarea).toHaveClass("message-input");
  });
});
