/**
 * Mention Parser Tests
 * Tests for @username mention parsing and rendering
 */

import { describe, expect, it } from "bun:test";
import {
  extractMentions,
  highlightMentions,
  isMentioned,
  type MentionMatch,
  parseMentions,
} from "../../src/utils/mentionParser";

describe("Mention Parser", () => {
  describe("extractMentions", () => {
    it("should extract single mention", () => {
      const text = "Hello @john how are you?";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("john");
    });

    it("should extract multiple mentions", () => {
      const text = "Hey @alice and @bob, check this out!";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions).toContain("alice");
      expect(mentions).toContain("bob");
    });

    it("should handle mentions at start of message", () => {
      const text = "@everyone Hello!";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("everyone");
    });

    it("should handle mentions at end of message", () => {
      const text = "Thanks @admin";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("admin");
    });

    it("should handle consecutive mentions", () => {
      const text = "@alice @bob @charlie";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(3);
      expect(mentions).toEqual(["alice", "bob", "charlie"]);
    });

    it("should not extract @ without username", () => {
      const text = "My email is user@example.com";
      const mentions = extractMentions(text);

      // Should not match email addresses
      expect(mentions).toHaveLength(0);
    });

    it("should handle empty string", () => {
      const mentions = extractMentions("");
      expect(mentions).toHaveLength(0);
    });

    it("should handle string without mentions", () => {
      const text = "Hello, this is a normal message";
      const mentions = extractMentions(text);
      expect(mentions).toHaveLength(0);
    });

    it("should handle mentions with underscores", () => {
      const text = "Hey @user_name how are you?";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("user_name");
    });

    it("should handle mentions with numbers", () => {
      const text = "Calling @user123 and @admin2";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions).toContain("user123");
      expect(mentions).toContain("admin2");
    });

    it("should not extract mentions with special characters", () => {
      const text = "@user-name @user.name @user#tag";
      const mentions = extractMentions(text);

      // Only alphanumeric and underscore should be valid
      expect(mentions).toHaveLength(0);
    });

    it("should handle duplicate mentions", () => {
      const text = "@john said hello, and @john replied";
      const mentions = extractMentions(text);

      // Should return unique mentions
      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("john");
    });

    it("should be case-insensitive", () => {
      const text = "@John @JOHN @john";
      const mentions = extractMentions(text);

      // Should treat as same mention (case-insensitive)
      expect(mentions).toHaveLength(1);
    });
  });

  describe("parseMentions", () => {
    it("should parse mentions with positions", () => {
      const text = "Hello @john!";
      const parsed = parseMentions(text);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        username: "john",
        start: 6,
        end: 11,
      });
    });

    it("should parse multiple mentions with correct positions", () => {
      const text = "@alice hey @bob!";
      const parsed = parseMentions(text);

      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toMatchObject({
        username: "alice",
        start: 0,
        end: 6,
      });
      expect(parsed[1]).toMatchObject({
        username: "bob",
        start: 11,
        end: 15,
      });
    });

    it("should return empty array for no mentions", () => {
      const text = "Hello everyone";
      const parsed = parseMentions(text);
      expect(parsed).toHaveLength(0);
    });

    it("should include matched text", () => {
      const text = "Hey @user123";
      const parsed = parseMentions(text);

      expect(parsed[0].match).toBe("@user123");
    });
  });

  describe("highlightMentions", () => {
    it("should wrap mentions in HTML", () => {
      const text = "Hello @john!";
      const highlighted = highlightMentions(text);

      expect(highlighted).toContain('<span class="mention">@john</span>');
    });

    it("should highlight multiple mentions", () => {
      const text = "@alice and @bob";
      const highlighted = highlightMentions(text);

      expect(highlighted).toContain('<span class="mention">@alice</span>');
      expect(highlighted).toContain('<span class="mention">@bob</span>');
      expect(highlighted).toBe(
        '<span class="mention">@alice</span> and <span class="mention">@bob</span>',
      );
    });

    it("should preserve non-mention text", () => {
      const text = "Hello @john, how are you?";
      const highlighted = highlightMentions(text);

      expect(highlighted).toContain("Hello ");
      expect(highlighted).toContain(", how are you?");
    });

    it("should return original text if no mentions", () => {
      const text = "Hello everyone";
      const highlighted = highlightMentions(text);

      expect(highlighted).toBe(text);
    });

    it("should handle empty string", () => {
      const highlighted = highlightMentions("");
      expect(highlighted).toBe("");
    });

    it("should support custom className", () => {
      const text = "@user";
      const highlighted = highlightMentions(text, "custom-mention");

      expect(highlighted).toContain(
        '<span class="custom-mention">@user</span>',
      );
    });

    it("should escape HTML in text", () => {
      const text = '<script>alert("xss")</script> @user';
      const highlighted = highlightMentions(text);

      // Should not contain executable script tags
      expect(highlighted).not.toContain("<script>");
      expect(highlighted).toContain("&lt;script&gt;");
      expect(highlighted).toContain('<span class="mention">@user</span>');
    });
  });

  describe("isMentioned", () => {
    it("should return true if user is mentioned", () => {
      const text = "Hello @john!";
      const result = isMentioned(text, "john");

      expect(result).toBe(true);
    });

    it("should return false if user is not mentioned", () => {
      const text = "Hello @alice!";
      const result = isMentioned(text, "john");

      expect(result).toBe(false);
    });

    it("should be case-insensitive", () => {
      const text = "Hello @John!";

      expect(isMentioned(text, "john")).toBe(true);
      expect(isMentioned(text, "JOHN")).toBe(true);
      expect(isMentioned(text, "John")).toBe(true);
    });

    it("should handle @everyone mention", () => {
      const text = "@everyone attention please";

      expect(isMentioned(text, "alice")).toBe(false);
      expect(isMentioned(text, "everyone")).toBe(true);
    });

    it("should handle @all mention as everyone", () => {
      const text = "@all please check this";

      expect(isMentioned(text, "all")).toBe(true);
    });

    it("should not match partial usernames", () => {
      const text = "@johnsmith";

      expect(isMentioned(text, "john")).toBe(false);
      expect(isMentioned(text, "johnsmith")).toBe(true);
    });

    it("should handle empty username", () => {
      const text = "Hello @user";
      const result = isMentioned(text, "");

      expect(result).toBe(false);
    });

    it("should handle empty text", () => {
      const result = isMentioned("", "user");
      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long usernames", () => {
      const longUsername = "a".repeat(50);
      const text = `Hello @${longUsername}`;
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe(longUsername);
    });

    it("should handle message with only mentions", () => {
      const text = "@alice @bob @charlie";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(3);
    });

    it("should handle mentions in parentheses", () => {
      const text = "Check this (@user)";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("user");
    });

    it("should handle mentions with emoji", () => {
      const text = "Hey @user 🎉";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(1);
      expect(mentions[0]).toBe("user");
    });

    it("should handle mentions in multiline text", () => {
      const text = "Line 1 @user1\nLine 2 @user2\nLine 3";
      const mentions = extractMentions(text);

      expect(mentions).toHaveLength(2);
      expect(mentions).toContain("user1");
      expect(mentions).toContain("user2");
    });

    it("should not crash on null or undefined", () => {
      expect(() => extractMentions(null as any)).not.toThrow();
      expect(() => extractMentions(undefined as any)).not.toThrow();
      expect(() => parseMentions(null as any)).not.toThrow();
      expect(() => highlightMentions(null as any)).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should handle large messages efficiently", () => {
      const longMessage =
        "Hello ".repeat(1000) + "@user " + "world ".repeat(1000);
      const start = Date.now();

      const mentions = extractMentions(longMessage);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in <100ms
      expect(mentions).toHaveLength(1);
    });

    it("should handle many mentions efficiently", () => {
      const manyMentions = Array.from(
        { length: 100 },
        (_, i) => `@user${i}`,
      ).join(" ");

      const start = Date.now();
      const mentions = extractMentions(manyMentions);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
      expect(mentions).toHaveLength(100);
    });
  });
});
