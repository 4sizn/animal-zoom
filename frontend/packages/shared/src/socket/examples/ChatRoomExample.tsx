/**
 * ChatRoomExample
 * WebSocketClientController를 사용한 실제 채팅방 예제
 */

import { useEffect, useState } from "react";
import type { ChatMessageData, ConnectionState } from "../types";
import { WebSocketClientController } from "../WebSocketClientController";

/**
 * 채팅방 컴포넌트 예제
 *
 * WebSocketClientController를 사용하여 실시간 채팅 구현
 */
export function ChatRoomExample() {
  const [controller] = useState(
    () => new WebSocketClientController({ autoConnect: false }),
  );
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    // ==================== Observable 구독 ====================

    // 1. 연결 상태 구독
    const connectionStateSub = controller.connectionState$.subscribe(
      (state) => {
        setConnectionState(state);
        console.log("[ChatRoom] Connection state:", state);
      },
    );

    // 2. 채팅 메시지 구독
    const chatMessageSub = controller.chatMessage$.subscribe((msg) => {
      setMessages((prev) => [...prev, msg]);
      console.log("[ChatRoom] New message:", msg);
    });

    // 3. 현재 방 구독
    const currentRoomSub = controller.currentRoom$.subscribe((room) => {
      setCurrentRoom(room);
      if (!room) {
        setMessages([]); // 방을 나가면 메시지 초기화
        setParticipantCount(0);
      }
    });

    // 4. 방 참가 성공 구독
    const roomJoinedSub = controller.roomJoined$.subscribe((data) => {
      console.log("[ChatRoom] Joined room:", data.roomCode);
      setParticipantCount(data.participants.length);
      setMessages([]); // 새 방에 입장하면 메시지 초기화
    });

    // 5. 사용자 입장 구독
    const userJoinedSub = controller.userJoined$.subscribe((data) => {
      console.log("[ChatRoom] User joined:", data.user.username);
      setParticipantCount((prev) => prev + 1);
    });

    // 6. 사용자 퇴장 구독
    const userLeftSub = controller.userLeft$.subscribe((data) => {
      console.log("[ChatRoom] User left:", data.userId);
      setParticipantCount((prev) => Math.max(0, prev - 1));
    });

    // 7. 에러 구독
    const errorSub = controller.error$.subscribe((error) => {
      console.error("[ChatRoom] Error:", error);
      alert(`Connection error: ${error.message}`);
    });

    // ==================== Cleanup ====================
    return () => {
      // 모든 subscription 해제
      connectionStateSub.unsubscribe();
      chatMessageSub.unsubscribe();
      currentRoomSub.unsubscribe();
      roomJoinedSub.unsubscribe();
      userJoinedSub.unsubscribe();
      userLeftSub.unsubscribe();
      errorSub.unsubscribe();

      // Controller cleanup
      controller.destroy();
    };
  }, [controller]);

  // ==================== Event Handlers ====================

  const handleConnect = () => {
    controller.connect();
  };

  const handleDisconnect = () => {
    controller.disconnect();
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }
    controller.joinRoom(roomCode.trim());
  };

  const handleLeaveRoom = () => {
    controller.leaveRoom();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    controller.sendChatMessage(inputMessage.trim());
    setInputMessage("");
  };

  // ==================== Render ====================

  const isConnected = connectionState === "connected";
  const isInRoom = !!currentRoom;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>WebSocket Chat Room Example</h1>

      {/* Connection Status */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <strong>Status:</strong>{" "}
        <span
          style={{
            color:
              connectionState === "connected"
                ? "green"
                : connectionState === "connecting"
                  ? "orange"
                  : "red",
          }}
        >
          {connectionState.toUpperCase()}
        </span>
        {isInRoom && (
          <>
            {" | "}
            <strong>Room:</strong> {currentRoom} ({participantCount}{" "}
            participants)
          </>
        )}
      </div>

      {/* Connection Controls */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleConnect}
          disabled={isConnected}
          style={{ marginRight: "10px" }}
        >
          Connect
        </button>
        <button onClick={handleDisconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>

      {/* Room Controls */}
      {isConnected && !isInRoom && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Join a Room</h3>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code (e.g., ROOM123)"
            style={{ padding: "8px", marginRight: "10px", width: "200px" }}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}

      {isInRoom && (
        <>
          {/* Leave Room */}
          <div style={{ marginBottom: "20px" }}>
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "300px",
              overflowY: "auto",
              marginBottom: "20px",
              backgroundColor: "#fff",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#999" }}>No messages yet...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{ marginBottom: "10px", padding: "5px" }}
                >
                  <strong style={{ color: "#0066cc" }}>
                    {msg.senderName}:
                  </strong>{" "}
                  <span>{msg.message}</span>
                  <br />
                  <small style={{ color: "#999" }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ padding: "8px", width: "400px", marginRight: "10px" }}
            />
            <button type="submit" disabled={!inputMessage.trim()}>
              Send
            </button>
          </form>
        </>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: "40px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>사용 방법</h3>
        <ol>
          <li>
            <strong>Connect</strong> 버튼을 클릭하여 WebSocket 서버에 연결
          </li>
          <li>
            Room code를 입력하고 <strong>Join Room</strong> 클릭
          </li>
          <li>메시지를 입력하고 전송</li>
          <li>다른 사용자의 메시지가 실시간으로 표시됨</li>
        </ol>
        <p>
          <strong>Note:</strong> 이 예제를 실행하려면 WebSocket 서버가 실행
          중이어야 하며, 인증 토큰이 설정되어 있어야 합니다.
        </p>
      </div>
    </div>
  );
}

export default ChatRoomExample;
