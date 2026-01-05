/**
 * API Client Barrel Export
 * Centralized exports for all API modules
 */

export { assetCatalogApi } from "./assetCatalog";

// API modules
export { authApi } from "./auth";
// Core client and utilities
export {
  apiClient,
  checkApiHealth,
  handleApiError,
  tokenManager,
} from "./client";
export { resourcesApi } from "./resources";
export { avatarApi, roomConfigApi, roomsApi } from "./rooms";

// Types
export type * from "./types";
