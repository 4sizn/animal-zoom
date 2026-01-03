/**
 * Meeting State Management Types
 * Defines all states and data structures for Zero-Media Zoom Clone
 */

// Meeting lifecycle states
export type MeetingState = 'CREATED' | 'LIVE' | 'ENDED';

// User join states (participant journey)
export type UserJoinState = 'PREVIEW' | 'WAITING' | 'JOINED' | 'LEFT';

// Participant status indicators (for 3D avatars)
export type ParticipantStatus = 'PRESENT' | 'AWAY' | 'DO_NOT_DISTURB';

/**
 * Meeting information
 */
export interface MeetingInfo {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  title: string;
  state: MeetingState;
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
 * Create meeting request
 */
export interface CreateMeetingRequest {
  title?: string;
  waitingRoomEnabled?: boolean;
}

/**
 * Join meeting request
 */
export interface JoinMeetingRequest {
  userName: string;
}
