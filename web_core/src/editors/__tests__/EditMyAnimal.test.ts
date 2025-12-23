import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { EditMyAnimal } from "../EditMyAnimal";
import { ResourceLoader } from "../../resources/ResourceLoader";
import { ResourceStorage } from "../../resources/ResourceStorage";
import { NullEngine } from "@babylonjs/core";
import type { ParticipantResourceConfig } from "../../resources/ResourceConfig";

describe("EditMyAnimal", () => {
  let editor: EditMyAnimal;
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
    test("should create EditMyAnimal editor", () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);

      expect(editor).toBeDefined();
      expect(editor.getScene()).toBeDefined();
    });

    test("should initialize scene with camera", () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      expect(scene.cameras.length).toBeGreaterThan(0);
    });

    test("should initialize scene with lighting", () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      expect(scene.lights.length).toBeGreaterThan(0);
    });

    test("should initialize scene with ground plane", () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);

      const scene = editor.getScene();
      const ground = scene.getMeshByName("ground");
      expect(ground).toBeDefined();
    });
  });

  describe("character model loading", () => {
    test("should load character from existing config", async () => {
      // Arrange: Save existing config
      const existingConfig: ParticipantResourceConfig = {
        version: "1.0.0",
        participantId: testParticipantId,
        timestamp: Date.now(),
        character: {
          modelUrl: "https://example.com/custom.glb",
          serializedData: {
            mesh: {
              name: "custom-character",
              type: "sphere",
              diameter: 2,
            },
          },
          customization: {
            colors: { primary: "#ff0000" },
          },
        },
        room: {
          serializedData: {},
          environment: {},
          lighting: { preset: "default" },
        },
      };
      await storage.save(existingConfig);

      // Act
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Assert
      const character = editor.getCharacter();
      expect(character).toBeDefined();
      expect(character?.name).toBe("custom-character");
    });

    test("should create default character if no config exists", async () => {
      // Act: Create editor without saved config
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Assert
      const character = editor.getCharacter();
      expect(character).toBeDefined();
      expect(character?.name).toBe("character");
    });

    test("should handle loading errors gracefully", async () => {
      // Arrange: Create corrupted config
      localStorage.setItem(
        "animal-zoom:resource:corrupt-user",
        "invalid json"
      );

      // Act & Assert: Should not throw
      editor = new EditMyAnimal(canvas, loader, "corrupt-user", engine);
      await editor.loadCharacter();

      const character = editor.getCharacter();
      expect(character).toBeDefined(); // Should have fallback
    });
  });

  describe("color customization", () => {
    test("should get current primary color", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      const color = editor.getPrimaryColor();
      expect(color).toBeDefined();
      expect(typeof color).toBe("string");
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test("should update primary color", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act
      editor.setPrimaryColor("#00ff00");

      // Assert
      expect(editor.getPrimaryColor()).toBe("#00ff00");
    });

    test("should apply color changes to character material", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act
      editor.setPrimaryColor("#ff00ff");

      // Assert
      const character = editor.getCharacter();
      expect(character?.material).toBeDefined();
    });

    test("should support secondary color customization", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act
      editor.setSecondaryColor("#ffff00");

      // Assert
      expect(editor.getSecondaryColor()).toBe("#ffff00");
    });
  });

  describe("accessory management", () => {
    test("should get list of available accessories", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      const accessories = editor.getAvailableAccessories();
      expect(Array.isArray(accessories)).toBe(true);
    });

    test("should get currently equipped accessories", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      const equipped = editor.getEquippedAccessories();
      expect(Array.isArray(equipped)).toBe(true);
    });

    test("should add accessory to character", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act
      editor.addAccessory("hat");

      // Assert
      const equipped = editor.getEquippedAccessories();
      expect(equipped).toContain("hat");
    });

    test("should remove accessory from character", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Arrange
      editor.addAccessory("hat");
      expect(editor.getEquippedAccessories()).toContain("hat");

      // Act
      editor.removeAccessory("hat");

      // Assert
      expect(editor.getEquippedAccessories()).not.toContain("hat");
    });

    test("should prevent duplicate accessories", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act
      editor.addAccessory("hat");
      editor.addAccessory("hat");

      // Assert
      const equipped = editor.getEquippedAccessories();
      const hatCount = equipped.filter((a) => a === "hat").length;
      expect(hatCount).toBe(1);
    });
  });

  describe("save functionality", () => {
    test("should serialize character config on save", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Arrange: Make some changes
      editor.setPrimaryColor("#123456");
      editor.addAccessory("glasses");

      // Act
      await editor.save();

      // Assert: Config should be saved to storage
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig).toBeDefined();
      expect(savedConfig?.character.customization?.colors?.primary).toBe(
        "#123456"
      );
      expect(savedConfig?.character.customization?.accessories).toContain(
        "glasses"
      );
    });

    test("should preserve room config when saving character", async () => {
      // Arrange: Create config with room data
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
          serializedData: { meshes: [{ name: "ground", type: "ground" }] },
          environment: { furniture: ["chair"] },
          lighting: { preset: "bright" },
        },
      };
      await storage.save(existingConfig);

      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act: Save character changes
      editor.setPrimaryColor("#abcdef");
      await editor.save();

      // Assert: Room config should be preserved
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig?.room.environment?.furniture).toContain("chair");
      expect(savedConfig?.room.lighting.preset).toBe("bright");
    });

    test("should call onSave callback when provided", async () => {
      let callbackCalled = false;
      let savedConfig: ParticipantResourceConfig | null = null;

      editor = new EditMyAnimal(
        canvas,
        loader,
        testParticipantId,
        engine,
        {
          onSave: (config) => {
            callbackCalled = true;
            savedConfig = config;
          },
        }
      );
      await editor.loadCharacter();

      // Act
      await editor.save();

      // Assert
      expect(callbackCalled).toBe(true);
      expect(savedConfig).toBeDefined();
    });
  });

  describe("cancel/exit behavior", () => {
    test("should have cancel method", () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);

      expect(typeof editor.cancel).toBe("function");
    });

    test("should not save changes on cancel", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Arrange: Make changes
      editor.setPrimaryColor("#999999");

      // Act: Cancel without saving
      editor.cancel();

      // Assert: Changes should not be saved
      const savedConfig = await storage.load(testParticipantId);
      expect(savedConfig?.character.customization?.colors?.primary).not.toBe(
        "#999999"
      );
    });

    test("should call onCancel callback when provided", () => {
      let callbackCalled = false;

      editor = new EditMyAnimal(
        canvas,
        loader,
        testParticipantId,
        engine,
        {
          onCancel: () => {
            callbackCalled = true;
          },
        }
      );

      // Act
      editor.cancel();

      // Assert
      expect(callbackCalled).toBe(true);
    });
  });

  describe("dispose", () => {
    test("should dispose scene resources", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      const scene = editor.getScene();

      // Act
      editor.dispose();

      // Assert
      expect(scene.isDisposed).toBe(true);
    });

    test("should be safe to call dispose multiple times", async () => {
      editor = new EditMyAnimal(canvas, loader, testParticipantId, engine);
      await editor.loadCharacter();

      // Act & Assert: Should not throw
      editor.dispose();
      editor.dispose();
    });
  });
});
