/**
 * Room State Management Types
 * Defines all states and data structures for Zero-Media Zoom Clone
 */

// Room lifecycle states
export type RoomState = 'CREATED' | 'LIVE' | 'ENDED';

// User join states (participant journey)
export type UserJoinState = 'PREVIEW' | 'WAITING' | 'JOINED' | 'LEFT';

// Participant status indicators (for 3D avatars)
export type ParticipantStatus = 'PRESENT' | 'AWAY' | 'DO_NOT_DISTURB';

/**
 * Room information
 */
export interface RoomInfo {
  id: string; // roomId
  code: string; // roomCode
  hostId: string;
  hostName: string;
  title: string;
  state: RoomState;
  createdAt: Date;
  waitingRoomEnabled: boolean;
}

/**
 * Participant information
 */
export interface ParticipantInfo {
  id: string;
  name: string;
  joinState: UserJoinState;
  status: ParticipantStatus;
  isHost: boolean;
  joinedAt?: Date;
}

/**
 * Create room request
 */
export interface CreateRoomRequest {
  title?: string;
  waitingRoomEnabled?: boolean;
}

/**
 * Join room request
 */
export interface JoinRoomRequest {
  userName: string;
}
