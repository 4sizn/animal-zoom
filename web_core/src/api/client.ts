import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

/**
 * API Client Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '';
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Token Storage Keys
 */
const TOKEN_KEY = 'animal-zoom:token';
const USER_KEY = 'animal-zoom:user';

/**
 * Token Management
 */
export const tokenManager = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): any | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

/**
 * Create Axios Instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Add JWT token to Authorization header
 * - Log requests in debug mode
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header
    const token = tokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('[API Request]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle common errors
 * - Auto-logout on 401
 * - Log responses in debug mode
 */
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('[API Response]', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Debug logging
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('[API Response Error]', {
        status: error.response?.status,
        url: error.config?.url,
        error: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Auto logout
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized - Clearing session');
      tokenManager.clear();

      // Redirect to login (선택사항)
      // window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] Forbidden - Insufficient permissions');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('[API] Not Found -', error.config?.url);
    }

    // Handle 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('[API] Server Error -', error.response.data);
    }

    // Network Error
    if (!error.response) {
      console.error('[API] Network Error - Server not reachable');
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Handler Utility
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Server returned error response
    if (axiosError.response?.data) {
      return axiosError.response.data.message || axiosError.response.data.error || 'An error occurred';
    }

    // Network error
    if (axiosError.message === 'Network Error') {
      return 'Network error - Please check your connection';
    }

    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout - Please try again';
    }

    return axiosError.message;
  }

  // Unknown error
  return 'An unexpected error occurred';
}

/**
 * Check if API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('[API Health Check] Failed', error);
    return false;
  }
}

export default apiClient;
