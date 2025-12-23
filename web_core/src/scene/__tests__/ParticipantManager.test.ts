import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { ParticipantManager } from "../ParticipantManager";
import { ResourceLoader } from "../../resources/ResourceLoader";
import { ResourceStorage } from "../../resources/ResourceStorage";
import { NullEngine } from "@babylonjs/core";

describe("ParticipantManager", () => {
  let manager: ParticipantManager;
  let canvas: HTMLCanvasElement;
  let storage: ResourceStorage;
  let loader: ResourceLoader;
  let engine: NullEngine;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div class="participant-grid"></div>
      <div id="participant-count"></div>
    `;

    // Create canvas
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    // Setup storage and loader
    storage = new ResourceStorage();
    loader = new ResourceLoader(storage);

    // Use NullEngine for testing (no WebGL required)
    engine = new NullEngine();

    // Create manager with ResourceLoader and NullEngine
    manager = new ParticipantManager(canvas, loader, engine);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    manager.dispose();
    document.body.innerHTML = "";
    localStorage.clear();
  });

  describe("initialization", () => {
    test("should create ParticipantManager with ResourceLoader", () => {
      expect(manager).toBeDefined();
      expect(manager.getParticipants().size).toBe(0);
    });
  });

  describe("addParticipant with resource loading", () => {
    test("should add participant and load resources", async () => {
      // Act
      const participant = await manager.addParticipant("user-1", "Alice");

      // Assert
      expect(participant).toBeDefined();
      expect(participant.id).toBe("user-1");
      expect(participant.name).toBe("Alice");
      expect(participant.character).toBeDefined();
      expect(manager.getParticipants().size).toBe(1);
    });

    test("should use ResourceLoader to load config", async () => {
      // Arrange: Save a custom config
      const customConfig = {
        version: "1.0.0",
        participantId: "user-1",
        timestamp: Date.now(),
        character: {
          modelUrl: "https://example.com/custom.glb",
          serializedData: {
            mesh: {
              name: "custom-character",
              type: "sphere",
              diameter: 3,
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
      await storage.save(customConfig);

      // Act
      const participant = await manager.addParticipant("user-1", "Alice");

      // Assert: Character should have been built from config
      expect(participant.character).toBeDefined();
      expect(participant.character?.name).toBe("custom-character");
    });

    test("should use SceneBuilder to create character", async () => {
      // Act
      const participant = await manager.addParticipant("user-1", "Alice");

      // Assert: Character should be created
      expect(participant.character).toBeDefined();
      expect(participant.scene.meshes.length).toBeGreaterThan(0);
    });

    test("should use default config if not found in storage", async () => {
      // Act: Add participant without saved config
      const participant = await manager.addParticipant("user-1", "Alice");

      // Assert: Should use default config
      expect(participant.character).toBeDefined();
      expect(participant.scene.meshes.length).toBeGreaterThan(0);
    });

    test("should add participant to grid", async () => {
      // Act
      await manager.addParticipant("user-1", "Alice");

      // Assert
      const cell = document.querySelector('[data-participant-id="user-1"]');
      expect(cell).toBeDefined();
      expect(cell?.querySelector(".participant-name")?.textContent).toBe(
        "Alice"
      );
    });

    test("should update participant count", async () => {
      // Act
      await manager.addParticipant("user-1", "Alice");

      // Assert
      const countElement = document.getElementById("participant-count");
      expect(countElement?.textContent).toBe("1 participant");
    });

    test("should handle multiple participants", async () => {
      // Act
      await manager.addParticipant("user-1", "Alice");
      await manager.addParticipant("user-2", "Bob");
      await manager.addParticipant("user-3", "Charlie");

      // Assert
      expect(manager.getParticipants().size).toBe(3);

      const grid = document.querySelector(".participant-grid");
      expect(grid?.querySelectorAll(".participant-cell").length).toBe(3);
    });
  });

  describe("removeParticipant", () => {
    test("should remove participant", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");
      expect(manager.getParticipants().size).toBe(1);

      // Act
      manager.removeParticipant("user-1");

      // Assert
      expect(manager.getParticipants().size).toBe(0);
      const cell = document.querySelector('[data-participant-id="user-1"]');
      expect(cell).toBeNull();
    });

    test("should dispose participant scene", async () => {
      // Arrange
      const participant = await manager.addParticipant("user-1", "Alice");
      const scene = participant.scene;

      // Act
      manager.removeParticipant("user-1");

      // Assert: Scene should be disposed
      expect(scene.isDisposed).toBe(true);
    });

    test("should handle removing non-existent participant", () => {
      // Act & Assert: Should not throw
      manager.removeParticipant("non-existent");
      expect(manager.getParticipants().size).toBe(0);
    });
  });

  describe("regression tests - existing functionality", () => {
    test("should toggle mute state", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");

      // Act
      manager.toggleMute("user-1");

      // Assert
      const participant = manager.getParticipant("user-1");
      expect(participant?.isMuted).toBe(true);

      const cell = document.querySelector('[data-participant-id="user-1"]');
      expect(cell?.classList.contains("muted")).toBe(true);

      // Toggle again
      manager.toggleMute("user-1");
      expect(participant?.isMuted).toBe(false);
      expect(cell?.classList.contains("muted")).toBe(false);
    });

    test("should toggle camera state", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");

      // Act
      manager.toggleCamera("user-1");

      // Assert
      const participant = manager.getParticipant("user-1");
      expect(participant?.cameraOff).toBe(true);

      const cell = document.querySelector('[data-participant-id="user-1"]');
      expect(cell?.classList.contains("camera-off")).toBe(true);
    });

    test("should set active speaker", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");
      await manager.addParticipant("user-2", "Bob");

      // Act
      manager.setActiveSpeaker("user-1");

      // Assert
      const cell1 = document.querySelector('[data-participant-id="user-1"]');
      const cell2 = document.querySelector('[data-participant-id="user-2"]');

      expect(cell1?.classList.contains("active-speaker")).toBe(true);
      expect(cell2?.classList.contains("active-speaker")).toBe(false);

      // Change active speaker
      manager.setActiveSpeaker("user-2");

      expect(cell1?.classList.contains("active-speaker")).toBe(false);
      expect(cell2?.classList.contains("active-speaker")).toBe(true);
    });

    test("should update grid layout based on participant count", async () => {
      const grid = document.querySelector(".participant-grid");

      // 1 participant: 1x1
      await manager.addParticipant("user-1", "Alice");
      expect(grid?.getAttribute("data-grid-size")).toBe("1x1");

      // 2 participants: 2x2
      await manager.addParticipant("user-2", "Bob");
      expect(grid?.getAttribute("data-grid-size")).toBe("2x2");

      // 5 participants: 3x3
      await manager.addParticipant("user-3", "Charlie");
      await manager.addParticipant("user-4", "David");
      await manager.addParticipant("user-5", "Eve");
      expect(grid?.getAttribute("data-grid-size")).toBe("3x3");

      // 10 participants: 4x4
      for (let i = 6; i <= 10; i++) {
        await manager.addParticipant(`user-${i}`, `User${i}`);
      }
      expect(grid?.getAttribute("data-grid-size")).toBe("4x4");
    });

    test("should update participant count text", async () => {
      const countElement = document.getElementById("participant-count");

      // 0 participants
      expect(countElement?.textContent).toBe("0 participants");

      // 1 participant
      await manager.addParticipant("user-1", "Alice");
      expect(countElement?.textContent).toBe("1 participant");

      // 2 participants
      await manager.addParticipant("user-2", "Bob");
      expect(countElement?.textContent).toBe("2 participants");
    });
  });

  describe("getParticipant and getParticipants", () => {
    test("should get participant by ID", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");

      // Act
      const participant = manager.getParticipant("user-1");

      // Assert
      expect(participant).toBeDefined();
      expect(participant?.name).toBe("Alice");
    });

    test("should return undefined for non-existent participant", () => {
      // Act
      const participant = manager.getParticipant("non-existent");

      // Assert
      expect(participant).toBeUndefined();
    });

    test("should get all participants", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");
      await manager.addParticipant("user-2", "Bob");

      // Act
      const participants = manager.getParticipants();

      // Assert
      expect(participants.size).toBe(2);
      expect(participants.has("user-1")).toBe(true);
      expect(participants.has("user-2")).toBe(true);
    });
  });

  describe("dispose", () => {
    test("should dispose all resources", async () => {
      // Arrange
      await manager.addParticipant("user-1", "Alice");
      await manager.addParticipant("user-2", "Bob");

      // Act
      manager.dispose();

      // Assert
      expect(manager.getParticipants().size).toBe(0);
    });
  });
});
