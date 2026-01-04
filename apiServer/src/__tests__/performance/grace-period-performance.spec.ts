import { GracePeriodManager } from '../../room/grace-period-manager.js';

describe('GracePeriodManager - Performance Tests', () => {
  let manager: GracePeriodManager;

  beforeEach(() => {
    manager = new GracePeriodManager();
    // Set to 1 second for faster testing
    manager.setGracePeriodMs(1000);
  });

  afterEach(() => {
    // Cleanup any remaining timers
    for (let i = 0; i < 1000; i++) {
      manager.cancelGracePeriod(`PERF_ROOM_${i}`);
    }
  });

  describe('Concurrent Grace Periods', () => {
    it('should handle 100 concurrent grace periods efficiently', async () => {
      const startTime = Date.now();
      const callbacks: Array<jest.Mock> = [];

      // Start 100 grace periods
      for (let i = 0; i < 100; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        manager.startGracePeriod(`ROOM_${i}`, callback);
      }

      const setupTime = Date.now() - startTime;

      // Verify all are tracked
      for (let i = 0; i < 100; i++) {
        expect(manager.hasGracePeriod(`ROOM_${i}`)).toBe(true);
      }

      // Wait for all timers to execute
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Verify all callbacks executed
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });

      // Verify all cleaned up
      for (let i = 0; i < 100; i++) {
        expect(manager.hasGracePeriod(`ROOM_${i}`)).toBe(false);
      }

      // Performance assertions
      expect(setupTime).toBeLessThan(100); // Setup should be < 100ms
      console.log(`✅ 100 concurrent grace periods: ${setupTime}ms setup time`);
    }, 5000);

    it('should handle 500 grace periods without memory issues', async () => {
      const memBefore = process.memoryUsage().heapUsed;
      const callbacks: Array<jest.Mock> = [];

      // Create 500 grace periods
      for (let i = 0; i < 500; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        manager.startGracePeriod(`PERF_ROOM_${i}`, callback);
      }

      const memAfter = process.memoryUsage().heapUsed;
      const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB

      // Cancel all to prevent timers from executing
      for (let i = 0; i < 500; i++) {
        manager.cancelGracePeriod(`PERF_ROOM_${i}`);
      }

      // Memory increase should be reasonable (< 10MB for 500 timers)
      expect(memIncrease).toBeLessThan(10);
      console.log(`✅ 500 grace periods: ${memIncrease.toFixed(2)}MB memory increase`);
    });

    it('should handle rapid start/cancel cycles', () => {
      const startTime = Date.now();
      const roomCode = 'RAPID_TEST';

      // Perform 1000 start/cancel cycles
      for (let i = 0; i < 1000; i++) {
        manager.startGracePeriod(roomCode, jest.fn());
        manager.cancelGracePeriod(roomCode);
      }

      const duration = Date.now() - startTime;

      // Should complete in < 200ms (1000 operations)
      expect(duration).toBeLessThan(200);
      expect(manager.hasGracePeriod(roomCode)).toBe(false);

      console.log(`✅ 1000 start/cancel cycles: ${duration}ms`);
    });

    it('should maintain performance with mixed operations', async () => {
      const startTime = Date.now();
      const operations = [];

      // Mix of start, cancel, and has operations
      for (let i = 0; i < 100; i++) {
        operations.push(
          (async () => {
            const roomCode = `MIXED_${i}`;
            manager.startGracePeriod(roomCode, jest.fn());
            manager.hasGracePeriod(roomCode);

            // 50% cancel immediately, 50% let expire
            if (i % 2 === 0) {
              manager.cancelGracePeriod(roomCode);
            }
          })(),
        );
      }

      await Promise.all(operations);

      const duration = Date.now() - startTime;

      // Should complete quickly
      expect(duration).toBeLessThan(200);

      // Wait for remaining timers
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // All should be cleaned up
      for (let i = 0; i < 100; i++) {
        expect(manager.hasGracePeriod(`MIXED_${i}`)).toBe(false);
      }

      console.log(`✅ 100 mixed operations: ${duration}ms`);
    }, 5000);
  });

  describe('Stress Tests', () => {
    it('should not leak timers with repeated start on same room', () => {
      const roomCode = 'STRESS_ROOM';
      const callback = jest.fn();

      // Start grace period 100 times on same room
      for (let i = 0; i < 100; i++) {
        manager.startGracePeriod(roomCode, callback);
      }

      // Only one timer should exist
      expect(manager.hasGracePeriod(roomCode)).toBe(true);

      // Cancel it
      const cancelled = manager.cancelGracePeriod(roomCode);
      expect(cancelled).toBe(true);

      // Should not be able to cancel again
      const cancelledAgain = manager.cancelGracePeriod(roomCode);
      expect(cancelledAgain).toBe(false);
    });

    it('should handle timer execution during new timer creation', async () => {
      const results: string[] = [];

      // Create first timer
      manager.startGracePeriod('CONCURRENT_1', async () => {
        results.push('timer1');
      });

      // Wait 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create second timer
      manager.startGracePeriod('CONCURRENT_2', async () => {
        results.push('timer2');
      });

      // Wait for both to execute
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Both should have executed
      expect(results).toContain('timer1');
      expect(results).toContain('timer2');
      expect(results.length).toBe(2);
    }, 3000);

    it('should handle errors in callbacks gracefully', async () => {
      const errorCallback = jest.fn().mockRejectedValue(new Error('Test error'));
      const normalCallback = jest.fn().mockResolvedValue(undefined);

      manager.startGracePeriod('ERROR_ROOM', errorCallback);
      manager.startGracePeriod('NORMAL_ROOM', normalCallback);

      // Wait for execution
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Both should have been called
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();

      // Both should be cleaned up
      expect(manager.hasGracePeriod('ERROR_ROOM')).toBe(false);
      expect(manager.hasGracePeriod('NORMAL_ROOM')).toBe(false);
    }, 3000);
  });

  describe('Scalability', () => {
    it('should provide consistent performance regardless of active timer count', async () => {
      const timings: number[] = [];

      // Test performance at different scales
      for (const count of [10, 50, 100, 200]) {
        // Setup existing timers
        for (let i = 0; i < count; i++) {
          manager.startGracePeriod(`EXISTING_${i}`, jest.fn());
        }

        // Measure time to add one more
        const start = Date.now();
        manager.startGracePeriod(`NEW_TIMER`, jest.fn());
        const duration = Date.now() - start;
        timings.push(duration);

        // Cleanup
        manager.cancelGracePeriod(`NEW_TIMER`);
        for (let i = 0; i < count; i++) {
          manager.cancelGracePeriod(`EXISTING_${i}`);
        }
      }

      // All operations should be similarly fast
      const maxTiming = Math.max(...timings);
      expect(maxTiming).toBeLessThan(10); // < 10ms even with 200 existing timers

      console.log(`✅ Scalability test timings: ${timings.join('ms, ')}ms`);
    });
  });
});
