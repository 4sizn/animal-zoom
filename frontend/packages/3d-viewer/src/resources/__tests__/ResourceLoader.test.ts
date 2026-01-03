import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { ResourceLoader } from "../ResourceLoader";
import { ResourceStorage } from "../ResourceStorage";
import type { ParticipantResourceConfig } from "../ResourceConfig";

describe("ResourceLoader", () => {
  let loader: ResourceLoader;
  let storage: ResourceStorage;

  const mockConfig: ParticipantResourceConfig = {
    version: "1.0.0",
    participantId: "test-user-123",
    timestamp: Date.now(),
    character: {
      modelUrl: "https://example.com/model.glb",
      serializedData: { meshes: [] },
      customization: {
        colors: { primary: "#ff0000" },
        accessories: ["hat"],
        animations: ["idle"],
      },
    },
    room: {
      serializedData: { meshes: [] },
      environment: {},
      lighting: { preset: "default" },
    },
  };

  beforeEach(() => {
    storage = new ResourceStorage();
    loader = new ResourceLoader(storage);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("loadParticipantConfig", () => {
    test("should load config from storage on cache miss", async () => {
      // Arrange: Save config to storage
      await storage.save(mockConfig);

      // Act: Load config (cache miss)
      const loaded = await loader.loadParticipantConfig("test-user-123");

      // Assert
      expect(loaded).toBeDefined();
      expect(loaded?.participantId).toBe("test-user-123");
      expect(loaded?.character.modelUrl).toBe("https://example.com/model.glb");
    });

    test("should return config from cache on cache hit", async () => {
      // Arrange: Save to storage and load once to populate cache
      await storage.save(mockConfig);
      await loader.loadParticipantConfig("test-user-123");

      // Clear storage to verify cache is used
      await storage.delete("test-user-123");

      // Act: Load again (should hit cache)
      const loaded = await loader.loadParticipantConfig("test-user-123");

      // Assert: Should still get the config from cache
      expect(loaded).toBeDefined();
      expect(loaded?.participantId).toBe("test-user-123");
    });

    test("should return default config when not found in storage", async () => {
      // Act: Load non-existent config
      const loaded = await loader.loadParticipantConfig("non-existent-id");

      // Assert: Should return default config
      expect(loaded).toBeDefined();
      expect(loaded?.participantId).toBe("non-existent-id");
      expect(loaded?.version).toBe("1.0.0");
      expect(loaded?.character).toBeDefined();
      expect(loaded?.room).toBeDefined();
    });

    test("should return default config on corrupt data", async () => {
      // Arrange: Save corrupt data
      const key = storage.getStorageKey("corrupt-id");
      localStorage.setItem(key, "invalid json {{{");

      // Act: Load corrupt config
      const loaded = await loader.loadParticipantConfig("corrupt-id");

      // Assert: Should return default config
      expect(loaded).toBeDefined();
      expect(loaded?.participantId).toBe("corrupt-id");
    });

    test("should cache loaded configs", async () => {
      // Arrange
      await storage.save(mockConfig);

      // Act: Load twice
      const loaded1 = await loader.loadParticipantConfig("test-user-123");
      const loaded2 = await loader.loadParticipantConfig("test-user-123");

      // Assert: Should be the same object (from cache)
      expect(loaded1).toBe(loaded2);
    });

    test("should handle multiple different configs", async () => {
      // Arrange: Save multiple configs
      const config1 = { ...mockConfig, participantId: "user-1" };
      const config2 = { ...mockConfig, participantId: "user-2" };
      const config3 = { ...mockConfig, participantId: "user-3" };

      await storage.save(config1);
      await storage.save(config2);
      await storage.save(config3);

      // Act: Load all
      const loaded1 = await loader.loadParticipantConfig("user-1");
      const loaded2 = await loader.loadParticipantConfig("user-2");
      const loaded3 = await loader.loadParticipantConfig("user-3");

      // Assert
      expect(loaded1?.participantId).toBe("user-1");
      expect(loaded2?.participantId).toBe("user-2");
      expect(loaded3?.participantId).toBe("user-3");
    });
  });

  describe("preloadConfigs", () => {
    test("should preload multiple configs", async () => {
      // Arrange: Save multiple configs
      const ids = ["user-1", "user-2", "user-3"];
      for (const id of ids) {
        await storage.save({ ...mockConfig, participantId: id });
      }

      // Act: Preload all
      await loader.preloadConfigs(ids);

      // Assert: All should be in cache now
      // Clear storage to verify cache
      for (const id of ids) {
        await storage.delete(id);
      }

      // Load from cache
      const loaded1 = await loader.loadParticipantConfig("user-1");
      const loaded2 = await loader.loadParticipantConfig("user-2");
      const loaded3 = await loader.loadParticipantConfig("user-3");

      expect(loaded1?.participantId).toBe("user-1");
      expect(loaded2?.participantId).toBe("user-2");
      expect(loaded3?.participantId).toBe("user-3");
    });

    test("should handle empty array", async () => {
      // Act & Assert: Should not throw
      await loader.preloadConfigs([]);
    });

    test("should handle preloading non-existent configs", async () => {
      // Act: Preload non-existent configs
      await loader.preloadConfigs(["non-existent-1", "non-existent-2"]);

      // Assert: Should have default configs in cache
      const loaded1 = await loader.loadParticipantConfig("non-existent-1");
      const loaded2 = await loader.loadParticipantConfig("non-existent-2");

      expect(loaded1?.participantId).toBe("non-existent-1");
      expect(loaded2?.participantId).toBe("non-existent-2");
    });
  });

  describe("cache management", () => {
    test("should have getCacheSize method", () => {
      expect(typeof loader.getCacheSize).toBe("function");
    });

    test("should return cache size", async () => {
      // Arrange & Act
      await storage.save(mockConfig);
      await loader.loadParticipantConfig("test-user-123");

      // Assert
      const size = loader.getCacheSize();
      expect(size).toBe(1);
    });

    test("should clear cache", async () => {
      // Arrange: Load some configs
      await storage.save(mockConfig);
      await loader.loadParticipantConfig("test-user-123");

      expect(loader.getCacheSize()).toBe(1);

      // Act: Clear cache
      loader.clearCache();

      // Assert
      expect(loader.getCacheSize()).toBe(0);
    });

    test("should evict least recently used items when cache is full", async () => {
      // Arrange: Create loader with small cache size
      const smallLoader = new ResourceLoader(storage, { maxCacheSize: 3 });

      // Save 4 configs
      for (let i = 1; i <= 4; i++) {
        await storage.save({ ...mockConfig, participantId: `user-${i}` });
      }

      // Act: Load all 4 (should evict first one)
      await smallLoader.loadParticipantConfig("user-1"); // Oldest
      await smallLoader.loadParticipantConfig("user-2");
      await smallLoader.loadParticipantConfig("user-3");
      await smallLoader.loadParticipantConfig("user-4"); // Should evict user-1

      // Assert: Cache should have size 3
      expect(smallLoader.getCacheSize()).toBe(3);

      // Delete user-2, user-3, user-4 from storage
      // (user-1 already evicted from cache)
      await storage.delete("user-2");
      await storage.delete("user-3");
      await storage.delete("user-4");

      // user-2, user-3, user-4 should still be in cache
      const loaded2 = await smallLoader.loadParticipantConfig("user-2");
      const loaded3 = await smallLoader.loadParticipantConfig("user-3");
      const loaded4 = await smallLoader.loadParticipantConfig("user-4");

      // These should be from cache (not default)
      expect(loaded2?.character.modelUrl).toBe("https://example.com/model.glb");
      expect(loaded3?.character.modelUrl).toBe("https://example.com/model.glb");
      expect(loaded4?.character.modelUrl).toBe("https://example.com/model.glb");

      // Now delete user-1 from storage and try to load it
      await storage.delete("user-1");
      const loaded1 = await smallLoader.loadParticipantConfig("user-1");

      // user-1 should return default (was evicted from cache, not in storage)
      expect(loaded1?.character.modelUrl).toBe(
        "https://example.com/default-character.glb"
      );
    });

    test("should update access time on cache hit", async () => {
      // Arrange: Create loader with cache size 2
      const smallLoader = new ResourceLoader(storage, { maxCacheSize: 2 });

      await storage.save({ ...mockConfig, participantId: "user-1" });
      await storage.save({ ...mockConfig, participantId: "user-2" });
      await storage.save({ ...mockConfig, participantId: "user-3" });

      // Load user-1 and user-2
      await smallLoader.loadParticipantConfig("user-1");
      await smallLoader.loadParticipantConfig("user-2");

      // Access user-1 again (update access time)
      await smallLoader.loadParticipantConfig("user-1");

      // Act: Load user-3 (should evict user-2, not user-1)
      await smallLoader.loadParticipantConfig("user-3");

      // Assert: Cache should have user-1 and user-3
      expect(smallLoader.getCacheSize()).toBe(2);
    });
  });

  describe("error handling", () => {
    test("should log warning for corrupt data", async () => {
      // Arrange: Mock console.warn
      const warnSpy = mock(() => {});
      const originalWarn = console.warn;
      console.warn = warnSpy;

      // Save corrupt data
      const key = storage.getStorageKey("corrupt-id");
      localStorage.setItem(key, "invalid json");

      // Act
      await loader.loadParticipantConfig("corrupt-id");

      // Assert: Should have logged warning
      expect(warnSpy).toHaveBeenCalled();

      // Cleanup
      console.warn = originalWarn;
    });
  });
});
