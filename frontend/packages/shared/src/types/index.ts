/**
 * Shared Types for Animal Zoom
 * Common type definitions used across all packages
 */

// Room types
export interface Room {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  participantCount?: number;
}

// Participant types
export interface Participant {
  id: string;
  displayName: string;
  avatarConfig?: AvatarConfig;
  position?: Vector3;
  rotation?: Vector3;
}

// Avatar types
export interface AvatarConfig {
  modelUrl?: string;
  modelAssetId?: string;
  textureUrl?: string;
  scale?: number;
  color?: string;
}

// 3D Vector types
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type?: 'text' | 'system' | 'emoji';
}

// WebSocket event types
export type WebSocketEventType =
  | 'participant:join'
  | 'participant:leave'
  | 'participant:update'
  | 'chat:message'
  | 'room:update';

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: Date;
}

// Asset types
export interface Asset {
  id: string;
  name: string;
  assetType: 'avatar' | 'environment' | 'prop';
  key: string;
  url?: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  version: string;
  metadata?: Record<string, any>;
}
