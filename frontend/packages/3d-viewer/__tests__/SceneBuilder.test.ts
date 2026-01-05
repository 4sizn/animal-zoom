/**
 * 3D Viewer SceneBuilder Tests
 * GREEN Phase: Verify SceneBuilder migration works correctly
 */

import { describe, expect, test } from "bun:test";
import "../test-setup";

describe("SceneBuilder", () => {
  test("should export SceneBuilder class", async () => {
    const { SceneBuilder } = await import("../src/scene/SceneBuilder");
    expect(SceneBuilder).toBeDefined();
    expect(typeof SceneBuilder).toBe("function");
  });

  test("should export ParticipantManager class", async () => {
    const { ParticipantManager } = await import(
      "../src/scene/ParticipantManager"
    );
    expect(ParticipantManager).toBeDefined();
    expect(typeof ParticipantManager).toBe("function");
  });

  test("should export ResourceStorage", async () => {
    const { ResourceStorage } = await import(
      "../src/resources/ResourceStorage"
    );
    expect(ResourceStorage).toBeDefined();
    expect(typeof ResourceStorage).toBe("function");
  });

  test("package index exports createViewer function", async () => {
    const { createViewer } = await import("../src/index");
    expect(createViewer).toBeDefined();
    expect(typeof createViewer).toBe("function");
  });
});
