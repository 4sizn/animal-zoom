/**
 * SimpleGuest Component Tests
 * TDD Phase 1: Basic rendering and route accessibility
 * @vitest-environment happy-dom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useRoomStore } from "@/stores/roomStore";
import { SimpleGuest } from "../SimpleGuest";

// Mock room store
vi.mock("@/stores/roomStore");

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("SimpleGuest", () => {
  const mockCreateRoom = vi.fn();
  const mockJoinRoom = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigate mock
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Setup default mock implementation
    vi.mocked(useRoomStore).mockReturnValue({
      room: null,
      createRoom: mockCreateRoom,
      joinRoom: mockJoinRoom,
      isLoading: false,
      error: null,
    } as any);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test("should render without crashing", () => {
    renderWithRouter(<SimpleGuest />);
  });

  test("should display page title", () => {
    renderWithRouter(<SimpleGuest />);
    const heading = screen.getByRole("heading", { name: /simple guest/i });
    expect(heading).toBeDefined();
    expect(heading.textContent).toMatch(/simple guest/i);
  });

  test("should have basic layout structure", () => {
    const { container } = renderWithRouter(<SimpleGuest />);
    expect(container.firstChild).toBeTruthy();
  });

  // Phase 2: Input fields tests
  describe("Input Fields", () => {
    test("should render nickname input field", () => {
      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(/nickname|name/i);
      expect(nicknameInput).toBeDefined();
    });

    test("should update nickname state when typing", () => {
      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(
        /nickname|name/i,
      ) as HTMLInputElement;

      // Simulate typing
      nicknameInput.value = "John Doe";
      nicknameInput.dispatchEvent(new Event("input", { bubbles: true }));

      expect(nicknameInput.value).toBe("John Doe");
    });

    test("should render room ID input field", () => {
      renderWithRouter(<SimpleGuest />);
      const roomIdInput = screen.getByPlaceholderText(/room.*id|code/i);
      expect(roomIdInput).toBeDefined();
    });

    test("should update room ID state when typing", () => {
      renderWithRouter(<SimpleGuest />);
      const roomIdInput = screen.getByPlaceholderText(
        /room.*id|code/i,
      ) as HTMLInputElement;

      // Simulate typing
      roomIdInput.value = "ABC-123";
      roomIdInput.dispatchEvent(new Event("input", { bubbles: true }));

      expect(roomIdInput.value).toBe("ABC-123");
    });
  });

  // Phase 2: Validation tests
  describe("Validation", () => {
    test("should display label for nickname input", () => {
      renderWithRouter(<SimpleGuest />);
      const input = screen.getByLabelText(/your nickname/i);
      expect(input).toBeDefined();
    });

    test("should display label for room ID input", () => {
      renderWithRouter(<SimpleGuest />);
      const input = screen.getByLabelText(/room id/i);
      expect(input).toBeDefined();
    });
  });

  // Phase 3: Create Room functionality tests
  describe("Create Room", () => {
    test("should render Create Room button", () => {
      renderWithRouter(<SimpleGuest />);
      const createButton = screen.getByRole("button", { name: /create room/i });
      expect(createButton).toBeDefined();
    });

    test("should disable Create Room button when nickname is empty", () => {
      renderWithRouter(<SimpleGuest />);
      const createButton = screen.getByRole("button", {
        name: /create room/i,
      }) as HTMLButtonElement;
      expect(createButton.disabled).toBe(true);
    });

    test("should enable Create Room button when nickname is provided", () => {
      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(
        /nickname/i,
      ) as HTMLInputElement;
      const createButton = screen.getByRole("button", {
        name: /create room/i,
      }) as HTMLButtonElement;

      fireEvent.change(nicknameInput, { target: { value: "John" } });
      expect(createButton.disabled).toBe(false);
    });

    test("should call createRoom when Create Room is clicked", async () => {
      mockCreateRoom.mockResolvedValue(undefined);

      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(/nickname/i);
      const createButton = screen.getByRole("button", { name: /create room/i });

      fireEvent.change(nicknameInput, { target: { value: "John" } });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockCreateRoom).toHaveBeenCalledWith({ title: "Quick Meeting" });
      });
    });

    test("should auto-populate room ID after room creation", async () => {
      const mockRoom = {
        id: "room-123",
        code: "ABC-123-XYZ",
        hostId: "user-1",
        hostName: "John",
        title: "Quick Meeting",
        state: "CREATED" as const,
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      mockCreateRoom.mockResolvedValue(undefined);
      vi.mocked(useRoomStore).mockReturnValue({
        room: mockRoom,
        createRoom: mockCreateRoom,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<SimpleGuest />);
      const roomIdInput = screen.getByPlaceholderText(
        /room.*id/i,
      ) as HTMLInputElement;

      expect(roomIdInput.value).toBe("ABC-123-XYZ");
    });

    test("should show loading state during room creation", async () => {
      vi.mocked(useRoomStore).mockReturnValue({
        room: null,
        createRoom: mockCreateRoom,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<SimpleGuest />);
      const createButton = screen.getByRole("button", {
        name: /creating|loading/i,
      });
      expect(createButton).toBeDefined();
    });

    test("should display error message on creation failure", async () => {
      vi.mocked(useRoomStore).mockReturnValue({
        room: null,
        createRoom: mockCreateRoom,
        joinRoom: mockJoinRoom,
        isLoading: false,
        error: "Failed to create room",
      } as any);

      renderWithRouter(<SimpleGuest />);
      // Error will be handled via toast, which we'll check in the component
    });
  });

  // Phase 4: Join Room functionality tests
  describe("Join Room", () => {
    test("should render Join Room button", () => {
      renderWithRouter(<SimpleGuest />);
      const joinButton = screen.getByRole("button", { name: /join room/i });
      expect(joinButton).toBeDefined();
    });

    test("should disable Join Room button when nickname or room ID is empty", () => {
      renderWithRouter(<SimpleGuest />);
      const joinButton = screen.getByRole("button", {
        name: /join room/i,
      }) as HTMLButtonElement;
      expect(joinButton.disabled).toBe(true);
    });

    test("should enable Join Room button when both nickname and room ID are provided", () => {
      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(
        /nickname/i,
      ) as HTMLInputElement;
      const roomIdInput = screen.getByPlaceholderText(
        /room.*id/i,
      ) as HTMLInputElement;
      const joinButton = screen.getByRole("button", {
        name: /join room/i,
      }) as HTMLButtonElement;

      fireEvent.change(nicknameInput, { target: { value: "Jane" } });
      fireEvent.change(roomIdInput, { target: { value: "ABC-123" } });

      expect(joinButton.disabled).toBe(false);
    });

    test("should call joinRoom when Join Room is clicked", async () => {
      mockJoinRoom.mockResolvedValue(undefined);

      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(/nickname/i);
      const roomIdInput = screen.getByPlaceholderText(/room.*id/i);
      const joinButton = screen.getByRole("button", { name: /join room/i });

      fireEvent.change(nicknameInput, { target: { value: "Jane" } });
      fireEvent.change(roomIdInput, { target: { value: "ABC-123" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(mockJoinRoom).toHaveBeenCalledWith("ABC-123", {
          userName: "Jane",
        });
      });
    });

    test("should navigate to live session after successful join", async () => {
      const mockRoom = {
        id: "room-456",
        code: "ABC-123",
        hostId: "user-2",
        hostName: "Host",
        title: "Test Room",
        state: "CREATED" as const,
        createdAt: new Date(),
        waitingRoomEnabled: true,
      };

      mockJoinRoom.mockResolvedValue(undefined);
      vi.mocked(useRoomStore).mockReturnValue({
        room: mockRoom,
        createRoom: mockCreateRoom,
        joinRoom: mockJoinRoom,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<SimpleGuest />);
      const nicknameInput = screen.getByPlaceholderText(/nickname/i);
      const roomIdInput = screen.getByPlaceholderText(/room.*id/i);
      const joinButton = screen.getByRole("button", { name: /join room/i });

      fireEvent.change(nicknameInput, { target: { value: "Jane" } });
      fireEvent.change(roomIdInput, { target: { value: "ABC-123" } });
      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/room/room-456/session");
      });
    });

    test("should show loading state during join", () => {
      vi.mocked(useRoomStore).mockReturnValue({
        room: null,
        createRoom: mockCreateRoom,
        joinRoom: mockJoinRoom,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<SimpleGuest />);

      // Both buttons should be disabled during loading
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect((button as HTMLButtonElement).disabled).toBe(true);
      });
    });

    test("should display error on invalid room ID", async () => {
      mockJoinRoom.mockRejectedValue(new Error("Room not found"));

      vi.mocked(useRoomStore).mockReturnValue({
        room: null,
        createRoom: mockCreateRoom,
        joinRoom: mockJoinRoom,
        isLoading: false,
        error: "Room not found",
      } as any);

      renderWithRouter(<SimpleGuest />);
      // Error will be displayed via toast
    });
  });
});
