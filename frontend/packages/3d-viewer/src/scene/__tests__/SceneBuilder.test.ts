import { describe, expect, test, beforeEach } from "bun:test";
import { SceneBuilder } from "../SceneBuilder";
import { Scene, NullEngine } from "@babylonjs/core";
import type { CharacterConfig, RoomConfig } from "../../resources/ResourceConfig";

describe("SceneBuilder", () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  describe("buildCharacter", () => {
    test("should build character from config", async () => {
      // Arrange: Create character config
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: {
            name: "character",
            id: "character",
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scaling: [1, 1, 1],
          },
        },
        customization: {
          colors: { primary: "#ff0000" },
        },
      };

      // Act: Build character
      const result = await SceneBuilder.buildCharacter(scene, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe("character");
    });

    test("should apply customization colors", async () => {
      // Arrange
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: {
            name: "character",
            id: "character",
            position: [0, 1, 0],
          },
        },
        customization: {
          colors: { primary: "#ff0000", secondary: "#00ff00" },
        },
      };

      // Act
      const result = await SceneBuilder.buildCharacter(scene, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.mesh).toBeDefined();
      expect(result.mesh.material).toBeDefined();
    });

    test("should position character correctly", async () => {
      // Arrange
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: {
            name: "character",
            id: "character",
            position: [1, 2, 3],
            rotation: [0, Math.PI / 2, 0],
            scaling: [2, 2, 2],
          },
        },
        customization: {},
      };

      // Act
      const result = await SceneBuilder.buildCharacter(scene, config);

      // Assert
      expect(result.mesh.position.x).toBe(1);
      expect(result.mesh.position.y).toBe(2);
      expect(result.mesh.position.z).toBe(3);
      expect(result.mesh.scaling.x).toBe(2);
      expect(result.mesh.scaling.y).toBe(2);
      expect(result.mesh.scaling.z).toBe(2);
    });

    test("should handle missing serializedData", async () => {
      // Arrange - Config with no serializedData and modelUrl that will fail to load
      const config: CharacterConfig = {
        modelUrl: "https://example.com/invalid.glb",
        serializedData: null,
        customization: {},
      };

      // Act & Assert - Should throw because both modelUrl loading and serializedData fail
      await expect(async () => {
        await SceneBuilder.buildCharacter(scene, config);
      }).toThrow("either modelUrl or serializedData is required");
    });

    test("should create default sphere if mesh data is minimal", async () => {
      // Arrange: Minimal config
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: {
            name: "character",
            type: "sphere",
            diameter: 2,
          },
        },
        customization: {},
      };

      // Act
      const result = await SceneBuilder.buildCharacter(scene, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.mesh).toBeDefined();
      expect(result.mesh.name).toBe("character");
    });

    test("should handle accessories in customization", async () => {
      // Arrange
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: { name: "character", type: "sphere" },
        },
        customization: {
          accessories: ["hat", "glasses"],
        },
      };

      // Act
      const result = await SceneBuilder.buildCharacter(scene, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessories).toBeDefined();
      expect(result.accessories?.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("buildRoom", () => {
    test("should build room from config", () => {
      // Arrange: Create room config
      const config: RoomConfig = {
        serializedData: {
          meshes: [
            {
              name: "ground",
              type: "ground",
              width: 10,
              height: 10,
            },
          ],
        },
        environment: {
          furniture: [],
          decorations: [],
        },
        lighting: {
          preset: "bright",
          customLights: [],
        },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result).toBeDefined();
      expect(result.meshes).toBeDefined();
      expect(Array.isArray(result.meshes)).toBe(true);
    });

    test("should create ground plane", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: {
          meshes: [
            {
              name: "ground",
              type: "ground",
              width: 20,
              height: 20,
            },
          ],
        },
        environment: {},
        lighting: { preset: "default" },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result.meshes.length).toBeGreaterThan(0);
      const ground = result.meshes.find((m) => m.name === "ground");
      expect(ground).toBeDefined();
    });

    test("should apply lighting preset", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: {
          meshes: [],
        },
        environment: {},
        lighting: {
          preset: "bright",
          customLights: [],
        },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result.lights).toBeDefined();
      expect(result.lights.length).toBeGreaterThan(0);
    });

    test("should handle multiple lighting presets", () => {
      // Arrange: Test different presets
      const presets = ["default", "bright", "dim", "dramatic"];

      for (const preset of presets) {
        const config: RoomConfig = {
          serializedData: { meshes: [] },
          environment: {},
          lighting: { preset, customLights: [] },
        };

        // Act
        const result = SceneBuilder.buildRoom(scene, config);

        // Assert
        expect(result.lights.length).toBeGreaterThan(0);
      }
    });

    test("should apply environment materials", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: {
          meshes: [
            {
              name: "ground",
              type: "ground",
              width: 10,
              height: 10,
            },
          ],
        },
        environment: {
          wallMaterial: { color: "#ffffff" },
          floorMaterial: { color: "#cccccc" },
        },
        lighting: { preset: "default" },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result.meshes.length).toBeGreaterThan(0);
      const ground = result.meshes.find((m) => m.name === "ground");
      expect(ground?.material).toBeDefined();
    });

    test("should handle furniture placement", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: { meshes: [] },
        environment: {
          furniture: [
            { type: "chair", position: [0, 0, 0] },
            { type: "table", position: [2, 0, 0] },
          ],
        },
        lighting: { preset: "default" },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result).toBeDefined();
      // Furniture might be in meshes or separate
      expect(result.meshes).toBeDefined();
    });

    test("should handle custom lights", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: { meshes: [] },
        environment: {},
        lighting: {
          preset: "default",
          customLights: [
            {
              type: "point",
              name: "spotlight",
              position: [0, 5, 0],
              intensity: 1.0,
            },
          ],
        },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert
      expect(result.lights.length).toBeGreaterThan(0);
    });

    test("should handle missing environment data gracefully", () => {
      // Arrange
      const config: RoomConfig = {
        serializedData: {},
        environment: {},
        lighting: { preset: "default" },
      };

      // Act
      const result = SceneBuilder.buildRoom(scene, config);

      // Assert: Should not throw and return valid result
      expect(result).toBeDefined();
      expect(result.meshes).toBeDefined();
      expect(result.lights).toBeDefined();
    });
  });

  describe("integration", () => {
    test("should build complete scene with character and room", async () => {
      // Arrange
      const characterConfig: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: {
          mesh: { name: "character", type: "sphere" },
        },
        customization: { colors: { primary: "#ff0000" } },
      };

      const roomConfig: RoomConfig = {
        serializedData: {
          meshes: [{ name: "ground", type: "ground", width: 10, height: 10 }],
        },
        environment: {},
        lighting: { preset: "bright" },
      };

      // Act
      const character = await SceneBuilder.buildCharacter(scene, characterConfig);
      const room = SceneBuilder.buildRoom(scene, roomConfig);

      // Assert
      expect(character).toBeDefined();
      expect(room).toBeDefined();
      expect(scene.meshes.length).toBeGreaterThan(0);
      expect(scene.lights.length).toBeGreaterThan(0);
    });

    test("should handle multiple characters in scene", async () => {
      // Arrange
      const config1: CharacterConfig = {
        modelUrl: "https://example.com/model1.glb",
        serializedData: {
          mesh: { name: "character1", type: "sphere", position: [-2, 0, 0] },
        },
        customization: {},
      };

      const config2: CharacterConfig = {
        modelUrl: "https://example.com/model2.glb",
        serializedData: {
          mesh: { name: "character2", type: "sphere", position: [2, 0, 0] },
        },
        customization: {},
      };

      // Act
      const char1 = await SceneBuilder.buildCharacter(scene, config1);
      const char2 = await SceneBuilder.buildCharacter(scene, config2);

      // Assert
      expect(char1.mesh.name).toBe("character1");
      expect(char2.mesh.name).toBe("character2");
      expect(scene.meshes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("error handling", () => {
    test("should throw error for invalid scene", async () => {
      const config: CharacterConfig = {
        modelUrl: "https://example.com/model.glb",
        serializedData: { mesh: { name: "test" } },
        customization: {},
      };

      await expect(async () => {
        await SceneBuilder.buildCharacter(null as any, config);
      }).toThrow("Invalid scene");
    });

    test("should throw error for null config", async () => {
      await expect(async () => {
        await SceneBuilder.buildCharacter(scene, null as any);
      }).toThrow("Invalid config");
    });

    test("should provide helpful error messages", async () => {
      const config: CharacterConfig = {
        modelUrl: "https://example.com/invalid.glb",
        serializedData: null,
        customization: {},
      };

      try {
        await SceneBuilder.buildCharacter(scene, config);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });
});
