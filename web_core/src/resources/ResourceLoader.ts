/**
 * Resource loader with caching for participant configurations
 *
 * Implements LRU (Least Recently Used) caching strategy to improve performance
 * and reduce storage access.
 */

import type { ParticipantResourceConfig } from "./ResourceConfig";
import type { ResourceStorage } from "./ResourceStorage";
import { DefaultConfigs } from "./DefaultConfigs";

/**
 * Configuration options for ResourceLoader
 */
export interface ResourceLoaderOptions {
  /** Maximum number of configs to keep in cache (default: 50) */
  maxCacheSize?: number;
}

interface CacheEntry {
  config: ParticipantResourceConfig;
  accessTime: number;
}

/**
 * Manages loading and caching of participant resource configurations.
 * Uses LRU eviction strategy when cache is full.
 */
export class ResourceLoader {
  private storage: ResourceStorage;
  private cache: Map<string, CacheEntry>;
  private maxCacheSize: number;

  constructor(storage: ResourceStorage, options?: ResourceLoaderOptions) {
    this.storage = storage;
    this.cache = new Map();
    this.maxCacheSize = options?.maxCacheSize ?? 50;
  }

  /**
   * Loads a participant configuration, using cache when available.
   * Falls back to default config if not found or corrupted.
   *
   * @param participantId - The participant's unique identifier
   * @returns The participant's configuration
   */
  async loadParticipantConfig(
    participantId: string
  ): Promise<ParticipantResourceConfig> {
    // Check cache first
    const cached = this.cache.get(participantId);
    if (cached) {
      // Update access time for LRU
      cached.accessTime = Date.now();
      return cached.config;
    }

    // Cache miss - load from storage
    try {
      let config = await this.storage.load(participantId);

      // If not found or corrupted, use default
      if (!config) {
        console.warn(
          `Config not found for ${participantId}, using default config`
        );
        config = DefaultConfigs.getDefaultFullConfig(participantId);
      }

      // Add to cache
      this.addToCache(participantId, config);

      return config;
    } catch (error) {
      console.error(
        `Error loading config for ${participantId}, using default:`,
        error
      );
      const config = DefaultConfigs.getDefaultFullConfig(participantId);
      this.addToCache(participantId, config);
      return config;
    }
  }

  /**
   * Preloads multiple configurations into cache.
   * Useful for batch loading participants.
   *
   * @param participantIds - Array of participant IDs to preload
   */
  async preloadConfigs(participantIds: string[]): Promise<void> {
    await Promise.all(
      participantIds.map((id) => this.loadParticipantConfig(id))
    );
  }

  /**
   * Returns the current number of cached configurations.
   *
   * @returns Cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Clears all cached configurations, or a specific participant's cache.
   * @param participantId - Optional participant ID to clear specific cache entry
   */
  clearCache(participantId?: string): void {
    if (participantId) {
      this.cache.delete(participantId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get the underlying storage instance.
   * Useful for editors that need to save configs directly.
   * @returns The ResourceStorage instance
   */
  getStorage(): ResourceStorage {
    return this.storage;
  }

  /**
   * Adds a configuration to the cache, evicting LRU entry if cache is full.
   *
   * @param participantId - The participant's ID
   * @param config - The configuration to cache
   */
  private addToCache(
    participantId: string,
    config: ParticipantResourceConfig
  ): void {
    // If cache is full, evict least recently used
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLRU();
    }

    // Add to cache with current timestamp
    this.cache.set(participantId, {
      config,
      accessTime: Date.now(),
    });
  }

  /**
   * Evicts the least recently used entry from the cache.
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // Find the least recently used entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime;
        oldestKey = key;
      }
    }

    // Remove it
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
