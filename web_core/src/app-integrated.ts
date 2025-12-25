/**
 * Animal Zoom - Integrated Application
 * Full API and WebSocket integration
 */

import ParticipantManager from './scene/ParticipantManager';
import ControlBar from './components/ControlBar';
import JoinScreenEnhanced, { type JoinScreenOptions } from './components/JoinScreenEnhanced';
import { ResourceLoader } from './resources/ResourceLoader';
import { ResourceStorageAPI } from './resources/ResourceStorageAPI';
import { EditMyAnimal } from './editors/EditMyAnimal';
import { EditMyRoom } from './editors/EditMyRoom';
import { getSocketClient } from './socket';
import type { SocketClient } from './socket/client';
import type {
  RoomJoinedData,
  UserJoinedData,
  UserLeftData,
  StateUpdateEventData,
  ChatMessageData,
} from './socket/types';
import './styles/main.css';

class IntegratedApp {
  private participantManager?: ParticipantManager;
  private controlBar?: ControlBar;
  private socketClient?: SocketClient;
  private appContainer: HTMLElement | null;
  private storage?: ResourceStorageAPI;
  private loader?: ResourceLoader;
  private currentEditor?: EditMyAnimal | EditMyRoom;

  // Session state
  private currentUserId?: string;
  private currentRoomCode?: string;
  private currentParticipantId?: string;

  constructor() {
    this.appContainer = document.getElementById('app');
    this.init();
  }

  /**
   * Initialize the application
   */
  private init(): void {
    console.log('🎮 Animal Zoom - Initializing...');

    // Setup enhanced join screen with API integration
    const joinScreen = new JoinScreenEnhanced({
      onJoin: (options) => {
        console.log('📞 Joining meeting...', options);
        this.joinMeeting(options);
      },
      onError: (error) => {
        console.error('❌ Join error:', error);
      },
    });

    console.log('✅ Join screen ready', joinScreen);
  }

  /**
   * Join the meeting with API and WebSocket
   */
  private async joinMeeting(options: JoinScreenOptions): Promise<void> {
    try {
      // Store session info
      this.currentUserId = options.authResponse.user.id;
      this.currentRoomCode = options.roomCode;
      this.currentParticipantId = options.participant.id;

      console.log('👤 User ID:', this.currentUserId);
      console.log('🏠 Room Code:', this.currentRoomCode);
      console.log('🎫 Participant ID:', this.currentParticipantId);

      // Show main app container
      if (this.appContainer) {
        this.appContainer.classList.add('active');
      }

      // Initialize resources with API-backed storage
      this.storage = new ResourceStorageAPI();
      this.loader = new ResourceLoader(this.storage);

      // Initialize ParticipantManager
      const primaryCanvas = document.createElement('canvas');
      this.participantManager = new ParticipantManager(primaryCanvas, this.loader);
      console.log('🎬 ParticipantManager initialized');

      // Initialize ControlBar
      this.setupControlBar(options);

      // Initialize WebSocket
      await this.setupWebSocket();

      // Connect to WebSocket
      this.socketClient!.connect();
    } catch (error) {
      console.error('Failed to join meeting:', error);
      alert('Failed to join meeting. Please try again.');
      this.leaveMeeting();
    }
  }

  /**
   * Setup control bar
   */
  private setupControlBar(joinOptions: JoinScreenOptions): void {
    this.controlBar = new ControlBar({
      onMuteToggle: (isMuted) => {
        console.log('🎤 Mute toggled:', isMuted);
        // In a real app, this would toggle the local user's audio
        // For now, just update the participant manager
        if (this.currentParticipantId && this.participantManager) {
          this.participantManager.toggleMute(this.currentParticipantId);
        }
      },
      onCameraToggle: (isCameraOff) => {
        console.log('📹 Camera toggled:', isCameraOff);
        // Toggle local camera
        if (this.currentParticipantId && this.participantManager) {
          this.participantManager.toggleCamera(this.currentParticipantId);
        }
      },
      onShare: () => {
        console.log('🖥️ Share screen clicked');
        alert('Screen sharing would be implemented here');
      },
      onLeave: async () => {
        console.log('👋 Leave meeting clicked');
        if (confirm('Are you sure you want to leave the meeting?')) {
          await this.leaveMeeting();
        }
      },
      onEditCharacter: () => {
        console.log('🎨 Edit character clicked');
        this.openEditCharacter();
      },
      onEditRoom: () => {
        console.log('🏠 Edit room clicked');
        this.openEditRoom();
      },
    });

    // Set initial states
    this.controlBar.setMuteState(joinOptions.isMuted);
    this.controlBar.setCameraState(joinOptions.isCameraOff);

    console.log('🎛️ ControlBar initialized');
  }

  /**
   * Setup WebSocket connection and event handlers
   */
  private async setupWebSocket(): Promise<void> {
    this.socketClient = getSocketClient({
      autoConnect: false,
    });

    // Setup event listeners
    this.socketClient.setListeners({
      onConnect: () => {
        console.log('🔌 WebSocket connected');
        // Join the room via WebSocket
        this.socketClient!.joinRoom(this.currentRoomCode!);
      },

      onDisconnect: (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        // Show reconnection message
      },

      onError: (error) => {
        console.error('🔌 WebSocket error:', error);
      },

      onRoomJoined: (data: RoomJoinedData) => {
        console.log('🏠 Room joined via WebSocket:', data);
        this.handleRoomJoined(data);
      },

      onUserJoined: (data: UserJoinedData) => {
        console.log('👋 User joined:', data.user.displayName);
        this.handleUserJoined(data);
      },

      onUserLeft: (data: UserLeftData) => {
        console.log('👋 User left:', data.userId);
        this.handleUserLeft(data);
      },

      onChatMessage: (data: ChatMessageData) => {
        console.log('💬 Chat message:', data.senderName, data.message);
        // Display chat message in UI (to be implemented)
      },

      onStateUpdate: (data: StateUpdateEventData) => {
        // Handle avatar position/rotation updates
        this.handleStateUpdate(data);
      },

      onAvatarUpdated: (data) => {
        console.log('🎨 Avatar updated:', data.userId);
        // Reload participant's avatar (to be implemented)
      },

      onRoomUpdated: (data) => {
        console.log('🏠 Room updated:', data.roomCode);
        // Reload room configuration (to be implemented)
      },
    });

    console.log('🔌 WebSocket configured');
  }

  /**
   * Handle room joined event
   */
  private async handleRoomJoined(data: RoomJoinedData): Promise<void> {
    if (!this.participantManager) return;

    // Add all existing participants
    for (const participant of data.participants) {
      await this.participantManager.addParticipant(
        participant.userId,
        participant.displayName
      );

      // Update mute/camera state
      if (participant.isActive === false) {
        this.participantManager.toggleCamera(participant.userId);
      }
    }

    console.log(`✅ Added ${data.participants.length} participants to the room`);
  }

  /**
   * Handle user joined event
   */
  private async handleUserJoined(data: UserJoinedData): Promise<void> {
    if (!this.participantManager) return;

    // Skip if this is the current user (already added in handleRoomJoined)
    if (data.user.id === this.currentUserId) return;

    await this.participantManager.addParticipant(
      data.user.id,
      data.user.displayName
    );

    console.log(`✅ Added participant: ${data.user.displayName}`);
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(data: UserLeftData): void {
    if (!this.participantManager) return;

    this.participantManager.removeParticipant(data.userId);

    console.log(`👋 Removed participant: ${data.userId}`);
  }

  /**
   * Handle state update event (position/rotation)
   */
  private handleStateUpdate(data: StateUpdateEventData): void {
    if (!this.participantManager) return;

    const participant = this.participantManager.getParticipant(data.userId);
    if (!participant || !participant.character) return;

    // Update character position
    participant.character.position.set(
      data.position.x,
      data.position.y,
      data.position.z
    );

    // Update character rotation
    participant.character.rotation.set(
      data.rotation.x,
      data.rotation.y,
      data.rotation.z
    );
  }

  /**
   * Leave the meeting
   */
  private async leaveMeeting(): Promise<void> {
    console.log('👋 Leaving meeting...');

    try {
      // Leave room via WebSocket
      if (this.socketClient && this.socketClient.isConnected()) {
        this.socketClient.leaveRoom();
        this.socketClient.disconnect();
      }

      // Dispose resources
      if (this.participantManager) {
        this.participantManager.dispose();
      }

      // Clear session state
      this.currentUserId = undefined;
      this.currentRoomCode = undefined;
      this.currentParticipantId = undefined;

      // Reload page (in a real app, you'd navigate back to join screen)
      window.location.reload();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      // Force reload anyway
      window.location.reload();
    }
  }

  /**
   * Open character editor
   */
  private openEditCharacter(): void {
    if (!this.loader || !this.currentUserId) return;

    // Hide main app
    if (this.appContainer) {
      this.appContainer.classList.add('hidden');
    }

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.className = 'editor-container';
    document.body.appendChild(editorContainer);

    // Create canvas for editor
    const editorCanvas = document.createElement('canvas');
    editorCanvas.className = 'editor-canvas';
    editorContainer.appendChild(editorCanvas);

    // Create editor
    this.currentEditor = new EditMyAnimal(
      editorCanvas,
      this.loader,
      this.currentUserId,
      undefined,
      {
        onSave: (config) => {
          console.log('✅ Character saved:', config);

          // Notify server of avatar update
          if (this.socketClient && this.socketClient.isConnected()) {
            // Extract avatar config for WebSocket
            const avatarConfig = {
              modelUrl: config.character.modelUrl || '',
              primaryColor: '#ffffff',
              secondaryColor: '#000000',
              accessories: [],
            };
            this.socketClient.updateAvatar(avatarConfig);
          }

          this.closeEditor();
        },
        onCancel: () => {
          console.log('❌ Character edit cancelled');
          this.closeEditor();
        },
      }
    );

    // Load character
    this.currentEditor.loadCharacter().catch((error) => {
      console.error('Failed to load character:', error);
    });

    // Add UI controls
    this.addEditorUI('Edit My Character');
  }

  /**
   * Open room editor
   */
  private openEditRoom(): void {
    if (!this.loader || !this.currentUserId) return;

    // Hide main app
    if (this.appContainer) {
      this.appContainer.classList.add('hidden');
    }

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    editorContainer.className = 'editor-container';
    document.body.appendChild(editorContainer);

    // Create canvas for editor
    const editorCanvas = document.createElement('canvas');
    editorCanvas.className = 'editor-canvas';
    editorContainer.appendChild(editorCanvas);

    // Create editor
    this.currentEditor = new EditMyRoom(
      editorCanvas,
      this.loader,
      this.currentUserId,
      undefined,
      {
        onSave: (config) => {
          console.log('✅ Room saved:', config);
          this.closeEditor();
        },
        onCancel: () => {
          console.log('❌ Room edit cancelled');
          this.closeEditor();
        },
      }
    );

    // Load room
    this.currentEditor.loadRoom().catch((error) => {
      console.error('Failed to load room:', error);
    });

    // Add UI controls
    this.addEditorUI('Edit My Room');
  }

  /**
   * Add UI controls to editor
   */
  private addEditorUI(title: string): void {
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) return;

    // Create UI panel
    const uiPanel = document.createElement('div');
    uiPanel.className = 'editor-ui-panel';
    uiPanel.innerHTML = `
      <h2>${title}</h2>
      <div class="editor-buttons">
        <button id="editor-save-btn" class="editor-btn editor-btn-primary">Save</button>
        <button id="editor-cancel-btn" class="editor-btn editor-btn-secondary">Cancel</button>
      </div>
    `;
    editorContainer.appendChild(uiPanel);

    // Add event listeners
    document.getElementById('editor-save-btn')?.addEventListener('click', () => {
      if (this.currentEditor) {
        this.currentEditor.save();
      }
    });

    document.getElementById('editor-cancel-btn')?.addEventListener('click', () => {
      if (this.currentEditor) {
        this.currentEditor.cancel();
      }
    });
  }

  /**
   * Close editor and return to main app
   */
  private closeEditor(): void {
    // Dispose editor
    if (this.currentEditor) {
      this.currentEditor.dispose();
      this.currentEditor = undefined;
    }

    // Remove editor container
    const editorContainer = document.getElementById('editor-container');
    if (editorContainer) {
      editorContainer.remove();
    }

    // Show main app
    if (this.appContainer) {
      this.appContainer.classList.remove('hidden');
    }

    console.log('🔄 Editor closed, returning to main view');
  }
}

// Start the application
console.log('🚀 Starting Animal Zoom (Integrated)...');
new IntegratedApp();

// Log keyboard shortcuts
console.log('⌨️ Keyboard shortcuts:');
console.log('  - Shift+Ctrl+Alt+I: Toggle Babylon.js Inspector (when available)');
