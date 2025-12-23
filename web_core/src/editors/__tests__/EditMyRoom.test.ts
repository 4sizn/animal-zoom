import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { EditMyRoom } from "../EditMyRoom";
import { ResourceLoader } from "../../resources/ResourceLoader";
import { ResourceStorage } from "../../resources/ResourceStorage";
import { NullEngine } from "@babylonjs/core";
import type { ParticipantResourceConfig } from "../../resources/ResourceConfig";

describe("EditMyRoom", () => {
  let editor: EditMyRoom;
  let canvas: HTMLCanvasElement;
  let storage: ResourceStorage;
  let loader: ResourceLoader;
  let engine: NullEngine;
  const testParticipantId = "test-user-1";

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="editor-container"></div>
      <div id="editor-ui"></div>
    `;

    // Create canvas
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Setup storage and loader
    storage = new ResourceStorage();
    loader = new ResourceLoader(storage);

    // Use NullEngine for testing
    engine = new NullEngine();

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    if (editor) {
      editor.dispose();
    }
    document.body.innerHTML = "";
    localStorage.clear();
  });

  describe("initialization", () => {
    test("should create EditMyRoom editor", () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);

      expect(editor).toBeDefined();
      expect(editor.getScene()).toBeDefined();
    });

    test("should initialize scene with camera", () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      expect(scene.cameras.length).toBeGreaterThan(0);
    });

    test("should initialize scene with lighting", () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      expect(scene.lights.length).toBeGreaterThan(0);
    });

    test("should initialize scene with room meshes", () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      expect(scene.meshes.length).toBeGreaterThan(0);
    });
  });

  describe("room environment loading", () => {
    test("should load room from existing config", async () => {
      // Arrange: Save existing config
      const existingConfig: ParticipantResourceConfig = {
        version: "1.0.0",
        participantId: testParticipantId,
        timestamp: Date.now(),
        character: {
          modelUrl: "",
          serializedData: { mesh: { name: "character", type: "sphere" } },
          customization: {},
        },
        room: {
          serializedData: {
            meshes: [
              {
                name: "ground",
                type: "ground",
                width: 15,
                height: 15,
              },
            ],
          },
          environment: {
            furniture: ["chair"],
            wallMaterial: { color: "#ffffff" },
            floorMaterial: { color: "#cccccc" },
          },
          lighting: { preset: "bright", customLights: [] },
        },
      };
      await storage.save(existingConfig);

      // Act
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Assert
      const room = editor.getRoomMeshes();
      expect(room).toBeDefined();
      expect(Array.isArray(room)).toBe(true);
      expect(room.length).toBeGreaterThan(0);
    });

    test("should create default room if no config exists", async () => {
      // Act: Create editor without saved config
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Assert
      const room = editor.getRoomMeshes();
      expect(room).toBeDefined();
      expect(Array.isArray(room)).toBe(true);
    });

    test("should handle loading errors gracefully", async () => {
      // Arrange: Create corrupted config
      localStorage.setItem(
        "animal-zoom:resource:corrupt-user",
        "invalid json"
      );

      // Act & Assert: Should not throw
      editor = new EditMyRoom(canvas, loader, "corrupt-user", engine);
      await editor.loadRoom();

      const room = editor.getRoomMeshes();
      expect(room).toBeDefined();
    });
  });

  describe("lighting preset changes", () => {
    test("should get current lighting preset", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const preset = editor.getLightingPreset();
      expect(preset).toBeDefined();
      expect(typeof preset).toBe("string");
    });

    test("should set lighting preset to 'bright'", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setLightingPreset("bright");

      // Assert
      expect(editor.getLightingPreset()).toBe("bright");
    });

    test("should set lighting preset to 'dim'", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setLightingPreset("dim");

      // Assert
      expect(editor.getLightingPreset()).toBe("dim");
    });

    test("should set lighting preset to 'dramatic'", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setLightingPreset("dramatic");

      // Assert
      expect(editor.getLightingPreset()).toBe("dramatic");
    });

    test("should update scene lights when preset changes", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setLightingPreset("dramatic");

      // Assert: Lights should be updated
      const newLightCount = editor.getScene().lights.length;
      expect(newLightCount).toBeGreaterThan(0);
    });
  });

  describe("wall and floor customization", () => {
    test("should get wall color", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const color = editor.getWallColor();
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test("should set wall color", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setWallColor("#ff0000");

      // Assert
      expect(editor.getWallColor()).toBe("#ff0000");
    });

    test("should get floor color", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const color = editor.getFloorColor();
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test("should set floor color", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setFloorColor("#00ff00");

      // Assert
      expect(editor.getFloorColor()).toBe("#00ff00");
    });

    test("should apply floor color to ground mesh", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act
      editor.setFloorColor("#0000ff");

      // Assert
      const ground = editor.getScene().getMeshByName("ground");
      expect(ground).toBeDefined();
      expect(ground?.material).toBeDefined();
    });
  });

  describe("furniture placement (optional)", () => {
    test("should get furniture list", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const furniture = editor.getFurniture();
      expect(Array.isArray(furniture)).toBe(true);
    });

    test("should add furniture item", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const initialCount = editor.getFurniture().length;

      // Act
      editor.addFurniture("chair");

      // Assert
      expect(editor.getFurniture().length).toBe(initialCount + 1);
      expect(editor.getFurniture()).toContain("chair");
    });

    test("should remove furniture item", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Arrange
      editor.addFurniture("chair");
      expect(editor.getFurniture()).toContain("chair");

      // Act
      editor.removeFurniture("chair");

      // Assert
      expect(editor.getFurniture()).not.toContain("chair");
    });
  });

  describe("save functionality", () => {
    test("should serialize room config on save", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Arrange: Make some changes
      editor.setLightingPreset("bright");
      editor.setWallColor("#aabbcc");
      editor.setFloorColor("#ddeeff");

      // Act
      await editor.save();

      // Assert: Config should be saved to storage
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig).toBeDefined();
      expect(savedConfig?.room.lighting.preset).toBe("bright");
      expect(savedConfig?.room.environment?.wallMaterial?.color).toBe("#aabbcc");
      expect(savedConfig?.room.environment?.floorMaterial?.color).toBe("#ddeeff");
    });

    test("should preserve character config when saving room", async () => {
      // Arrange: Create config with character data
      const existingConfig: ParticipantResourceConfig = {
        version: "1.0.0",
        participantId: testParticipantId,
        timestamp: Date.now(),
        character: {
          modelUrl: "https://example.com/model.glb",
          serializedData: { mesh: { name: "character", type: "sphere" } },
          customization: {
            colors: { primary: "#ff0000" },
            accessories: ["hat"],
          },
        },
        room: {
          serializedData: {},
          environment: {},
          lighting: { preset: "default" },
        },
      };
      await storage.save(existingConfig);

      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act: Save room changes
      editor.setLightingPreset("bright");
      await editor.save();

      // Assert: Character config should be preserved
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig?.character.customization?.colors?.primary).toBe("#ff0000");
      expect(savedConfig?.character.customization?.accessories).toContain("hat");
    });

    test("should call onSave callback when provided", async () => {
      let callbackCalled = false;
      let savedConfig: ParticipantResourceConfig | null = null;

      editor = new EditMyRoom(canvas, loader, testParticipantId, engine, {
        onSave: (config) => {
          callbackCalled = true;
          savedConfig = config;
        },
      });
      await editor.loadRoom();

      // Act
      await editor.save();

      // Assert
      expect(callbackCalled).toBe(true);
      expect(savedConfig).toBeDefined();
    });
  });

  describe("cancel/exit behavior", () => {
    test("should have cancel method", () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);

      expect(typeof editor.cancel).toBe("function");
    });

    test("should not save changes on cancel", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Arrange: Make changes
      editor.setWallColor("#999999");

      // Act: Cancel without saving
      editor.cancel();

      // Assert: Changes should not be saved
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig?.room.environment?.wallMaterial?.color).not.toBe("#999999");
    });

    test("should call onCancel callback when provided", () => {
      let callbackCalled = false;

      editor = new EditMyRoom(canvas, loader, testParticipantId, engine, {
        onCancel: () => {
          callbackCalled = true;
        },
      });

      // Act
      editor.cancel();

      // Assert
      expect(callbackCalled).toBe(true);
    });
  });

  describe("dispose", () => {
    test("should dispose scene resources", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      const scene = editor.getScene();

      // Act
      editor.dispose();

      // Assert
      expect(scene.isDisposed).toBe(true);
    });

    test("should be safe to call dispose multiple times", async () => {
      editor = new EditMyRoom(canvas, loader, testParticipantId, engine);
      await editor.loadRoom();

      // Act & Assert: Should not throw
      editor.dispose();
      editor.dispose();
    });
  });
});
