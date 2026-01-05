import { describe, expect, test } from "bun:test";
import { DefaultConfigs } from "../DefaultConfigs";
import type { ParticipantResourceConfig } from "../ResourceConfig";

describe("DefaultConfigs", () => {
  describe("getDefaultCharacterConfig", () => {
    test("should return valid character config", () => {
      const config = DefaultConfigs.getDefaultCharacterConfig("test-user-123");

      expect(config).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.participantId).toBe("test-user-123");
      expect(config.timestamp).toBeGreaterThan(0);
    });

    test("should have valid character data", () => {
      const config = DefaultConfigs.getDefaultCharacterConfig("test-user-123");

      expect(config.character).toBeDefined();
      expect(config.character.modelUrl).toBeDefined();
      expect(typeof config.character.modelUrl).toBe("string");
      expect(config.character.serializedData).toBeDefined();
      expect(config.character.customization).toBeDefined();
    });

    test("should have default customization options", () => {
      const config = DefaultConfigs.getDefaultCharacterConfig("test-user-123");

      const { customization } = config.character;
      expect(customization.colors).toBeDefined();
      expect(customization.accessories).toBeDefined();
      expect(Array.isArray(customization.accessories)).toBe(true);
      expect(customization.animations).toBeDefined();
      expect(Array.isArray(customization.animations)).toBe(true);
    });

    test("should generate unique configs for different participants", () => {
      const config1 = DefaultConfigs.getDefaultCharacterConfig("user-1");
      const config2 = DefaultConfigs.getDefaultCharacterConfig("user-2");

      expect(config1.participantId).not.toBe(config2.participantId);
      expect(config1.participantId).toBe("user-1");
      expect(config2.participantId).toBe("user-2");
    });
  });

  describe("getDefaultRoomConfig", () => {
    test("should return valid room config", () => {
      const config = DefaultConfigs.getDefaultRoomConfig("test-user-123");

      expect(config).toBeDefined();
      expect(config.version).toBeDefined();
      expect(config.participantId).toBe("test-user-123");
      expect(config.timestamp).toBeGreaterThan(0);
    });

    test("should have valid room data", () => {
      const config = DefaultConfigs.getDefaultRoomConfig("test-user-123");

      expect(config.room).toBeDefined();
      expect(config.room.serializedData).toBeDefined();
      expect(config.room.environment).toBeDefined();
      expect(config.room.lighting).toBeDefined();
    });

    test("should have default environment setup", () => {
      const config = DefaultConfigs.getDefaultRoomConfig("test-user-123");

      const { environment } = config.room;
      expect(environment.furniture).toBeDefined();
      expect(Array.isArray(environment.furniture)).toBe(true);
      expect(environment.decorations).toBeDefined();
      expect(Array.isArray(environment.decorations)).toBe(true);
      expect(environment.wallMaterial).toBeDefined();
      expect(environment.floorMaterial).toBeDefined();
    });

    test("should have default lighting preset", () => {
      const config = DefaultConfigs.getDefaultRoomConfig("test-user-123");

      const { lighting } = config.room;
      expect(lighting.preset).toBeDefined();
      expect(typeof lighting.preset).toBe("string");
      expect(lighting.customLights).toBeDefined();
      expect(Array.isArray(lighting.customLights)).toBe(true);
    });
  });

  describe("getDefaultFullConfig", () => {
    test("should return complete config with both character and room", () => {
      const config = DefaultConfigs.getDefaultFullConfig("test-user-123");

      expect(config).toBeDefined();
      expect(config.participantId).toBe("test-user-123");
      expect(config.character).toBeDefined();
      expect(config.room).toBeDefined();
    });

    test("should have valid version and timestamp", () => {
      const config = DefaultConfigs.getDefaultFullConfig("test-user-123");

      expect(config.version).toBeDefined();
      expect(config.version).toMatch(/^\d+\.\d+\.\d+$/); // Semver format
      expect(config.timestamp).toBeGreaterThan(0);
      expect(config.timestamp).toBeLessThanOrEqual(Date.now());
    });

    test("should be serializable to JSON", () => {
      const config = DefaultConfigs.getDefaultFullConfig("test-user-123");

      const json = JSON.stringify(config);
      const parsed = JSON.parse(json);

      expect(parsed).toEqual(config);
    });

    test("should conform to ParticipantResourceConfig type", () => {
      const config = DefaultConfigs.getDefaultFullConfig("test-user-123");

      // Type assertion to verify structure
      const validated: ParticipantResourceConfig = config;

      expect(validated.version).toBeDefined();
      expect(validated.participantId).toBeDefined();
      expect(validated.timestamp).toBeDefined();
      expect(validated.character).toBeDefined();
      expect(validated.room).toBeDefined();
    });
  });

  describe("config consistency", () => {
    test("should maintain same version across all default configs", () => {
      const charConfig = DefaultConfigs.getDefaultCharacterConfig("user-1");
      const roomConfig = DefaultConfigs.getDefaultRoomConfig("user-1");
      const fullConfig = DefaultConfigs.getDefaultFullConfig("user-1");

      expect(charConfig.version).toBe(roomConfig.version);
      expect(charConfig.version).toBe(fullConfig.version);
    });

    test("should generate fresh timestamps for each call", async () => {
      const config1 = DefaultConfigs.getDefaultFullConfig("user-1");

      // Wait a small amount of time
      await new Promise((resolve) => setTimeout(resolve, 10));

      const config2 = DefaultConfigs.getDefaultFullConfig("user-1");

      expect(config2.timestamp).toBeGreaterThanOrEqual(config1.timestamp);
    });
  });
});
