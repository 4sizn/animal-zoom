/**
 * Resource storage abstraction using LocalStorage
 *
 * Provides CRUD operations for participant resource configurations,
 * with graceful error handling and corruption recovery.
 */

import type { IResourceStorage } from "./IResourceStorage";
import type { ParticipantResourceConfig } from "./ResourceConfig";

/**
 * Manages storage and retrieval of participant resource configurations using LocalStorage.
 */
export class ResourceStorage implements IResourceStorage {
  private readonly prefix = "animal-zoom:resource:";

  /**
   * Generates a storage key for a participant ID.
   *
   * @param participantId - The participant's unique identifier
   * @returns Prefixed storage key
   */
  getStorageKey(participantId: string): string {
    return `${this.prefix}${participantId}`;
  }

  /**
   * Saves a participant resource configuration to LocalStorage.
   *
   * @param config - The configuration to save
   * @throws Error if serialization or storage fails
   */
  async save(config: ParticipantResourceConfig): Promise<void> {
    try {
      const key = this.getStorageKey(config.participantId);
      const serialized = JSON.stringify(config);
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(
        `Failed to save config for ${config.participantId}: ${error}`,
      );
    }
  }

  /**
   * Loads a participant resource configuration from LocalStorage.
   *
   * @param participantId - The participant's unique identifier
   * @returns The configuration if found, null if not found or corrupted
   */
  async load(participantId: string): Promise<ParticipantResourceConfig | null> {
    try {
      const key = this.getStorageKey(participantId);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      return JSON.parse(stored) as ParticipantResourceConfig;
    } catch (error) {
      // Return null for corrupted data
      console.warn(
        `Failed to load config for ${participantId}, returning null:`,
        error,
      );
      return null;
    }
  }

  /**
   * Deletes a participant resource configuration from LocalStorage.
   *
   * @param participantId - The participant's unique identifier
   */
  async delete(participantId: string): Promise<void> {
    const key = this.getStorageKey(participantId);
    localStorage.removeItem(key);
  }

  /**
   * Checks if a configuration exists for a participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns True if configuration exists, false otherwise
   */
  async exists(participantId: string): Promise<boolean> {
    const key = this.getStorageKey(participantId);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Lists all stored participant IDs.
   *
   * @returns Array of participant IDs
   */
  async list(): Promise<string[]> {
    const participantIds: string[] = [];

    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(this.prefix)) {
        // Extract participant ID from key
        const participantId = key.substring(this.prefix.length);
        participantIds.push(participantId);
      }
    }

    return participantIds;
  }
}
