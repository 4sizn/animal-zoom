import { describe, expect, test, beforeEach } from "bun:test";
import { ResourceSerializer } from "../ResourceSerializer";
import { Scene, NullEngine, Mesh, StandardMaterial, Color3, HemisphericLight, Vector3 } from "@babylonjs/core";

describe("ResourceSerializer", () => {
  let engine: NullEngine;
  let scene: Scene;

  beforeEach(() => {
    // Use NullEngine which doesn't require WebGL
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  describe("serializeCharacter", () => {
    test("should serialize a simple mesh with material", () => {
      // Arrange: Create a simple character mesh
      const sphere = Mesh.CreateSphere("character", 16, 2, scene);
      const material = new StandardMaterial("characterMat", scene);
      material.diffuseColor = new Color3(1, 0, 0); // Red
      sphere.material = material;

      const customization = {
        colors: { primary: "#ff0000" },
        accessories: ["hat"],
        animations: ["idle"],
      };

      // Act: Serialize the character
      const result = ResourceSerializer.serializeCharacter(
        sphere,
        "https://example.com/model.glb",
        customization
      );

      // Assert: Check structure
      expect(result).toBeDefined();
      expect(result.modelUrl).toBe("https://example.com/model.glb");
      expect(result.serializedData).toBeDefined();
      expect(result.customization).toEqual(customization);
    });

    test("should handle mesh without material", () => {
      const sphere = Mesh.CreateSphere("character", 16, 2, scene);

      const result = ResourceSerializer.serializeCharacter(
        sphere,
        "https://example.com/model.glb",
        {}
      );

      expect(result).toBeDefined();
      expect(result.serializedData).toBeDefined();
    });

    test("should throw error for invalid mesh", () => {
      expect(() => {
        ResourceSerializer.serializeCharacter(
          null as any,
          "https://example.com/model.glb",
          {}
        );
      }).toThrow();
    });
  });

  describe("serializeRoom", () => {
    test("should serialize room with environment and lighting", () => {
      // Arrange: Create room environment
      Mesh.CreateGround("ground", 10, 10, 2, scene);
      Mesh.CreateBox("wall", 1, scene);
      new HemisphericLight("light", new Vector3(0, 1, 0), scene);

      const environment = {
        furniture: [{ type: "chair", position: [0, 0, 0] }],
        decorations: [{ type: "plant", position: [1, 0, 1] }],
        wallMaterial: { color: "#ffffff" },
        floorMaterial: { color: "#cccccc" },
      };

      const lighting = {
        preset: "bright",
        customLights: [],
      };

      // Act
      const result = ResourceSerializer.serializeRoom(
        scene,
        environment,
        lighting
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.serializedData).toBeDefined();
      expect(result.environment).toEqual(environment);
      expect(result.lighting).toEqual(lighting);
    });

    test("should handle empty scene", () => {
      const emptyScene = new Scene(engine);

      const result = ResourceSerializer.serializeRoom(
        emptyScene,
        {},
        { preset: "default" }
      );

      expect(result).toBeDefined();
      expect(result.serializedData).toBeDefined();
    });
  });

  describe("deserializeCharacter", () => {
    test("should deserialize and recreate character mesh", () => {
      // Arrange: First serialize a character
      const sphere = Mesh.CreateSphere("character", 16, 2, scene);
      const material = new StandardMaterial("characterMat", scene);
      material.diffuseColor = new Color3(1, 0, 0);
      sphere.material = material;

      const serialized = ResourceSerializer.serializeCharacter(
        sphere,
        "https://example.com/model.glb",
        { colors: { primary: "#ff0000" } }
      );

      // Create new scene for deserialization
      const newScene = new Scene(engine);

      // Act: Deserialize
      const result = ResourceSerializer.deserializeCharacter(
        newScene,
        serialized
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("character");
      expect(result.material).toBeDefined();
    });

    test("should throw error for invalid serialized data", () => {
      expect(() => {
        ResourceSerializer.deserializeCharacter(scene, {
          modelUrl: "",
          serializedData: null,
          customization: {},
        });
      }).toThrow();
    });
  });

  describe("deserializeRoom", () => {
    test("should deserialize and recreate room environment", () => {
      // Arrange: Serialize a room
      Mesh.CreateGround("ground", 10, 10, 2, scene);
      const serialized = ResourceSerializer.serializeRoom(
        scene,
        { furniture: [], decorations: [] },
        { preset: "default" }
      );

      // Create new scene and add a mesh to it before deserializing
      const newScene = new Scene(engine);

      // Act
      const result = ResourceSerializer.deserializeRoom(newScene, serialized);

      // Assert
      expect(result).toBeDefined();
      expect(result.meshes).toBeDefined();
      // Since deserialization is simplified for now, we just check the structure
      expect(Array.isArray(result.meshes)).toBe(true);
    });

    test("should handle missing environment data", () => {
      const result = ResourceSerializer.deserializeRoom(scene, {
        serializedData: {},
        environment: {},
        lighting: { preset: "default" },
      });

      expect(result).toBeDefined();
    });
  });
});
