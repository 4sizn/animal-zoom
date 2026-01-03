/**
 * Resource Storage Interface
 * Common interface for both localStorage and API-backed storage implementations
 */

import type { ParticipantResourceConfig } from './ResourceConfig';

/**
 * Interface for resource storage implementations
 * Allows swapping between localStorage, API, or hybrid storage
 */
export interface IResourceStorage {
  /**
   * Generates a storage key for a participant ID
   */
  getStorageKey(participantId: string): string;

  /**
   * Saves a participant resource configuration
   */
  save(config: ParticipantResourceConfig): Promise<void>;

  /**
   * Loads a participant resource configuration
   * Returns null if not found or corrupted
   */
  load(participantId: string): Promise<ParticipantResourceConfig | null>;

  /**
   * Deletes a participant resource configuration
   */
  delete(participantId: string): Promise<void>;

  /**
   * Checks if a configuration exists
   */
  exists(participantId: string): Promise<boolean>;

  /**
   * Lists all stored participant IDs
   */
  list(): Promise<string[]>;
}
