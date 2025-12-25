import { apiClient } from './client';
import type {
  Room,
  CreateRoomRequest,
  JoinRoomRequest,
  Participant,
  AvatarConfig,
  UpdateAvatarRequest,
  RoomConfig,
  UpdateRoomConfigRequest,
} from './types';

/**
 * Rooms API
 */
export const roomsApi = {
  /**
   * Create a new room
   */
  async createRoom(data?: CreateRoomRequest): Promise<Room> {
    const response = await apiClient.post<{ room: Room; isHost: boolean }>('/rooms', data || {});
    return response.data.room;
  },

  /**
   * Get room by code
   */
  async getRoom(roomCode: string): Promise<Room> {
    const response = await apiClient.get<Room>(`/rooms/${roomCode}`);
    return response.data;
  },

  /**
   * Join a room
   */
  async joinRoom(roomCode: string, data?: JoinRoomRequest): Promise<Participant> {
    const response = await apiClient.post<Participant>(`/rooms/${roomCode}/join`, data || {});
    return response.data;
  },

  /**
   * Leave a room
   */
  async leaveRoom(roomCode: string): Promise<void> {
    await apiClient.post(`/rooms/${roomCode}/leave`);
  },

  /**
   * Delete a room (host only)
   */
  async deleteRoom(roomCode: string): Promise<void> {
    await apiClient.delete(`/rooms/${roomCode}`);
  },

  /**
   * Get room participants
   */
  async getParticipants(roomCode: string): Promise<Participant[]> {
    const response = await apiClient.get<Participant[]>(`/rooms/${roomCode}/participants`);
    return response.data;
  },
};

/**
 * Avatar API
 */
export const avatarApi = {
  /**
   * Get my avatar config
   */
  async getMyAvatar(): Promise<AvatarConfig> {
    const response = await apiClient.get<AvatarConfig>('/avatars/me');
    return response.data;
  },

  /**
   * Update my avatar config
   */
  async updateMyAvatar(data: UpdateAvatarRequest): Promise<AvatarConfig> {
    const response = await apiClient.put<AvatarConfig>('/avatars/me', data);
    return response.data;
  },

  /**
   * Get avatar config by user ID
   */
  async getUserAvatar(userId: string): Promise<AvatarConfig> {
    const response = await apiClient.get<AvatarConfig>(`/avatars/${userId}`);
    return response.data;
  },
};

/**
 * Room Config API
 */
export const roomConfigApi = {
  /**
   * Get room config
   */
  async getRoomConfig(roomCode: string): Promise<RoomConfig> {
    const response = await apiClient.get<RoomConfig>(`/room-configs/${roomCode}`);
    return response.data;
  },

  /**
   * Update room config (host only)
   */
  async updateRoomConfig(roomCode: string, data: UpdateRoomConfigRequest): Promise<RoomConfig> {
    const response = await apiClient.put<RoomConfig>(`/room-configs/${roomCode}`, data);
    return response.data;
  },
};

export default roomsApi;
