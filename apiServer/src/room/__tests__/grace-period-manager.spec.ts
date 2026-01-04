import { GracePeriodManager } from '../grace-period-manager.js';

describe('GracePeriodManager', () => {
  let manager: GracePeriodManager;

  beforeEach(() => {
    jest.useFakeTimers();
    manager = new GracePeriodManager();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('startGracePeriod', () => {
    it('should store timer reference for the room', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOM123', callback);

      expect(manager.hasGracePeriod('ROOM123')).toBe(true);
    });

    it('should execute callback after 60 seconds with correct roomCode', async () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOM456', callback);

      // Fast-forward time by 59 seconds - callback should NOT be called
      jest.advanceTimersByTime(59_000);
      expect(callback).not.toHaveBeenCalled();

      // Fast-forward 1 more second - callback SHOULD be called
      jest.advanceTimersByTime(1_000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('ROOM456');
    });

    it('should remove timer reference after execution', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOM789', callback);

      expect(manager.hasGracePeriod('ROOM789')).toBe(true);

      // Execute timer
      jest.advanceTimersByTime(60_000);

      // Timer should be removed
      expect(manager.hasGracePeriod('ROOM789')).toBe(false);
    });

    it('should cancel existing timer when starting new one for same room', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      manager.startGracePeriod('ROOMABC', callback1);

      // Start another grace period for same room
      manager.startGracePeriod('ROOMABC', callback2);

      // Fast-forward 60 seconds
      jest.advanceTimersByTime(60_000);

      // Only callback2 should be called, callback1 should be cancelled
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rooms simultaneously', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      manager.startGracePeriod('ROOM001', callback1);
      manager.startGracePeriod('ROOM002', callback2);
      manager.startGracePeriod('ROOM003', callback3);

      expect(manager.hasGracePeriod('ROOM001')).toBe(true);
      expect(manager.hasGracePeriod('ROOM002')).toBe(true);
      expect(manager.hasGracePeriod('ROOM003')).toBe(true);

      // Advance 60 seconds
      jest.advanceTimersByTime(60_000);

      expect(callback1).toHaveBeenCalledWith('ROOM001');
      expect(callback2).toHaveBeenCalledWith('ROOM002');
      expect(callback3).toHaveBeenCalledWith('ROOM003');
    });

    it('should handle async callbacks', async () => {
      const asyncCallback = jest.fn(async (roomCode: string) => {
        await Promise.resolve();
        return `Processed ${roomCode}`;
      });

      manager.startGracePeriod('ROOMASYNC', asyncCallback);

      jest.advanceTimersByTime(60_000);

      expect(asyncCallback).toHaveBeenCalledWith('ROOMASYNC');
    });
  });

  describe('cancelGracePeriod', () => {
    it('should cancel existing timer and return true', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOMCANCEL', callback);

      expect(manager.hasGracePeriod('ROOMCANCEL')).toBe(true);

      const result = manager.cancelGracePeriod('ROOMCANCEL');

      expect(result).toBe(true);
      expect(manager.hasGracePeriod('ROOMCANCEL')).toBe(false);

      // Advance time - callback should NOT be called
      jest.advanceTimersByTime(60_000);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should return false if no timer exists for room', () => {
      const result = manager.cancelGracePeriod('NONEXISTENT');

      expect(result).toBe(false);
    });

    it('should be idempotent (multiple cancels do not throw)', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOMIDEM', callback);

      manager.cancelGracePeriod('ROOMIDEM');
      const result = manager.cancelGracePeriod('ROOMIDEM'); // Second cancel

      expect(result).toBe(false);
    });

    it('should only cancel the specified room timer', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      manager.startGracePeriod('ROOM_A', callback1);
      manager.startGracePeriod('ROOM_B', callback2);

      manager.cancelGracePeriod('ROOM_A');

      expect(manager.hasGracePeriod('ROOM_A')).toBe(false);
      expect(manager.hasGracePeriod('ROOM_B')).toBe(true);

      // Advance time
      jest.advanceTimersByTime(60_000);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasGracePeriod', () => {
    it('should return true when timer is active', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOMHAS', callback);

      expect(manager.hasGracePeriod('ROOMHAS')).toBe(true);
    });

    it('should return false when no timer exists', () => {
      expect(manager.hasGracePeriod('ROOMNONE')).toBe(false);
    });

    it('should return false after timer expires', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOMEXPIRE', callback);

      expect(manager.hasGracePeriod('ROOMEXPIRE')).toBe(true);

      jest.advanceTimersByTime(60_000);

      expect(manager.hasGracePeriod('ROOMEXPIRE')).toBe(false);
    });

    it('should return false after timer is cancelled', () => {
      const callback = jest.fn();
      manager.startGracePeriod('ROOMCANC', callback);

      expect(manager.hasGracePeriod('ROOMCANC')).toBe(true);

      manager.cancelGracePeriod('ROOMCANC');

      expect(manager.hasGracePeriod('ROOMCANC')).toBe(false);
    });
  });

  describe('setGracePeriodMs (for testing)', () => {
    it('should allow overriding grace period duration', () => {
      manager.setGracePeriodMs(5_000); // 5 seconds for testing

      const callback = jest.fn();
      manager.startGracePeriod('ROOMFAST', callback);

      // Should NOT execute after 4 seconds
      jest.advanceTimersByTime(4_000);
      expect(callback).not.toHaveBeenCalled();

      // Should execute after 5 seconds
      jest.advanceTimersByTime(1_000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string room code', () => {
      const callback = jest.fn();
      manager.startGracePeriod('', callback);

      expect(manager.hasGracePeriod('')).toBe(true);

      jest.advanceTimersByTime(60_000);
      expect(callback).toHaveBeenCalledWith('');
    });

    it('should handle room codes with special characters', () => {
      const callback = jest.fn();
      const specialCode = 'ROOM-123_ABC.XYZ';

      manager.startGracePeriod(specialCode, callback);

      expect(manager.hasGracePeriod(specialCode)).toBe(true);

      jest.advanceTimersByTime(60_000);
      expect(callback).toHaveBeenCalledWith(specialCode);
    });
  });

  describe('memory management', () => {
    it('should properly cleanup timer references', () => {
      const callbacks: Array<() => void> = [];

      // Create 100 grace periods
      for (let i = 0; i < 100; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        manager.startGracePeriod(`ROOM${i}`, callback);
      }

      // All should be tracked
      for (let i = 0; i < 100; i++) {
        expect(manager.hasGracePeriod(`ROOM${i}`)).toBe(true);
      }

      // Execute all timers
      jest.advanceTimersByTime(60_000);

      // All should be cleaned up
      for (let i = 0; i < 100; i++) {
        expect(manager.hasGracePeriod(`ROOM${i}`)).toBe(false);
      }

      // All callbacks should have been called
      callbacks.forEach((callback) => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    it('should cleanup when cancelling timers', () => {
      // Create 50 grace periods
      for (let i = 0; i < 50; i++) {
        manager.startGracePeriod(`CANCEL${i}`, jest.fn());
      }

      // Cancel all
      for (let i = 0; i < 50; i++) {
        expect(manager.cancelGracePeriod(`CANCEL${i}`)).toBe(true);
      }

      // All should be cleaned up
      for (let i = 0; i < 50; i++) {
        expect(manager.hasGracePeriod(`CANCEL${i}`)).toBe(false);
      }
    });
  });
});
