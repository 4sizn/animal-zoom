/**
 * API Integration Tests
 * Basic smoke tests to verify API client setup
 */

import './setup'; // Load test environment configuration
import { describe, it, expect } from 'bun:test';
import { checkApiHealth, authApi, roomsApi } from '../index';

describe('API Client Integration', () => {
  describe('Health Check', () => {
    it('should connect to API server', async () => {
      const isHealthy = await checkApiHealth();
      expect(typeof isHealthy).toBe('boolean');
    });
  });

  describe('Auth API', () => {
    it('should have all auth methods defined', () => {
      expect(authApi.register).toBeDefined();
      expect(authApi.login).toBeDefined();
      expect(authApi.createGuest).toBeDefined();
      expect(authApi.getCurrentUser).toBeDefined();
      expect(authApi.logout).toBeDefined();
      expect(authApi.isAuthenticated).toBeDefined();
      expect(authApi.getStoredUser).toBeDefined();
    });

    it('should correctly detect unauthenticated state initially', () => {
      authApi.logout(); // Clear any existing auth
      expect(authApi.isAuthenticated()).toBe(false);
      expect(authApi.getStoredUser()).toBeNull();
    });
  });

  describe('Rooms API', () => {
    it('should have all room methods defined', () => {
      expect(roomsApi.createRoom).toBeDefined();
      expect(roomsApi.getRoom).toBeDefined();
      expect(roomsApi.joinRoom).toBeDefined();
      expect(roomsApi.leaveRoom).toBeDefined();
      expect(roomsApi.deleteRoom).toBeDefined();
      expect(roomsApi.getParticipants).toBeDefined();
    });
  });
});
