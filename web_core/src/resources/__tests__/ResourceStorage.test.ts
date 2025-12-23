import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { ResourceStorage } from "../ResourceStorage";
import type { ParticipantResourceConfig } from "../ResourceConfig";

describe("ResourceStorage", () => {
  let storage: ResourceStorage;
  const mockConfig: ParticipantResourceConfig = {
    version: "1.0.0",
    participantId: "test-participant-123",
    timestamp: Date.now(),
    character: {
      modelUrl: "https://example.com/model.glb",
      serializedData: { meshes: [], materials: [] },
      customization: {
        colors: { primary: "#ff0000" },
        accessories: ["hat"],
        animations: ["idle"],
      },
    },
    room: {
      serializedData: { meshes: [], lights: [] },
      environment: {
        furniture: [],
        decorations: [],
        wallMaterial: { color: "#ffffff" },
        floorMaterial: { color: "#cccccc" },
      },
      lighting: {
        preset: "bright",
        customLights: [],
      },
    },
  };

  beforeEach(() => {
    storage = new ResourceStorage();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("save", () => {
    test("should save config to localStorage", async () => {
      // Act
      await storage.save(mockConfig);

      // Assert
      const key = storage.getStorageKey(mockConfig.participantId);
      const stored = localStorage.getItem(key);
      expect(stored).toBeDefined();
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.participantId).toBe(mockConfig.participantId);
    });

    test("should overwrite existing config", async () => {
      await storage.save(mockConfig);

      const updatedConfig = {
        ...mockConfig,
        timestamp: Date.now() + 1000,
        character: {
          ...mockConfig.character,
          customization: {
            colors: { primary: "#0000ff" }, // Changed to blue
          },
        },
      };

      await storage.save(updatedConfig);

      const loaded = await storage.load(mockConfig.participantId);
      expect(loaded).toBeDefined();
      expect(loaded?.character.customization?.colors?.primary).toBe("#0000ff");
    });

    test("should handle large configs", async () => {
      const largeConfig = {
        ...mockConfig,
        character: {
          ...mockConfig.character,
          serializedData: {
            meshes: new Array(100).fill({ vertices: new Array(1000).fill(0) }),
          },
        },
      };

      // Should not throw
      await storage.save(largeConfig);
      const loaded = await storage.load(largeConfig.participantId);
      expect(loaded).not.toBeNull();
    });
  });

  describe("load", () => {
    test("should load existing config", async () => {
      await storage.save(mockConfig);

      const loaded = await storage.load(mockConfig.participantId);

      expect(loaded).toBeDefined();
      expect(loaded?.participantId).toBe(mockConfig.participantId);
      expect(loaded?.version).toBe(mockConfig.version);
    });

    test("should return null for non-existent config", async () => {
      const loaded = await storage.load("non-existent-id");

      expect(loaded).toBeNull();
    });

    test("should handle corrupted data gracefully", async () => {
      const key = storage.getStorageKey("corrupted-id");
      localStorage.setItem(key, "invalid json {{{");

      const loaded = await storage.load("corrupted-id");

      expect(loaded).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete existing config", async () => {
      await storage.save(mockConfig);

      await storage.delete(mockConfig.participantId);

      const loaded = await storage.load(mockConfig.participantId);
      expect(loaded).toBeNull();
    });

    test("should not throw when deleting non-existent config", async () => {
      // Should not throw
      await storage.delete("non-existent-id");
      // Verify it doesn't exist
      const exists = await storage.exists("non-existent-id");
      expect(exists).toBe(false);
    });
  });

  describe("exists", () => {
    test("should return true for existing config", async () => {
      await storage.save(mockConfig);

      const exists = await storage.exists(mockConfig.participantId);

      expect(exists).toBe(true);
    });

    test("should return false for non-existent config", async () => {
      const exists = await storage.exists("non-existent-id");

      expect(exists).toBe(false);
    });
  });

  describe("list", () => {
    test("should list all participant IDs", async () => {
      const config1 = { ...mockConfig, participantId: "user-1" };
      const config2 = { ...mockConfig, participantId: "user-2" };
      const config3 = { ...mockConfig, participantId: "user-3" };

      await storage.save(config1);
      await storage.save(config2);
      await storage.save(config3);

      const list = await storage.list();

      expect(list).toContain("user-1");
      expect(list).toContain("user-2");
      expect(list).toContain("user-3");
      expect(list.length).toBe(3);
    });

    test("should return empty array when no configs exist", async () => {
      const list = await storage.list();

      expect(list).toEqual([]);
    });

    test("should only list resource configs, not other localStorage items", async () => {
      localStorage.setItem("other-key", "other-value");
      await storage.save(mockConfig);

      const list = await storage.list();

      expect(list.length).toBe(1);
      expect(list[0]).toBe(mockConfig.participantId);
    });
  });

  describe("getStorageKey", () => {
    test("should generate consistent keys", () => {
      const key1 = storage.getStorageKey("test-id");
      const key2 = storage.getStorageKey("test-id");

      expect(key1).toBe(key2);
    });

    test("should generate unique keys for different IDs", () => {
      const key1 = storage.getStorageKey("test-id-1");
      const key2 = storage.getStorageKey("test-id-2");

      expect(key1).not.toBe(key2);
    });

    test("should include prefix for namespacing", () => {
      const key = storage.getStorageKey("test-id");

      expect(key).toContain("animal-zoom");
      expect(key).toContain("resource");
    });
  });
});
