/**
 * React Hook for WebSocket Client
 * React 컴포넌트에서 WebSocket을 쉽게 사용할 수 있는 훅
 */

import { useEffect, useRef, useState } from 'react';
import { getSocketClient } from './client';
import type { EventListeners, StateUpdateData } from './types';
import type { AvatarConfig } from '../api/types';

export interface UseSocketOptions {
  autoConnect?: boolean;
  listeners?: EventListeners;
}

export interface UseSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  sendMessage: (message: string) => void;
  updateState: (data: StateUpdateData) => void;
  updateAvatar: (config: AvatarConfig) => void;
  currentRoom: string | null;
  socketId: string | undefined;
}

/**
 * WebSocket Hook
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = false, listeners = {} } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);
  const socketRef = useRef(getSocketClient());

  useEffect(() => {
    const socket = socketRef.current;

    // Setup listeners with state updates
    socket.setListeners({
      ...listeners,
      onConnect: () => {
        setIsConnected(true);
        setSocketId(socket.getSocketId());
        listeners.onConnect?.();
      },
      onDisconnect: (reason) => {
        setIsConnected(false);
        setCurrentRoom(null);
        listeners.onDisconnect?.(reason);
      },
      onRoomJoined: (data) => {
        setCurrentRoom(data.roomCode);
        listeners.onRoomJoined?.(data);
      },
    });

    // Auto connect if requested
    if (autoConnect && !socket.isConnected()) {
      socket.connect();
    }

    // Update initial state
    setIsConnected(socket.isConnected());
    setCurrentRoom(socket.getCurrentRoom());
    setSocketId(socket.getSocketId());

    // Cleanup
    return () => {
      // Don't destroy socket on unmount, just clear listeners
      socket.clearListeners();
    };
  }, [autoConnect]);

  const connect = () => {
    socketRef.current.connect();
  };

  const disconnect = () => {
    socketRef.current.disconnect();
    setCurrentRoom(null);
  };

  const joinRoom = (roomCode: string) => {
    socketRef.current.joinRoom(roomCode);
  };

  const leaveRoom = () => {
    socketRef.current.leaveRoom();
    setCurrentRoom(null);
  };

  const sendMessage = (message: string) => {
    socketRef.current.sendChatMessage(message);
  };

  const updateState = (data: StateUpdateData) => {
    socketRef.current.updateState(data);
  };

  const updateAvatar = (config: AvatarConfig) => {
    socketRef.current.updateAvatar(config);
  };

  return {
    isConnected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    updateState,
    updateAvatar,
    currentRoom,
    socketId,
  };
}

export default useSocket;
