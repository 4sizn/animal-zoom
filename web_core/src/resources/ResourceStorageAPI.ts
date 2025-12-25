/**
 * API-backed Resource Storage
 * Stores participant configurations on the API server instead of localStorage
 */

import { avatarApi } from '../api';
import type { ParticipantResourceConfig } from './ResourceConfig';
import type { AvatarConfig } from '../api/types';
import type { IResourceStorage } from './IResourceStorage';

/**
 * Maps API AvatarConfig to local CharacterConfig customization
 */
function mapAvatarConfigToCustomization(avatar: AvatarConfig | undefined): {
  colors?: Record<string, string>;
  accessories?: string[];
  animations?: string[];
} {
  if (!avatar) {
    return {
      colors: {},
      accessories: [],
      animations: [],
    };
  }

  return {
    colors: {
      primary: avatar.primaryColor,
      secondary: avatar.secondaryColor,
    },
    accessories: avatar.accessories || [],
    animations: [],
  };
}

/**
 * Maps local CharacterConfig customization to API AvatarConfig
 */
function mapCustomizationToAvatarConfig(
  customization: any,
  modelUrl: string
): AvatarConfig {
  return {
    modelUrl: modelUrl || '',
    primaryColor: customization?.colors?.primary || '#ffffff',
    secondaryColor: customization?.colors?.secondary || '#000000',
    accessories: customization?.accessories || [],
  };
}

/**
 * API-backed implementation of ResourceStorage
 * Stores configurations on the server, with localStorage fallback for offline support
 */
export class ResourceStorageAPI implements IResourceStorage {
  private readonly prefix = 'animal-zoom:resource:';

  /**
   * Generates a storage key for a participant ID
   */
  getStorageKey(participantId: string): string {
    return `${this.prefix}${participantId}`;
  }

  /**
   * Saves a participant resource configuration to the API server
   * Also caches in localStorage for offline access
   */
  async save(config: ParticipantResourceConfig): Promise<void> {
    try {
      // Convert to API format and save avatar config
      const avatarConfig = mapCustomizationToAvatarConfig(
        config.character.customization,
        config.character.modelUrl
      );

      await avatarApi.updateMyAvatar(avatarConfig);

      // Also save to localStorage as cache
      const key = this.getStorageKey(config.participantId);
      localStorage.setItem(key, JSON.stringify(config));

      console.log(`✅ Saved config for ${config.participantId} to API`);
    } catch (error) {
      console.error(`Failed to save config to API for ${config.participantId}:`, error);

      // Fallback: save to localStorage only
      const key = this.getStorageKey(config.participantId);
      localStorage.setItem(key, JSON.stringify(config));

      console.warn(`⚠️ Saved config for ${config.participantId} to localStorage only`);
    }
  }

  /**
   * Loads a participant resource configuration from the API server
   * Falls back to localStorage if API is unavailable
   */
  async load(participantId: string): Promise<ParticipantResourceConfig | null> {
    try {
      // Try to load from API first
      const avatarConfig = await avatarApi.getMyAvatar();

      // Convert API format to local format
      const config: ParticipantResourceConfig = {
        version: '1.0.0',
        participantId,
        timestamp: Date.now(),
        character: {
          modelUrl: avatarConfig.modelUrl,
          serializedData: null,
          customization: mapAvatarConfigToCustomization(avatarConfig),
        },
        room: {
          serializedData: null,
          environment: {
            furniture: [],
            decorations: [],
          },
          lighting: {
            preset: 'default',
          },
        },
      };

      // Cache in localStorage
      const key = this.getStorageKey(participantId);
      localStorage.setItem(key, JSON.stringify(config));

      return config;
    } catch (error) {
      console.warn(`Failed to load config from API for ${participantId}, trying localStorage:`, error);

      // Fallback: try localStorage
      const key = this.getStorageKey(participantId);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      try {
        return JSON.parse(stored) as ParticipantResourceConfig;
      } catch (parseError) {
        console.error(`Failed to parse cached config for ${participantId}:`, parseError);
        return null;
      }
    }
  }

  /**
   * Deletes a participant resource configuration from both API and localStorage
   */
  async delete(participantId: string): Promise<void> {
    // Remove from localStorage
    const key = this.getStorageKey(participantId);
    localStorage.removeItem(key);

    // Note: We don't delete from API as that would affect the user's avatar
    // This method is mainly for cleaning up local cache
    console.log(`Deleted local cache for ${participantId}`);
  }

  /**
   * Checks if a configuration exists in localStorage cache
   * Note: This doesn't check the API, only local cache
   */
  async exists(participantId: string): Promise<boolean> {
    const key = this.getStorageKey(participantId);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Lists all stored participant IDs from localStorage cache
   */
  async list(): Promise<string[]> {
    const participantIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(this.prefix)) {
        const participantId = key.substring(this.prefix.length);
        participantIds.push(participantId);
      }
    }

    return participantIds;
  }

  /**
   * Syncs configuration from API to localStorage cache
   * Useful for refreshing local cache
   */
  async sync(participantId: string): Promise<void> {
    try {
      const config = await this.load(participantId);
      if (config) {
        const key = this.getStorageKey(participantId);
        localStorage.setItem(key, JSON.stringify(config));
        console.log(`✅ Synced config for ${participantId}`);
      }
    } catch (error) {
      console.error(`Failed to sync config for ${participantId}:`, error);
    }
  }

  /**
   * Clears all cached configurations from localStorage
   */
  async clearCache(): Promise<void> {
    const keys = await this.list();
    keys.forEach((participantId) => {
      const key = this.getStorageKey(participantId);
      localStorage.removeItem(key);
    });
    console.log(`Cleared ${keys.length} cached configurations`);
  }
}

export default ResourceStorageAPI;
