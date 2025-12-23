import { describe, expect, test } from "bun:test";
import {
  validateParticipantResourceConfig,
  validateCharacterConfig,
  validateRoomConfig,
  type ParticipantResourceConfig,
} from "../ResourceConfig";

describe("ResourceConfig", () => {
  const validConfig: ParticipantResourceConfig = {
    version: "1.0.0",
    participantId: "test-user-123",
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

  describe("validateParticipantResourceConfig", () => {
    test("should validate correct config", () => {
      const result = validateParticipantResourceConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject config without version", () => {
      const invalid = { ...validConfig, version: undefined };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("version is required");
    });

    test("should reject config without participantId", () => {
      const invalid = { ...validConfig, participantId: undefined };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("participantId is required");
    });

    test("should reject config without timestamp", () => {
      const invalid = { ...validConfig, timestamp: undefined };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("timestamp is required");
    });

    test("should reject config with invalid timestamp", () => {
      const invalid = { ...validConfig, timestamp: -1 };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes("timestamp"))).toBe(true);
    });

    test("should reject config without character", () => {
      const invalid = { ...validConfig, character: undefined };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("character is required");
    });

    test("should reject config without room", () => {
      const invalid = { ...validConfig, room: undefined };

      const result = validateParticipantResourceConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("room is required");
    });

    test("should validate semver version format", () => {
      const validVersions = ["1.0.0", "2.5.13", "0.0.1"];

      validVersions.forEach((version) => {
        const config = { ...validConfig, version };
        const result = validateParticipantResourceConfig(config);
        expect(result.valid).toBe(true);
      });
    });

    test("should reject invalid semver version format", () => {
      const invalidVersions = ["1.0", "v1.0.0", "1.0.0-beta", "invalid"];

      invalidVersions.forEach((version) => {
        const config = { ...validConfig, version };
        const result = validateParticipantResourceConfig(config);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe("validateCharacterConfig", () => {
    test("should validate correct character config", () => {
      const result = validateCharacterConfig(validConfig.character);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject character without modelUrl", () => {
      const invalid = { ...validConfig.character, modelUrl: undefined };

      const result = validateCharacterConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("modelUrl is required");
    });

    test("should reject character without serializedData", () => {
      const invalid = { ...validConfig.character, serializedData: undefined };

      const result = validateCharacterConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("serializedData is required");
    });

    test("should validate URL format for modelUrl", () => {
      const validUrls = [
        "https://example.com/model.glb",
        "http://localhost:3000/model.gltf",
        "https://cdn.example.com/models/character.glb",
      ];

      validUrls.forEach((modelUrl) => {
        const config = { ...validConfig.character, modelUrl };
        const result = validateCharacterConfig(config);
        expect(result.valid).toBe(true);
      });
    });

    test("should reject invalid URL format", () => {
      const invalidUrls = ["not-a-url", "ftp://example.com", "model.glb"];

      invalidUrls.forEach((modelUrl) => {
        const config = { ...validConfig.character, modelUrl };
        const result = validateCharacterConfig(config);
        expect(result.valid).toBe(false);
      });
    });

    test("should allow optional customization", () => {
      const config = {
        ...validConfig.character,
        customization: undefined,
      };

      const result = validateCharacterConfig(config as any);

      expect(result.valid).toBe(true);
    });
  });

  describe("validateRoomConfig", () => {
    test("should validate correct room config", () => {
      const result = validateRoomConfig(validConfig.room);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("should reject room without serializedData", () => {
      const invalid = { ...validConfig.room, serializedData: undefined };

      const result = validateRoomConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("serializedData is required");
    });

    test("should reject room without environment", () => {
      const invalid = { ...validConfig.room, environment: undefined };

      const result = validateRoomConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("environment is required");
    });

    test("should reject room without lighting", () => {
      const invalid = { ...validConfig.room, lighting: undefined };

      const result = validateRoomConfig(invalid as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("lighting is required");
    });

    test("should validate lighting preset is a string", () => {
      const config = {
        ...validConfig.room,
        lighting: { ...validConfig.room.lighting, preset: "" },
      };

      const result = validateRoomConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some(err => err.includes("preset"))).toBe(true);
    });

    test("should allow optional furniture and decorations", () => {
      const config = {
        ...validConfig.room,
        environment: {
          ...validConfig.room.environment,
          furniture: undefined,
          decorations: undefined,
        },
      };

      const result = validateRoomConfig(config as any);

      // Should still be valid as they're optional
      expect(result.valid).toBe(true);
    });
  });
});
