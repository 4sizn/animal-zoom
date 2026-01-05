/**
 * SubscriptionManager
 * Centralized subscription tracking and management for memory leak prevention
 */

import type { Subscription } from "rxjs";

/**
 * SubscriptionManager Class
 *
 * Tracks and manages RxJS subscriptions to prevent memory leaks.
 * Automatically unsubscribes all tracked subscriptions on cleanup.
 *
 * @example
 * ```typescript
 * const manager = new SubscriptionManager();
 *
 * // Add subscriptions
 * manager.add(observable1$.subscribe(...));
 * manager.add(observable2$.subscribe(...));
 *
 * // Unsubscribe all at once
 * manager.unsubscribeAll();
 * ```
 */
export class SubscriptionManager {
  /**
   * Internal storage for subscriptions
   */
  private subscriptions: Set<Subscription> = new Set();

  /**
   * Add a subscription to be tracked
   *
   * @param subscription - The subscription to track
   * @returns The same subscription (for chaining)
   *
   * @example
   * ```typescript
   * const sub = manager.add(
   *   observable$.subscribe(data => console.log(data))
   * );
   * ```
   */
  public add(
    subscription: Subscription | null | undefined,
  ): Subscription | null | undefined {
    if (!subscription) {
      if (import.meta.env.VITE_DEBUG === "true") {
        console.warn(
          "[SubscriptionManager] Attempted to add null/undefined subscription",
        );
      }
      return subscription;
    }

    this.subscriptions.add(subscription);

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        `[SubscriptionManager] Added subscription (total: ${this.subscriptions.size})`,
      );
    }

    return subscription;
  }

  /**
   * Remove a subscription from tracking (without unsubscribing)
   *
   * @param subscription - The subscription to remove
   * @returns true if removed, false if not found
   *
   * @example
   * ```typescript
   * const sub = observable$.subscribe(...);
   * manager.add(sub);
   *
   * // Later, remove from tracking
   * manager.remove(sub);
   * // Note: sub is NOT unsubscribed, just removed from tracking
   * ```
   */
  public remove(subscription: Subscription): boolean {
    const removed = this.subscriptions.delete(subscription);

    if (removed && import.meta.env.VITE_DEBUG === "true") {
      console.log(
        `[SubscriptionManager] Removed subscription (total: ${this.subscriptions.size})`,
      );
    }

    return removed;
  }

  /**
   * Unsubscribe all tracked subscriptions and clear the list
   *
   * This method will:
   * 1. Iterate through all tracked subscriptions
   * 2. Call unsubscribe() on each one
   * 3. Handle errors gracefully (continue unsubscribing even if one fails)
   * 4. Clear the subscription list
   *
   * @example
   * ```typescript
   * manager.unsubscribeAll();
   * // All subscriptions are now unsubscribed and the list is empty
   * ```
   */
  public unsubscribeAll(): void {
    const count = this.subscriptions.size;

    if (count === 0) {
      return;
    }

    if (import.meta.env.VITE_DEBUG === "true") {
      console.log(
        `[SubscriptionManager] Unsubscribing ${count} subscription(s)...`,
      );
    }

    let errorCount = 0;

    // Unsubscribe each subscription
    for (const subscription of this.subscriptions) {
      try {
        if (!subscription.closed) {
          subscription.unsubscribe();
        }
      } catch (error) {
        errorCount++;
        console.error("[SubscriptionManager] Error unsubscribing:", error);
        // Continue unsubscribing other subscriptions even if one fails
      }
    }

    // Clear the set
    this.subscriptions.clear();

    if (import.meta.env.VITE_DEBUG === "true") {
      if (errorCount > 0) {
        console.warn(
          `[SubscriptionManager] Unsubscribed with ${errorCount} error(s)`,
        );
      } else {
        console.log(
          "[SubscriptionManager] All subscriptions unsubscribed successfully",
        );
      }
    }
  }

  /**
   * Get the number of tracked subscriptions
   *
   * @returns The count of active subscriptions being tracked
   *
   * @example
   * ```typescript
   * console.log(`Tracking ${manager.size()} subscriptions`);
   * ```
   */
  public size(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if a subscription is being tracked
   *
   * @param subscription - The subscription to check
   * @returns true if tracked, false otherwise
   */
  public has(subscription: Subscription): boolean {
    return this.subscriptions.has(subscription);
  }

  /**
   * Get all tracked subscriptions (read-only)
   *
   * @returns An array of all tracked subscriptions
   */
  public getAll(): Subscription[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Clear all subscriptions without unsubscribing
   * Useful for testing or special cases
   *
   * @internal
   */
  public clear(): void {
    this.subscriptions.clear();
  }
}

export default SubscriptionManager;
