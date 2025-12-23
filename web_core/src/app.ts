/**
 * Animal Zoom - Main Application Entry Point
 * Zoom-style multi-canvas Babylon.js interface
 * Based on design-specification.md
 */

import ParticipantManager from './scene/ParticipantManager';
import ControlBar from './components/ControlBar';
import JoinScreen from './components/JoinScreen';
import './styles/main.css';

class App {
  private participantManager?: ParticipantManager;
  private controlBar?: ControlBar;
  private appContainer: HTMLElement | null;

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
    this.participantManager = new ParticipantManager(primaryCanvas);

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
      setTimeout(() => {
        if (this.participantManager) {
          const participant = this.participantManager.addParticipant(
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
}

// Start the application
console.log('🚀 Starting Animal Zoom...');
new App();

// Log keyboard shortcuts
console.log('⌨️ Keyboard shortcuts:');
console.log('  - Shift+Ctrl+Alt+I: Toggle Babylon.js Inspector (when available)');
