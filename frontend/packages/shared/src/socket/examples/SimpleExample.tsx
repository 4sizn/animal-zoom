/**
 * SimpleExample
 * WebSocketClientController의 가장 기본적인 사용 예제
 */

import { useEffect, useState } from "react";
import type { ConnectionState } from "../types";
import { WebSocketClientController } from "../WebSocketClientController";

/**
 * 간단한 WebSocket 연결 예제
 *
 * 최소한의 코드로 WebSocketClientController 사용법 시연
 */
export function SimpleExample() {
  const [controller] = useState(() => new WebSocketClientController());
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    // 연결 상태만 구독
    const subscription = controller.connectionState$.subscribe((state) => {
      setConnectionState(state);
    });

    // 채팅 메시지 카운트
    const chatSub = controller.chatMessage$.subscribe(() => {
      setMessageCount((prev) => prev + 1);
    });

    // 자동 연결
    controller.connect();

    // Cleanup
    return () => {
      subscription.unsubscribe();
      chatSub.unsubscribe();
      controller.destroy();
    };
  }, [controller]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Simple WebSocket Example</h2>
      <p>
        <strong>Connection State:</strong> {connectionState}
      </p>
      <p>
        <strong>Messages Received:</strong> {messageCount}
      </p>
      <button onClick={() => controller.joinRoom("DEMO")}>
        Join Demo Room
      </button>
    </div>
  );
}

export default SimpleExample;
