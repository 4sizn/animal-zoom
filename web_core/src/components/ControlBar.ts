/**
 * ControlBar Component
 * Manages the bottom control bar with meeting controls
 */

export interface ControlBarCallbacks {
  onMuteToggle?: (isMuted: boolean) => void;
  onCameraToggle?: (isCameraOff: boolean) => void;
  onShare?: () => void;
  onLeave?: () => void;
  onEditCharacter?: () => void;
  onEditRoom?: () => void;
}

export class ControlBar {
  private muteButton: HTMLButtonElement | null;
  private cameraButton: HTMLButtonElement | null;
  private shareButton: HTMLButtonElement | null;
  private leaveButton: HTMLButtonElement | null;
  private editCharacterButton: HTMLButtonElement | null;
  private editRoomButton: HTMLButtonElement | null;

  private isMuted: boolean = false;
  private isCameraOff: boolean = false;

  private callbacks: ControlBarCallbacks;

  constructor(callbacks: ControlBarCallbacks = {}) {
    this.callbacks = callbacks;

    // Get button elements
    this.muteButton = document.querySelector('[data-action="mute"]') as HTMLButtonElement;
    this.cameraButton = document.querySelector('[data-action="camera"]') as HTMLButtonElement;
    this.shareButton = document.querySelector('[data-action="share"]') as HTMLButtonElement;
    this.leaveButton = document.querySelector('[data-action="leave"]') as HTMLButtonElement;
    this.editCharacterButton = document.querySelector('[data-action="edit-character"]') as HTMLButtonElement;
    this.editRoomButton = document.querySelector('[data-action="edit-room"]') as HTMLButtonElement;

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for control buttons
   */
  private setupEventListeners(): void {
    // Mute button
    this.muteButton?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Camera button
    this.cameraButton?.addEventListener('click', () => {
      this.toggleCamera();
    });

    // Share button
    this.shareButton?.addEventListener('click', () => {
      this.handleShare();
    });

    // Leave button
    this.leaveButton?.addEventListener('click', () => {
      this.handleLeave();
    });

    // Edit character button
    this.editCharacterButton?.addEventListener('click', () => {
      this.handleEditCharacter();
    });

    // Edit room button
    this.editRoomButton?.addEventListener('click', () => {
      this.handleEditRoom();
    });
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateMuteButton();

    // Call callback
    if (this.callbacks.onMuteToggle) {
      this.callbacks.onMuteToggle(this.isMuted);
    }
  }

  /**
   * Toggle camera state
   */
  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    this.updateCameraButton();

    // Call callback
    if (this.callbacks.onCameraToggle) {
      this.callbacks.onCameraToggle(this.isCameraOff);
    }
  }

  /**
   * Handle share button click
   */
  handleShare(): void {
    if (this.callbacks.onShare) {
      this.callbacks.onShare();
    }
  }

  /**
   * Handle leave button click
   */
  handleLeave(): void {
    if (this.callbacks.onLeave) {
      this.callbacks.onLeave();
    } else {
      // Default behavior: confirm and reload
      if (confirm('Are you sure you want to leave the meeting?')) {
        window.location.reload();
      }
    }
  }

  /**
   * Handle edit character button click
   */
  handleEditCharacter(): void {
    if (this.callbacks.onEditCharacter) {
      this.callbacks.onEditCharacter();
    }
  }

  /**
   * Handle edit room button click
   */
  handleEditRoom(): void {
    if (this.callbacks.onEditRoom) {
      this.callbacks.onEditRoom();
    }
  }

  /**
   * Update mute button visual state
   */
  private updateMuteButton(): void {
    if (!this.muteButton) return;

    const label = this.muteButton.querySelector('.control-label');

    if (this.isMuted) {
      this.muteButton.classList.add('control-btn-danger');
      this.muteButton.classList.remove('active');
      if (label) {
        label.textContent = 'Unmute';
      }
      this.muteButton.setAttribute('aria-label', 'Unmute');
    } else {
      this.muteButton.classList.remove('control-btn-danger');
      this.muteButton.classList.add('active');
      if (label) {
        label.textContent = 'Mute';
      }
      this.muteButton.setAttribute('aria-label', 'Mute');
    }
  }

  /**
   * Update camera button visual state
   */
  private updateCameraButton(): void {
    if (!this.cameraButton) return;

    const label = this.cameraButton.querySelector('.control-label');

    if (this.isCameraOff) {
      this.cameraButton.classList.add('control-btn-danger');
      this.cameraButton.classList.remove('active');
      if (label) {
        label.textContent = 'Start Video';
      }
      this.cameraButton.setAttribute('aria-label', 'Start Video');
    } else {
      this.cameraButton.classList.remove('control-btn-danger');
      this.cameraButton.classList.add('active');
      if (label) {
        label.textContent = 'Stop Video';
      }
      this.cameraButton.setAttribute('aria-label', 'Stop Video');
    }
  }

  /**
   * Set mute state programmatically
   */
  setMuteState(isMuted: boolean): void {
    if (this.isMuted !== isMuted) {
      this.isMuted = isMuted;
      this.updateMuteButton();
    }
  }

  /**
   * Set camera state programmatically
   */
  setCameraState(isCameraOff: boolean): void {
    if (this.isCameraOff !== isCameraOff) {
      this.isCameraOff = isCameraOff;
      this.updateCameraButton();
    }
  }

  /**
   * Get current mute state
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Get current camera state
   */
  isCameraOffState(): boolean {
    return this.isCameraOff;
  }

  /**
   * Enable/disable share button
   */
  setShareEnabled(enabled: boolean): void {
    if (this.shareButton) {
      this.shareButton.disabled = !enabled;
    }
  }

  /**
   * Show/hide control bar
   */
  setVisible(visible: boolean): void {
    const controlBar = document.querySelector('.control-bar') as HTMLElement;
    if (controlBar) {
      controlBar.style.display = visible ? 'flex' : 'none';
    }
  }
}

export default ControlBar;
