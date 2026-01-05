/**
 * Resources Module Barrel Export
 */

// Asset URL Resolution
export { AssetUrlResolver, createDefaultResolver } from "./AssetUrlResolver";
// Utilities
export { DefaultConfigs } from "./DefaultConfigs";
// Interfaces
export type { IResourceStorage } from "./IResourceStorage";
export type {
  CharacterConfig,
  ParticipantResourceConfig,
  RoomConfig,
  ValidationResult,
} from "./ResourceConfig";
export {
  validateCharacterConfig,
  validateParticipantResourceConfig,
  validateRoomConfig,
} from "./ResourceConfig";
export type { ResourceLoaderOptions } from "./ResourceLoader";
// Loader
export { ResourceLoader } from "./ResourceLoader";
// Storage Implementations
export { ResourceStorage } from "./ResourceStorage";
export { ResourceStorageAPI } from "./ResourceStorageAPI";
