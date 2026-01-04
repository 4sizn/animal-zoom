/**
 * Debug Panel Component Tests
 * TDD approach: Write tests first, then implement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DebugPanel } from '../DebugPanel';

describe('DebugPanel - Phase 1: Structure and Styling', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('RED Phase - These tests should FAIL initially', () => {
    it('renders collapsed by default', () => {
      render(<DebugPanel />);

      // Should have toggle button
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      expect(toggleButton).toBeDefined();

      // Panel content should not be visible
      const panel = screen.queryByTestId('debug-panel-content');
      expect(panel).toBeNull();
    });

    it('expands when toggle button is clicked', async () => {
      render(<DebugPanel />);

      const toggleButton = screen.getByRole('button', { name: /debug/i });

      // Click to expand
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const panel = screen.getByTestId('debug-panel-content');
        expect(panel).toBeDefined();
      });
    });

    it('collapses when toggle button is clicked again', async () => {
      render(<DebugPanel />);

      const toggleButton = screen.getByRole('button', { name: /debug/i });

      // Expand
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByTestId('debug-panel-content')).toBeDefined();
      });

      // Collapse
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.queryByTestId('debug-panel-content')).toBeNull();
      });
    });

    it('displays connection status placeholder', async () => {
      render(<DebugPanel />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Should show WebSocket status section
        expect(screen.getByText(/websocket/i)).toBeDefined();
        expect(screen.getByText(/disconnected/i)).toBeDefined();
      });
    });

    it('displays user ID when provided', async () => {
      const testUserId = 'test-user-123';
      render(<DebugPanel userId={testUserId} />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(testUserId)).toBeDefined();
      });
    });

    it('displays "Guest" when no user ID provided', async () => {
      render(<DebugPanel />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/guest/i)).toBeDefined();
      });
    });

    it('has copy button for user ID', async () => {
      const testUserId = 'test-user-123';

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<DebugPanel userId={testUserId} />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const copyButtons = screen.getAllByRole('button', { name: /copy/i });
        expect(copyButtons.length).toBeGreaterThan(0);
      });

      // Click copy button for user ID
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(testUserId);
      });
    });

    it('displays room info placeholder', async () => {
      render(<DebugPanel />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/room/i)).toBeDefined();
        expect(screen.getByText(/not in a room/i)).toBeDefined();
      });
    });

    it('displays latest message placeholder', async () => {
      render(<DebugPanel />);

      // Expand panel
      const toggleButton = screen.getByRole('button', { name: /debug/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/message/i)).toBeDefined();
        expect(screen.getByText(/no messages/i)).toBeDefined();
      });
    });

    it('can be toggled via keyboard (Enter key)', async () => {
      render(<DebugPanel />);

      const toggleButton = screen.getByRole('button', { name: /debug/i });

      // Focus and press Enter
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByTestId('debug-panel-content')).toBeDefined();
      });
    });

    it('can be toggled via keyboard (Space key)', async () => {
      render(<DebugPanel />);

      const toggleButton = screen.getByRole('button', { name: /debug/i });

      // Focus and press Space
      toggleButton.focus();
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });

      await waitFor(() => {
        expect(screen.getByTestId('debug-panel-content')).toBeDefined();
      });
    });

    it('applies custom className when provided', () => {
      const customClass = 'my-custom-class';
      render(<DebugPanel className={customClass} />);

      const container = screen.getByTestId('debug-panel-container');
      expect(container.className).toContain(customClass);
    });
  });
});
