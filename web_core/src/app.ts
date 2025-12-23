/**
 * Animal Zoom - Main Application Entry Point
 * Zoom-style multi-canvas Babylon.js interface
 * Based on design-specification.md
 */

import ParticipantManager from './scene/ParticipantManager';
import ControlBar from './components/ControlBar';
import JoinScreen from './components/JoinScreen';
import { ResourceLoader } from './resources/ResourceLoader';
import { ResourceStorage } from './resources/ResourceStorage';
import { EditMyAnimal } from './editors/EditMyAnimal';
import { EditMyRoom } from './editors/EditMyRoom';
import './styles/main.css';

class App {
  private participantManager?: ParticipantManager;
  private controlBar?: ControlBar;
  private appContainer: HTMLElement | null;
  private storage?: ResourceStorage;
  private loader?: ResourceLoader;
  private currentEditor?: EditMyAnimal | EditMyRoom;
  private readonly localUserId = 'local-user'; // Current user's ID

  // Test participant names from concept images
  private testParticipantNames = [
    'k.k. slider',
    'joey',
    'filo',
    'josh',
    'emre',
    'christina',
    'pollox',
    'sab',
    'tukka',
  ];

  constructor() {
    this.appContainer = document.getElementById('app');
    this.init();
  }

  /**
   * Initialize the application
   */
  private init(): void {
    console.log('🎮 Animal Zoom - Initializing...');

    // Setup join screen
    const joinScreen = new JoinScreen({
      onJoin: (options) => {
        console.log('📞 Joining meeting...', options);
        this.joinMeeting(options);
      },
    });

    console.log('✅ Join screen ready', joinScreen);
  }

  /**
   * Join the meeting and initialize main app
   */
  private joinMeeting(options: { isMuted: boolean; isCameraOff: boolean }): void {
    // Show main app container
    if (this.appContainer) {
      this.appContainer.classList.add('active');
    }

    // Initialize ParticipantManager with a primary canvas
    const primaryCanvas = document.createElement('canvas');
    this.storage = new ResourceStorage();
    this.loader = new ResourceLoader(this.storage);
    this.participantManager = new ParticipantManager(primaryCanvas, this.loader);

    console.log('🎬 ParticipantManager initialized');

    // Initialize ControlBar
    this.controlBar = new ControlBar({
      onMuteToggle: (isMuted) => {
        console.log('🎤 Mute toggled:', isMuted);
        // In a real app, this would toggle the local user's audio
      },
      onCameraToggle: (isCameraOff) => {
        console.log('📹 Camera toggled:', isCameraOff);
        // In a real app, this would toggle the local user's video
      },
      onShare: () => {
        console.log('🖥️ Share screen clicked');
        alert('Screen sharing would be implemented here');
      },
      onLeave: () => {
        console.log('👋 Leave meeting clicked');
        if (confirm('Are you sure you want to leave the meeting?')) {
          this.leaveMeeting();
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

    // Set initial control bar state from join screen options
    this.controlBar.setMuteState(options.isMuted);
    this.controlBar.setCameraState(options.isCameraOff);

    console.log('🎛️ ControlBar initialized');

    // Add test participants with staggered timing for visual effect
    this.addTestParticipants();

    // Simulate active speaker changes
    this.simulateActiveSpeaker();
  }

  /**
   * Add test participants to the meeting
   */
  private addTestParticipants(): void {
    console.log('👥 Adding test participants...');

    this.testParticipantNames.forEach((name, index) => {
      setTimeout(async () => {
        if (this.participantManager) {
          const participant = await this.participantManager.addParticipant(
            `participant-${index}`,
            name
          );
          console.log(`✅ Added participant: ${name} (${participant.id})`);

          // Randomly mute some participants (for testing)
          if (Math.random() > 0.7) {
            this.participantManager.toggleMute(participant.id);
          }

          // Randomly turn off camera for some (for testing)
          if (Math.random() > 0.8) {
            this.participantManager.toggleCamera(participant.id);
          }
        }
      }, index * 300); // Stagger additions by 300ms
    });
  }

  /**
   * Simulate active speaker changes (for testing)
   */
  private simulateActiveSpeaker(): void {
    let currentSpeakerIndex = 0;

    setInterval(() => {
      if (this.participantManager) {
        const participants = Array.from(
          this.participantManager.getParticipants().values()
        );

        if (participants.length > 0) {
          const speakerId = participants[currentSpeakerIndex].id;
          this.participantManager.setActiveSpeaker(speakerId);

          currentSpeakerIndex = (currentSpeakerIndex + 1) % participants.length;
        }
      }
    }, 3000); // Change active speaker every 3 seconds
  }

  /**
   * Leave the meeting
   */
  private leaveMeeting(): void {
    console.log('👋 Leaving meeting...');

    // Dispose resources
    if (this.participantManager) {
      this.participantManager.dispose();
    }

    // Reload page (in a real app, you'd navigate elsewhere)
    window.location.reload();
  }

  /**
   * Open character editor
   */
  private openEditCharacter(): void {
    if (!this.loader) return;

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
      this.localUserId,
      undefined,
      {
        onSave: (config) => {
          console.log('✅ Character saved:', config);
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
    if (!this.loader) return;

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
      this.localUserId,
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

    // Reload participants to show updated character/room
    // (In a real app, you might want to only reload the local participant)
    console.log('🔄 Editor closed, returning to main view');
  }
}

// Start the application
console.log('🚀 Starting Animal Zoom...');
new App();

// Log keyboard shortcuts
console.log('⌨️ Keyboard shortcuts:');
console.log('  - Shift+Ctrl+Alt+I: Toggle Babylon.js Inspector (when available)');
