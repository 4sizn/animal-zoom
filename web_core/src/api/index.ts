/**
 * API Client Barrel Export
 * Centralized exports for all API modules
 */

// Core client and utilities
export { apiClient, tokenManager, handleApiError, checkApiHealth } from './client';

// API modules
export { authApi } from './auth';
export { roomsApi, avatarApi, roomConfigApi } from './rooms';
export { resourcesApi } from './resources';

// Types
export type * from './types';
