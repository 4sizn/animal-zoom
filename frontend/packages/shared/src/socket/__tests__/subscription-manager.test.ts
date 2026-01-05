/**
 * SubscriptionManager Tests
 * Memory leak prevention through centralized subscription management
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { Subject } from "rxjs";
import { SubscriptionManager } from "../SubscriptionManager";

describe("SubscriptionManager", () => {
  let manager: SubscriptionManager;

  beforeEach(() => {
    manager = new SubscriptionManager();
  });

  describe("Subscription Tracking", () => {
    it("should track added subscriptions", () => {
      const subject = new Subject<number>();
      const subscription = subject.subscribe();

      manager.add(subscription);
      expect(manager.size()).toBe(1);
    });

    it("should track multiple subscriptions", () => {
      const subject1 = new Subject<number>();
      const subject2 = new Subject<string>();

      manager.add(subject1.subscribe());
      manager.add(subject2.subscribe());

      expect(manager.size()).toBe(2);
    });

    it("should handle adding null/undefined subscriptions gracefully", () => {
      manager.add(null as any);
      manager.add(undefined as any);

      expect(manager.size()).toBe(0);
    });
  });

  describe("Unsubscribe All", () => {
    it("should unsubscribe all tracked subscriptions", () => {
      const subject1 = new Subject<number>();
      const subject2 = new Subject<string>();

      const sub1 = subject1.subscribe();
      const sub2 = subject2.subscribe();

      manager.add(sub1);
      manager.add(sub2);

      manager.unsubscribeAll();

      expect(sub1.closed).toBe(true);
      expect(sub2.closed).toBe(true);
      expect(manager.size()).toBe(0);
    });

    it("should handle empty subscription list", () => {
      expect(() => manager.unsubscribeAll()).not.toThrow();
    });

    it("should handle already unsubscribed subscriptions", () => {
      const subject = new Subject<number>();
      const subscription = subject.subscribe();

      manager.add(subscription);
      subscription.unsubscribe(); // Manually unsubscribe

      expect(() => manager.unsubscribeAll()).not.toThrow();
    });
  });

  describe("Memory Safety", () => {
    it("should prevent memory leaks with multiple add/unsubscribe cycles", () => {
      for (let i = 0; i < 100; i++) {
        const subject = new Subject<number>();
        manager.add(subject.subscribe());
        manager.unsubscribeAll();
      }

      expect(manager.size()).toBe(0);
    });

    it("should clear subscriptions after unsubscribeAll", () => {
      const subject = new Subject<number>();
      manager.add(subject.subscribe());

      manager.unsubscribeAll();

      expect(manager.size()).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should continue unsubscribing even if one subscription throws", () => {
      const subject1 = new Subject<number>();
      const subject2 = new Subject<string>();

      const sub1 = subject1.subscribe();
      const sub2 = subject2.subscribe();

      // Mock a subscription that throws on unsubscribe
      const errorSub = {
        closed: false,
        unsubscribe: () => {
          throw new Error("Unsubscribe error");
        },
      } as any;

      manager.add(sub1);
      manager.add(errorSub);
      manager.add(sub2);

      expect(() => manager.unsubscribeAll()).not.toThrow();

      // Other subscriptions should still be unsubscribed
      expect(sub1.closed).toBe(true);
      expect(sub2.closed).toBe(true);
    });
  });

  describe("Individual Subscription Removal", () => {
    it("should remove individual subscription", () => {
      const subject1 = new Subject<number>();
      const subject2 = new Subject<string>();

      const sub1 = subject1.subscribe();
      const sub2 = subject2.subscribe();

      manager.add(sub1);
      manager.add(sub2);

      manager.remove(sub1);

      expect(manager.size()).toBe(1);
      expect(sub1.closed).toBe(false); // Not auto-unsubscribed, just removed from tracking
    });
  });
});
