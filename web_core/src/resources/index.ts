/**
 * Resources Module Barrel Export
 */

// Interfaces
export type { IResourceStorage } from './IResourceStorage';
export type {
  ParticipantResourceConfig,
  CharacterConfig,
  RoomConfig,
  ValidationResult,
} from './ResourceConfig';

// Storage Implementations
export { ResourceStorage } from './ResourceStorage';
export { ResourceStorageAPI } from './ResourceStorageAPI';

// Loader
export { ResourceLoader } from './ResourceLoader';
export type { ResourceLoaderOptions } from './ResourceLoader';

// Utilities
export { DefaultConfigs } from './DefaultConfigs';
export {
  validateParticipantResourceConfig,
  validateCharacterConfig,
  validateRoomConfig,
} from './ResourceConfig';
