/**
 * Enhanced JoinScreen Component
 * Includes authentication and room joining with API integration
 */

import { authApi, roomsApi, tokenManager } from '../api';
import type { AuthResponse, Participant } from '../api/types';

export interface JoinScreenOptions {
  isMuted: boolean;
  isCameraOff: boolean;
  displayName: string;
  roomCode: string;
  authResponse: AuthResponse;
  participant: Participant;
}

export interface JoinScreenCallbacks {
  onJoin?: (options: JoinScreenOptions) => void;
  onError?: (error: string) => void;
}

export class JoinScreenEnhanced {
  private joinScreen: HTMLElement | null;
  private joinButton: HTMLButtonElement | null;
  private createRoomButton: HTMLButtonElement | null;
  private muteButton: HTMLButtonElement | null = null;
  private cameraButton: HTMLButtonElement | null = null;
  private cameraOffOverlay: HTMLElement | null;
  private displayNameInput: HTMLInputElement | null;
  private roomCodeInput: HTMLInputElement | null;
  private errorMessage: HTMLElement | null;
  private successMessage: HTMLElement | null;
  private loadingIndicator: HTMLElement | null;

  private isMuted: boolean = false;
  private isCameraOff: boolean = true;
  private isJoining: boolean = false;
  private isCreatingRoom: boolean = false;

  private callbacks: JoinScreenCallbacks;

  constructor(callbacks: JoinScreenCallbacks = {}) {
    this.callbacks = callbacks;

    // Get elements
    this.joinScreen = document.getElementById('join-screen');
    this.joinButton = document.getElementById('join-now-btn') as HTMLButtonElement;
    this.createRoomButton = document.getElementById('create-room-btn') as HTMLButtonElement;
    this.cameraOffOverlay = this.joinScreen?.querySelector('.camera-off-overlay') as HTMLElement;
    this.displayNameInput = document.getElementById('display-name-input') as HTMLInputElement;
    this.roomCodeInput = document.getElementById('room-code-input') as HTMLInputElement;
    this.errorMessage = document.getElementById('join-error-message') as HTMLElement;
    this.successMessage = document.getElementById('join-success-message') as HTMLElement;
    this.loadingIndicator = document.getElementById('join-loading') as HTMLElement;

    // Get control buttons
    const joinControls = this.joinScreen?.querySelectorAll('.join-control-btn');
    if (joinControls) {
      joinControls.forEach((btn) => {
        const button = btn as HTMLButtonElement;
        const action = button.dataset.action;
        if (action === 'mute') {
          this.muteButton = button;
        } else if (action === 'camera') {
          this.cameraButton = button;
        }
      });
    }

    this.setupEventListeners();
    this.updateUI();
    this.loadSavedDisplayName();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Join button
    this.joinButton?.addEventListener('click', () => {
      this.handleJoin();
    });

    // Create Room button
    this.createRoomButton?.addEventListener('click', () => {
      this.handleCreateRoom();
    });

    // Mute button
    this.muteButton?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Camera button
    this.cameraButton?.addEventListener('click', () => {
      this.toggleCamera();
    });

    // Enter key on inputs
    this.displayNameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.roomCodeInput?.focus();
      }
    });

    this.roomCodeInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleJoin();
      }
    });

    // Auto-uppercase room code
    this.roomCodeInput?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      input.value = input.value.toUpperCase();
    });
  }

  /**
   * Load saved display name from localStorage
   */
  private loadSavedDisplayName(): void {
    const saved = localStorage.getItem('animal-zoom:display-name');
    if (saved && this.displayNameInput) {
      this.displayNameInput.value = saved;
    }
  }

  /**
   * Save display name to localStorage
   */
  private saveDisplayName(name: string): void {
    localStorage.setItem('animal-zoom:display-name', name);
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateUI();
  }

  /**
   * Toggle camera state
   */
  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    this.updateUI();
  }

  /**
   * Update UI based on current state
   */
  private updateUI(): void {
    // Update mute button
    if (this.muteButton) {
      if (this.isMuted) {
        this.muteButton.classList.add('join-control-danger');
        this.muteButton.classList.remove('active');
        this.muteButton.setAttribute('aria-label', 'Unmute microphone');
      } else {
        this.muteButton.classList.remove('join-control-danger');
        this.muteButton.classList.add('active');
        this.muteButton.setAttribute('aria-label', 'Mute microphone');
      }
    }

    // Update camera button
    if (this.cameraButton) {
      if (this.isCameraOff) {
        this.cameraButton.classList.add('join-control-danger');
        this.cameraButton.classList.remove('active');
        this.cameraButton.setAttribute('aria-label', 'Turn on camera');
      } else {
        this.cameraButton.classList.remove('join-control-danger');
        this.cameraButton.classList.add('active');
        this.cameraButton.setAttribute('aria-label', 'Turn off camera');
      }
    }

    // Update camera off overlay
    if (this.cameraOffOverlay) {
      if (this.isCameraOff) {
        this.cameraOffOverlay.classList.remove('hidden');
      } else {
        this.cameraOffOverlay.classList.add('hidden');
      }
    }

    // Update join button state
    if (this.joinButton) {
      this.joinButton.disabled = this.isJoining || this.isCreatingRoom;
      this.joinButton.textContent = this.isJoining ? 'Joining...' : 'Join Now';
    }

    // Update create room button state
    if (this.createRoomButton) {
      this.createRoomButton.disabled = this.isCreatingRoom || this.isJoining;
      this.createRoomButton.textContent = this.isCreatingRoom ? 'Creating...' : 'Create New Room';
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  private hideError(): void {
    if (this.errorMessage) {
      this.errorMessage.classList.add('hidden');
    }
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    if (this.successMessage) {
      this.successMessage.textContent = message;
      this.successMessage.classList.remove('hidden');
    }
  }

  /**
   * Hide success message
   */
  private hideSuccess(): void {
    if (this.successMessage) {
      this.successMessage.classList.add('hidden');
    }
  }

  /**
   * Show loading indicator
   */
  private showLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.remove('hidden');
    }
  }

  /**
   * Hide loading indicator
   */
  private hideLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('hidden');
    }
  }

  /**
   * Validate form inputs
   */
  private validateInputs(): { valid: boolean; error?: string } {
    const displayName = this.displayNameInput?.value.trim() || '';
    const roomCode = this.roomCodeInput?.value.trim() || '';

    if (!displayName) {
      return { valid: false, error: 'Please enter your name' };
    }

    if (displayName.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (displayName.length > 30) {
      return { valid: false, error: 'Name must be less than 30 characters' };
    }

    if (!roomCode) {
      return { valid: false, error: 'Please enter a room code' };
    }

    if (roomCode.length < 3) {
      return { valid: false, error: 'Room code must be at least 3 characters' };
    }

    return { valid: true };
  }

  /**
   * Handle join button click
   */
  async handleJoin(): Promise<void> {
    if (this.isJoining) return;

    this.hideError();
    this.hideSuccess();

    // Validate inputs
    const validation = this.validateInputs();
    if (!validation.valid) {
      this.showError(validation.error!);
      return;
    }

    const displayName = this.displayNameInput!.value.trim();
    const roomCode = this.roomCodeInput!.value.trim().toUpperCase();

    this.isJoining = true;
    this.updateUI();
    this.showLoading();

    try {
      // Save display name for future use
      this.saveDisplayName(displayName);

      // 1. Create guest user (or login if already have token)
      let authResponse: AuthResponse;

      if (authApi.isAuthenticated()) {
        // Already have a token, just verify it's still valid
        try {
          const currentUser = await authApi.getCurrentUser();
          const token = tokenManager.getToken();
          authResponse = {
            accessToken: token || '',
            user: currentUser,
          };
        } catch (error) {
          // Token expired or invalid, create new guest
          authResponse = await authApi.createGuest({ displayName });
        }
      } else {
        // No token, create new guest
        authResponse = await authApi.createGuest({ displayName });
      }

      console.log('✅ Authenticated as:', authResponse.user.displayName);

      // 2. Join the room
      const participant = await roomsApi.joinRoom(roomCode, {
        displayName: authResponse.user.displayName,
      });

      console.log('✅ Joined room:', roomCode);

      // 3. Call callback with all data
      if (this.callbacks.onJoin) {
        this.callbacks.onJoin({
          isMuted: this.isMuted,
          isCameraOff: this.isCameraOff,
          displayName: authResponse.user.displayName,
          roomCode,
          authResponse,
          participant,
        });
      }

      // Hide join screen
      this.hide();
    } catch (error: any) {
      console.error('Failed to join:', error);

      let errorMessage = 'Failed to join room';

      if (error.response?.status === 404) {
        errorMessage = 'Room not found. Please check the room code.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Room is full or you do not have permission to join.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);

      if (this.callbacks.onError) {
        this.callbacks.onError(errorMessage);
      }
    } finally {
      this.isJoining = false;
      this.hideLoading();
      this.updateUI();
    }
  }

  /**
   * Show join screen
   */
  show(): void {
    if (this.joinScreen) {
      this.joinScreen.classList.remove('hidden');
      this.joinScreen.style.display = 'flex';
    }
    this.hideError();
    this.hideSuccess();
    this.displayNameInput?.focus();
  }

  /**
   * Hide join screen
   */
  hide(): void {
    if (this.joinScreen) {
      this.joinScreen.classList.add('hidden');
      this.joinScreen.style.display = 'none';
    }
  }

  /**
   * Handle create room button click
   */
  async handleCreateRoom(): Promise<void> {
    if (this.isCreatingRoom || this.isJoining) return;

    this.hideError();
    this.hideSuccess();
    this.isCreatingRoom = true;
    this.updateUI();
    this.showLoading();

    try {
      // Create new room via API
      const roomCode = await this.createRoom();

      console.log('✅ Room created:', roomCode);

      // Auto-fill room code input
      if (this.roomCodeInput) {
        this.roomCodeInput.value = roomCode;
      }

      // Show success message
      this.showSuccess(`Room created successfully! Code: ${roomCode}`);

      // Focus on display name input if empty, otherwise focus on join button
      if (!this.displayNameInput?.value.trim()) {
        this.displayNameInput?.focus();
      } else {
        this.joinButton?.focus();
      }

      this.hideLoading();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        this.hideSuccess();
      }, 5000);
    } catch (error: any) {
      console.error('Failed to create room:', error);

      let errorMessage = 'Failed to create room';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);

      if (this.callbacks.onError) {
        this.callbacks.onError(errorMessage);
      }
    } finally {
      this.isCreatingRoom = false;
      this.hideLoading();
      this.updateUI();
    }
  }

  /**
   * Create a new room (convenience method)
   */
  async createRoom(): Promise<string> {
    try {
      const room = await roomsApi.createRoom();
      return room.code;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isMuted: this.isMuted,
      isCameraOff: this.isCameraOff,
      displayName: this.displayNameInput?.value.trim() || '',
      roomCode: this.roomCodeInput?.value.trim().toUpperCase() || '',
    };
  }
}

export default JoinScreenEnhanced;
