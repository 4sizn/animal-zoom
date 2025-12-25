/**
 * API Request/Response Types
 * API 서버의 DTO와 동일한 구조를 유지
 */

// ==================== Common Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==================== Auth Types ====================

export interface User {
  id: string;
  email?: string;
  displayName: string;
  type: 'registered' | 'guest';
  avatarCustomization?: AvatarConfig;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GuestRequest {
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ==================== Room Types ====================

export interface Room {
  id: string;
  code: string;
  name?: string;
  status: 'active' | 'inactive';
  currentParticipants: number;
  maxParticipants: number;
  customization?: RoomConfig;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  name?: string;
  maxParticipants?: number;
}

export interface JoinRoomRequest {
  displayName?: string;
}

export interface Participant {
  id: string;
  userId: string;
  roomId: string;
  displayName: string;
  role: 'host' | 'participant';
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
}

// ==================== Avatar Types ====================

export interface AvatarConfig {
  modelUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accessories: string[];
}

export interface UpdateAvatarRequest {
  modelUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accessories?: string[];
}

// ==================== Room Config Types ====================

export interface RoomConfig {
  lightingPreset?: string;
  floorColor?: string;
  wallColor?: string;
  furniture?: string[];
  decorations?: string[];
}

export interface UpdateRoomConfigRequest {
  lightingPreset?: string;
  floorColor?: string;
  wallColor?: string;
  furniture?: string[];
  decorations?: string[];
}

// ==================== Resource Types ====================

export interface ResourceModel {
  id: string;
  name: string;
  url: string;
  type: 'character' | 'room' | 'accessory';
  size: number;
  createdAt: string;
}

export interface UploadResourceRequest {
  file: File;
  type: 'character' | 'room' | 'accessory';
}

// ==================== WebSocket Event Types ====================

export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
}

export interface RoomJoinedEvent {
  roomCode: string;
  user: User;
  participants: Participant[];
}

export interface UserJoinedEvent {
  user: User;
  participant: Participant;
}

export interface UserLeftEvent {
  userId: string;
  participant: Participant;
}

export interface ChatMessageEvent {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface StateUpdateEvent {
  userId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  avatarState: string;
}

export interface AvatarUpdatedEvent {
  userId: string;
  config: AvatarConfig;
}

export interface RoomUpdatedEvent {
  roomCode: string;
  config: RoomConfig;
}

// ==================== Error Types ====================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}
