/**
 * Mention Parser Utility
 * Handles @username mention parsing and rendering
 */

/**
 * Mention match with position information
 */
export interface MentionMatch {
  username: string;
  start: number;
  end: number;
  match: string;
}

/**
 * Regular expression for matching @mentions
 * Matches @username where username contains alphanumeric and underscore only
 * Must be preceded by whitespace, start of string, or opening parenthesis
 * Username must NOT be immediately followed by alphanumeric, underscore, or special chars
 */
const MENTION_REGEX = /(?:^|(?<=[\s(]))@([a-zA-Z0-9_]+)(?![a-zA-Z0-9_\-#.])/g;

/**
 * Extract all unique mentions from a text
 * @param text - The text to parse
 * @returns Array of unique usernames (without @ prefix), lowercased
 *
 * @example
 * extractMentions('Hello @john and @jane!')
 * // Returns: ['john', 'jane']
 */
export function extractMentions(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const mentions = new Set<string>();
  const regex = new RegExp(MENTION_REGEX);
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      mentions.add(match[1].toLowerCase());
    }
  }

  return Array.from(mentions);
}

/**
 * Parse mentions with position information
 * @param text - The text to parse
 * @returns Array of mention matches with positions
 *
 * @example
 * parseMentions('Hello @john!')
 * // Returns: [{ username: 'john', start: 6, end: 11, match: '@john' }]
 */
export function parseMentions(
  text: string | null | undefined
): MentionMatch[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const mentions: MentionMatch[] = [];
  const regex = new RegExp(MENTION_REGEX);
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match.index !== undefined) {
      mentions.push({
        username: match[1].toLowerCase(),
        start: match.index,
        end: match.index + match[0].length,
        match: match[0],
      });
    }
  }

  return mentions;
}

/**
 * HTML escape utility
 */
function escapeHtml(text: string): string {
  // Use simple string replacement for HTML escaping (works in Node/Bun environment)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Highlight mentions in text by wrapping them in HTML spans
 * @param text - The text to highlight
 * @param className - CSS class name for mention spans (default: 'mention')
 * @returns HTML string with highlighted mentions
 *
 * @example
 * highlightMentions('Hello @john!', 'user-mention')
 * // Returns: 'Hello <span class="user-mention">@john</span>!'
 */
export function highlightMentions(
  text: string | null | undefined,
  className: string = 'mention'
): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  const mentions = parseMentions(text);

  if (mentions.length === 0) {
    return escapeHtml(text);
  }

  let result = '';
  let lastIndex = 0;

  for (const mention of mentions) {
    // Add text before mention (escaped)
    result += escapeHtml(text.slice(lastIndex, mention.start));

    // Add highlighted mention
    result += `<span class="${className}">${escapeHtml(mention.match)}</span>`;

    lastIndex = mention.end;
  }

  // Add remaining text after last mention (escaped)
  result += escapeHtml(text.slice(lastIndex));

  return result;
}

/**
 * Check if a specific user is mentioned in text
 * @param text - The text to check
 * @param username - The username to look for (case-insensitive)
 * @returns true if username is mentioned
 *
 * @example
 * isMentioned('Hello @john!', 'john')  // true
 * isMentioned('Hello @john!', 'Jane')  // false
 * isMentioned('Hello @John!', 'john')  // true (case-insensitive)
 */
export function isMentioned(
  text: string | null | undefined,
  username: string | null | undefined
): boolean {
  if (!text || !username || typeof text !== 'string' || typeof username !== 'string') {
    return false;
  }

  const mentions = extractMentions(text);
  return mentions.includes(username.toLowerCase());
}

/**
 * Get mention suggestions based on current input
 * @param text - Current input text
 * @param cursorPosition - Current cursor position
 * @param availableUsers - List of available usernames
 * @returns Filtered list of suggested usernames
 *
 * @example
 * getMentionSuggestions('Hello @jo', 9, ['john', 'jane', 'joe'])
 * // Returns: ['john', 'joe']
 */
export function getMentionSuggestions(
  text: string,
  cursorPosition: number,
  availableUsers: string[]
): string[] {
  if (!text || cursorPosition < 1) {
    return [];
  }

  // Find the last @ before cursor
  const textBeforeCursor = text.slice(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return [];
  }

  // Check if @ is at start or preceded by whitespace
  if (lastAtIndex > 0 && !/\s/.test(textBeforeCursor[lastAtIndex - 1])) {
    return [];
  }

  // Extract partial username after @
  const partialUsername = textBeforeCursor.slice(lastAtIndex + 1);

  // If there's a space after @, don't suggest
  if (partialUsername.includes(' ')) {
    return [];
  }

  // Filter users by partial match (case-insensitive)
  const lowerPartial = partialUsername.toLowerCase();
  return availableUsers.filter((user) =>
    user.toLowerCase().startsWith(lowerPartial)
  );
}

/**
 * Replace the current mention being typed with a complete username
 * @param text - Current input text
 * @param cursorPosition - Current cursor position
 * @param username - Username to insert
 * @returns Object with new text and cursor position
 *
 * @example
 * completeMention('Hello @jo', 9, 'john')
 * // Returns: { text: 'Hello @john ', newCursorPosition: 12 }
 */
export function completeMention(
  text: string,
  cursorPosition: number,
  username: string
): { text: string; newCursorPosition: number } {
  const textBeforeCursor = text.slice(0, cursorPosition);
  const textAfterCursor = text.slice(cursorPosition);

  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex === -1) {
    return { text, newCursorPosition: cursorPosition };
  }

  // Replace from @ to cursor with @username
  const newText =
    text.slice(0, lastAtIndex) +
    `@${username} ` +
    textAfterCursor;

  const newCursorPosition = lastAtIndex + username.length + 2; // +2 for @ and space

  return {
    text: newText,
    newCursorPosition,
  };
}
