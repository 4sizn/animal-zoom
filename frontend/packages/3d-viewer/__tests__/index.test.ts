/**
 * 3D Viewer Index Tests
 * GREEN Phase: Verify package exports work correctly
 */

import { describe, test, expect } from 'bun:test';
import '../test-setup';

describe('3D Viewer Package Exports', () => {
  test('should export createViewer function', async () => {
    const module = await import('../src/index');
    expect(module.createViewer).toBeDefined();
    expect(typeof module.createViewer).toBe('function');
  });

  test('should export SceneBuilder class', async () => {
    const module = await import('../src/index');
    expect(module.SceneBuilder).toBeDefined();
    expect(typeof module.SceneBuilder).toBe('function');
  });

  test('should export ParticipantManager class', async () => {
    const module = await import('../src/index');
    expect(module.ParticipantManager).toBeDefined();
    expect(typeof module.ParticipantManager).toBe('function');
  });

  test('should export ResourceStorage', async () => {
    const module = await import('../src/index');
    expect(module.ResourceStorage).toBeDefined();
  });

  test('should export ResourceLoader', async () => {
    const module = await import('../src/index');
    expect(module.ResourceLoader).toBeDefined();
  });
});
