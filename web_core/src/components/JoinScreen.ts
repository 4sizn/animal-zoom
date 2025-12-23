/**
 * JoinScreen Component
 * Manages the pre-join screen with camera preview
 */

export interface JoinScreenCallbacks {
  onJoin?: (options: { isMuted: boolean; isCameraOff: boolean }) => void;
}

export class JoinScreen {
  private joinScreen: HTMLElement | null;
  private joinButton: HTMLButtonElement | null;
  private muteButton: HTMLButtonElement | null = null;
  private cameraButton: HTMLButtonElement | null = null;
  private cameraOffOverlay: HTMLElement | null;

  private isMuted: boolean = false;
  private isCameraOff: boolean = true; // Default to camera off

  private callbacks: JoinScreenCallbacks;

  constructor(callbacks: JoinScreenCallbacks = {}) {
    this.callbacks = callbacks;

    // Get elements
    this.joinScreen = document.getElementById('join-screen');
    this.joinButton = document.getElementById('join-now-btn') as HTMLButtonElement;
    this.cameraOffOverlay = this.joinScreen?.querySelector('.camera-off-overlay') as HTMLElement;

    // Get control buttons in join screen
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
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Join button
    this.joinButton?.addEventListener('click', () => {
      this.handleJoin();
    });

    // Mute button
    this.muteButton?.addEventListener('click', () => {
      this.toggleMute();
    });

    // Camera button
    this.cameraButton?.addEventListener('click', () => {
      this.toggleCamera();
    });
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
  }

  /**
   * Handle join button click
   */
  handleJoin(): void {
    // Call callback with current state
    if (this.callbacks.onJoin) {
      this.callbacks.onJoin({
        isMuted: this.isMuted,
        isCameraOff: this.isCameraOff,
      });
    }

    // Hide join screen
    this.hide();
  }

  /**
   * Show join screen
   */
  show(): void {
    if (this.joinScreen) {
      this.joinScreen.classList.remove('hidden');
      this.joinScreen.style.display = 'flex';
    }
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
   * Set mute state programmatically
   */
  setMuteState(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.updateUI();
  }

  /**
   * Set camera state programmatically
   */
  setCameraState(isCameraOff: boolean): void {
    this.isCameraOff = isCameraOff;
    this.updateUI();
  }
}

export default JoinScreen;
