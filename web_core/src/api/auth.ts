import { apiClient, tokenManager } from './client';
import type {
  RegisterRequest,
  LoginRequest,
  GuestRequest,
  AuthResponse,
  User,
} from './types';

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Store token and user
    tokenManager.setToken(response.data.accessToken);
    tokenManager.setUser(response.data.user);

    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);

    // Store token and user
    tokenManager.setToken(response.data.accessToken);
    tokenManager.setUser(response.data.user);

    return response.data;
  },

  /**
   * Create guest user
   */
  async createGuest(data: GuestRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/guest', data);

    // Store token and user
    tokenManager.setToken(response.data.accessToken);
    tokenManager.setUser(response.data.user);

    return response.data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');

    // Update stored user
    tokenManager.setUser(response.data);

    return response.data;
  },

  /**
   * Logout (clear local storage)
   */
  logout(): void {
    tokenManager.clear();

    // Optionally notify server
    // apiClient.post('/auth/logout').catch(() => {});
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  },

  /**
   * Get stored user info (without API call)
   */
  getStoredUser(): User | null {
    return tokenManager.getUser();
  },
};

export default authApi;
