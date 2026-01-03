# WebSocketClientController

OOP + RxJS 기반의 WebSocket 클라이언트 컨트롤러입니다.

## 특징

- 🔄 **RxJS Observable Streams**: 모든 이벤트를 타입 안전한 Observable로 제공
- 🏗️ **Pure OOP Design**: 클래스 기반 아키텍처
- 🔒 **Type Safety**: 완전한 TypeScript 지원
- 💾 **Memory Safe**: 자동 cleanup 및 리소스 관리
- ⚡ **Reactive**: RxJS operators를 활용한 강력한 이벤트 처리

## 설치

```bash
bun add rxjs socket.io-client
```

## 기본 사용법

### 1. 컨트롤러 생성 및 연결

```typescript
import { WebSocketClientController } from './socket';

// 인스턴스 생성
const wsController = new WebSocketClientController({
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
});

// 연결 상태 구독
wsController.connectionState$.subscribe(state => {
  console.log('Connection state:', state);
  // 'disconnected' | 'connecting' | 'connected' | 'error'
});

// 연결
wsController.connect();
```

### 2. Room 참가 및 메시지 전송

```typescript
// Room 참가
wsController.joinRoom('ROOM123');

// Room 참가 이벤트 구독
wsController.roomJoined$.subscribe(data => {
  console.log('Joined room:', data.roomCode);
  console.log('Participants:', data.participants);
});

// 채팅 메시지 전송
wsController.sendChatMessage('Hello, everyone!');

// 채팅 메시지 수신
wsController.chatMessage$.subscribe(msg => {
  console.log(`${msg.senderName}: ${msg.message}`);
});
```

### 3. 사용자 이벤트 구독

```typescript
// 사용자 입장 이벤트
wsController.userJoined$.subscribe(data => {
  console.log('User joined:', data.user.username);
});

// 사용자 퇴장 이벤트
wsController.userLeft$.subscribe(data => {
  console.log('User left:', data.userId);
});

// Room 업데이트 이벤트
wsController.roomUpdated$.subscribe(data => {
  console.log('Room updated:', data.config);
});
```

### 4. State 업데이트

```typescript
// State 업데이트 전송 (위치, 회전)
wsController.updateState({
  position: { x: 0, y: 1, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  avatarState: 'idle',
});

// State 업데이트 수신
wsController.stateUpdate$.subscribe(data => {
  console.log(`User ${data.userId} moved to:`, data.position);
});
```

### 5. Avatar 업데이트

```typescript
// Avatar 설정 변경
wsController.updateAvatar({
  model: 'character_001',
  color: '#FF0000',
});

// Avatar 업데이트 수신
wsController.avatarUpdated$.subscribe(data => {
  console.log(`User ${data.userId} changed avatar:`, data.config);
});
```

## RxJS Operators 활용

### 메시지 필터링

```typescript
import { filter, map } from 'rxjs/operators';

// 특정 사용자의 메시지만 구독
wsController.chatMessage$
  .pipe(
    filter(msg => msg.senderId === 'user123'),
    map(msg => msg.message)
  )
  .subscribe(message => {
    console.log('Message from user123:', message);
  });

// 멘션만 필터링
wsController.chatMessage$
  .pipe(filter(msg => msg.message.includes('@me')))
  .subscribe(msg => {
    showNotification(`Mention from ${msg.senderName}`);
  });
```

### Debounce & Throttle

```typescript
import { debounceTime, throttleTime } from 'rxjs/operators';

// State 업데이트를 500ms마다 한 번만 처리
wsController.stateUpdate$
  .pipe(debounceTime(500))
  .subscribe(state => {
    updateUI(state);
  });

// 채팅 메시지를 100ms에 한 번씩만 처리 (스팸 방지)
wsController.chatMessage$
  .pipe(throttleTime(100))
  .subscribe(msg => {
    displayMessage(msg);
  });
```

### 여러 Observable 결합

```typescript
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// 연결 상태와 현재 방을 동시에 구독
combineLatest([
  wsController.connectionState$,
  wsController.currentRoom$
])
  .pipe(
    map(([state, room]) => ({
      isReady: state === 'connected' && room !== null,
      state,
      room
    }))
  )
  .subscribe(status => {
    console.log('Connection ready:', status.isReady);
  });
```

## React 컴포넌트에서 사용

### 기본 사용

```typescript
import { useEffect, useState } from 'react';
import { WebSocketClientController } from './socket';

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [controller] = useState(() => new WebSocketClientController());

  useEffect(() => {
    // 연결
    controller.connect();

    // 메시지 구독
    const subscription = controller.chatMessage$.subscribe(msg => {
      setMessages(prev => [...prev, msg]);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      controller.destroy();
    };
  }, []);

  const sendMessage = (text: string) => {
    controller.sendChatMessage(text);
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.senderName}: {msg.message}</div>
      ))}
    </div>
  );
}
```

### Singleton 패턴 사용

```typescript
import { getInstance } from './socket';

function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const controller = getInstance();

    const subscription = controller.connectionState$.subscribe(state => {
      setIsConnected(state === 'connected');
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isConnected, controller: getInstance() };
}
```

## Cleanup 및 메모리 관리

```typescript
// 컴포넌트 unmount 시 반드시 cleanup
useEffect(() => {
  const controller = new WebSocketClientController();
  const subscriptions = [
    controller.chatMessage$.subscribe(/* ... */),
    controller.stateUpdate$.subscribe(/* ... */),
    controller.userJoined$.subscribe(/* ... */),
  ];

  return () => {
    // 모든 subscription 해제
    subscriptions.forEach(sub => sub.unsubscribe());

    // 컨트롤러 cleanup
    controller.destroy();
  };
}, []);
```

## API Reference

### Observable Streams

| Stream | Type | Description |
|--------|------|-------------|
| `connectionState$` | `Observable<ConnectionState>` | 연결 상태 ('disconnected' \| 'connecting' \| 'connected' \| 'error') |
| `connected$` | `Observable<void>` | 연결 성공 이벤트 |
| `disconnected$` | `Observable<string>` | 연결 해제 이벤트 (reason 포함) |
| `error$` | `Observable<Error>` | 에러 이벤트 |
| `roomJoined$` | `Observable<RoomJoinedData>` | Room 참가 성공 |
| `userJoined$` | `Observable<UserJoinedData>` | 다른 사용자 입장 |
| `userLeft$` | `Observable<UserLeftData>` | 사용자 퇴장 |
| `roomUpdated$` | `Observable<RoomUpdatedData>` | Room 설정 변경 |
| `currentRoom$` | `Observable<string \| null>` | 현재 참가 중인 Room |
| `chatMessage$` | `Observable<ChatMessageData>` | 채팅 메시지 |
| `stateUpdate$` | `Observable<StateUpdateEventData>` | 사용자 상태 업데이트 |
| `avatarUpdated$` | `Observable<AvatarUpdatedData>` | Avatar 변경 |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `connect()` | - | WebSocket 서버에 연결 |
| `disconnect()` | - | 연결 해제 |
| `isConnected()` | - | 연결 상태 확인 (boolean) |
| `joinRoom(roomCode)` | `roomCode: string` | Room 참가 |
| `leaveRoom()` | - | Room 퇴장 |
| `sendChatMessage(message)` | `message: string` | 채팅 메시지 전송 |
| `updateState(data)` | `data: StateUpdateData` | 위치/회전 업데이트 |
| `updateAvatar(config)` | `config: AvatarConfig` | Avatar 설정 변경 |
| `destroy()` | - | 리소스 cleanup |

### Singleton Functions

```typescript
import { getInstance, destroyInstance } from './socket';

// Singleton 인스턴스 가져오기
const controller = getInstance();

// Singleton 인스턴스 제거
destroyInstance();
```

## Migration from SocketClient

기존 `SocketClient`에서 마이그레이션하는 방법:

### Before (SocketClient + Callbacks)

```typescript
const socket = new SocketClient();
socket.setListeners({
  onChatMessage: (msg) => {
    console.log(msg);
  },
  onConnect: () => {
    console.log('connected');
  }
});
socket.connect();
```

### After (WebSocketClientController + Observables)

```typescript
const controller = new WebSocketClientController();

controller.chatMessage$.subscribe(msg => {
  console.log(msg);
});

controller.connected$.subscribe(() => {
  console.log('connected');
});

controller.connect();
```

## 주의사항

1. **Subscription 관리**: Observable을 구독한 후 반드시 `unsubscribe()`를 호출하여 메모리 누수를 방지하세요.
2. **Cleanup**: 컴포넌트 unmount 시 `controller.destroy()`를 호출하세요.
3. **Singleton 사용 시**: 여러 컴포넌트에서 같은 인스턴스를 공유할 때만 `getInstance()`를 사용하세요.
4. **State Updates**: `updateState()`는 매우 빈번하게 호출될 수 있으므로, UI 업데이트 시 `debounceTime()` 또는 `throttleTime()`을 사용하세요.

## 문제 해결

### 연결이 안 될 때

```typescript
// Error observable을 구독하여 에러 확인
controller.error$.subscribe(error => {
  console.error('Connection error:', error);
});

// Authentication token 확인
// tokenManager.getToken()이 유효한 token을 반환하는지 확인
```

### 메시지가 전송되지 않을 때

```typescript
// 연결 상태 확인
if (controller.isConnected()) {
  controller.sendChatMessage('test');
} else {
  console.log('Not connected');
}

// 현재 room 확인
controller.currentRoom$.subscribe(room => {
  if (!room) {
    console.log('Not in a room');
  }
});
```

## License

MIT
