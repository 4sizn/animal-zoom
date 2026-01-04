import { Injectable, Logger } from '@nestjs/common';

/**
 * Manages grace periods for rooms before they are marked as inactive.
 *
 * When a room becomes empty (0 participants), instead of immediately marking it as inactive,
 * a grace period timer is started. If participants rejoin within the grace period,
 * the timer is cancelled and the room remains active.
 */
@Injectable()
export class GracePeriodManager {
  private readonly logger = new Logger(GracePeriodManager.name);
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private gracePeriodMs: number = 60_000; // 60 seconds

  /**
   * Start a grace period for a room.
   *
   * @param roomCode - The room code
   * @param callback - Async callback to execute after grace period expires
   */
  startGracePeriod(
    roomCode: string,
    callback: (roomCode: string) => Promise<void>,
  ): void {
    // Cancel existing timer if any (prevents duplicate timers)
    this.cancelGracePeriod(roomCode);

    this.logger.debug(
      `Starting grace period for room ${roomCode} (${this.gracePeriodMs}ms)`,
    );

    // Start new timer
    const timer = setTimeout(() => {
      this.logger.log(
        `Grace period expired for room ${roomCode}, executing callback`,
      );

      // Remove timer reference before executing callback
      this.timers.delete(roomCode);

      // Execute async callback without await in setTimeout
      // Use void to ignore the promise (linting requirement)
      void Promise.resolve(callback(roomCode)).catch((error) => {
        this.logger.error(
          `Error executing grace period callback for room ${roomCode}:`,
          error,
        );
      });
    }, this.gracePeriodMs);

    this.timers.set(roomCode, timer);
  }

  /**
   * Cancel the grace period for a room.
   *
   * @param roomCode - The room code
   * @returns true if a timer was cancelled, false if no timer existed
   */
  cancelGracePeriod(roomCode: string): boolean {
    const timer = this.timers.get(roomCode);

    if (!timer) {
      return false;
    }

    this.logger.debug(`Cancelling grace period for room ${roomCode}`);

    clearTimeout(timer);
    this.timers.delete(roomCode);

    return true;
  }

  /**
   * Check if a room has an active grace period.
   *
   * @param roomCode - The room code
   * @returns true if grace period is active, false otherwise
   */
  hasGracePeriod(roomCode: string): boolean {
    return this.timers.has(roomCode);
  }

  /**
   * Set the grace period duration (for testing purposes).
   *
   * @param ms - Duration in milliseconds
   */
  setGracePeriodMs(ms: number): void {
    this.gracePeriodMs = ms;
    this.logger.debug(`Grace period duration set to ${ms}ms`);
  }
}
