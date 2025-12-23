# Animal Zoom - Web Core

A Zoom-style multi-canvas video conferencing interface powered by Babylon.js.

## Overview

This implementation features:
- **Responsive Grid Layout**: 2x2, 3x3, or 4x4 grid based on participant count
- **Multi-Canvas Rendering**: Single Babylon.js Engine with multiple scenes
- **3D Character Avatars**: Each participant rendered in their own 3D scene
- **Interactive Controls**: Mute, camera, share, and leave meeting controls
- **Join Screen**: Pre-meeting screen with camera preview
- **Active Speaker Indicator**: Visual pulsing effect on the active speaker

## Project Structure

```
web_core/
├── src/
│   ├── app.ts                      # Application entry point
│   ├── scene/
│   │   └── ParticipantManager.ts   # Multi-canvas management
│   ├── components/
│   │   ├── ControlBar.ts           # Control bar logic
│   │   └── JoinScreen.ts           # Join screen logic
│   └── styles/
│       ├── main.css                # Main stylesheet (imports all)
│       ├── variables.css           # CSS custom properties
│       ├── grid.css                # Grid layout system
│       ├── controls.css            # Control bar styles
│       └── join-screen.css         # Join screen styles
├── index.html                      # HTML structure
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript configuration
```

## Design Specification

This implementation follows the comprehensive design specification located at:
`/docs/design-specification.md` (1500+ lines)

Key specifications include:
- **Color System**: Exact hex codes for backgrounds, accents, borders
- **Typography**: Font sizes, weights, and families
- **Layout System**: Grid configurations and responsive breakpoints
- **3D Scene Setup**: Camera angles, lighting, and character positioning
- **Interactive States**: Hover, active speaker, muted, camera off

## Getting Started

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
bun run build
```

## Features

### 1. Join Screen
- Camera preview (defaults to "Camera is off" state)
- Mute/unmute toggle
- Camera on/off toggle
- "Join now" button to enter the meeting

### 2. Participant Grid
- **1x1 Grid**: Single participant (centered, max-width 1280px)
- **2x2 Grid**: 2-4 participants
- **3x3 Grid**: 5-9 participants (default for testing)
- **4x4 Grid**: 10-16 participants

### 3. 3D Scenes
Each participant has:
- Individual Babylon.js scene
- ArcRotateCamera (α: π/2, β: π/3, radius: 3.5)
- Three-point lighting system (key, fill, rim)
- Animated 3D character (placeholder sphere for now)

### 4. Control Bar
Located at the bottom with controls for:
- **Mute/Unmute**: Toggle audio
- **Stop/Start Video**: Toggle camera
- **Share**: Screen sharing (placeholder)
- **Leave**: Leave meeting with confirmation

### 5. Interactive States
- **Hover**: Scale 1.02, elevated shadow
- **Active Speaker**: Pulsing green border animation
- **Muted**: Red microphone icon in bottom-right
- **Camera Off**: "Camera is off" text overlay

### 6. Responsive Design
- **Desktop Large (1920px+)**: Full 3x3 or 4x4 grids
- **Desktop (1280px-1919px)**: Standard grids
- **Tablet (768px-1279px)**: 2x2 grid, smaller controls
- **Mobile (<768px)**: 1x1 grid (speaker view only)

## Test Participants

The application automatically adds 9 test participants with names from the concept images:
1. k.k. slider
2. joey
3. filo
4. josh
5. emre
6. christina
7. pollox
8. sab
9. tukka

## CSS Variables

All design tokens are defined in `/src/styles/variables.css`:

### Colors
- `--bg-primary`: #1a1a1a (main background)
- `--bg-canvas-cell`: #2a2624 (canvas cell)
- `--accent-red`: #d84a48 (danger actions)
- `--accent-green`: #8b9f7c (success actions)
- `--border-active-speaker`: #8b9f7c (active speaker)

### Layout
- `--control-bar-height`: 80px
- `--grid-gap-medium`: 8px
- `--grid-padding-medium`: 12px

### Typography
- `--font-name-medium`: 14px
- `--font-control-label`: 13px
- `--font-join-button`: 18px

## Architecture

### Single Engine, Multiple Scenes Pattern

The `ParticipantManager` class implements the efficient multi-canvas pattern:
1. **Single Engine**: One Babylon.js engine instance
2. **Multiple Scenes**: Each participant has their own scene
3. **Render Loop**: All scenes rendered sequentially per frame

```typescript
engine.runRenderLoop(() => {
  participants.forEach(participant => {
    if (!participant.cameraOff) {
      participant.scene.render();
    }
  });
});
```

### Component Architecture

- **App**: Main application controller
- **ParticipantManager**: Manages all participants and their 3D scenes
- **ControlBar**: Handles user interactions with meeting controls
- **JoinScreen**: Manages pre-meeting join flow

## Performance Optimizations

1. **Conditional Rendering**: Camera-off participants don't render
2. **Staggered Loading**: Participants added with 300ms delays
3. **Scene Optimization**: Minimal geometry for placeholder characters
4. **CSS Transitions**: Hardware-accelerated transforms
5. **Viewport Culling**: Only visible cells are rendered

## Next Steps

To enhance this implementation:

1. **Load Real Characters**: Replace placeholder spheres with GLB/GLTF models
2. **Add Room Environments**: Import cozy room 3D models
3. **Implement WebRTC**: Add real video/audio streaming
4. **Add Chat**: Implement text chat functionality
5. **Record Meeting**: Add recording capabilities
6. **Optimize Performance**: Add LOD (Level of Detail) for characters
7. **Add Animations**: Idle animations, lip sync, gestures

## Keyboard Shortcuts

- **Shift+Ctrl+Alt+I**: Toggle Babylon.js Inspector (when available)

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (may need WebGL tweaks)

## Dependencies

- **@babylonjs/core**: 3D rendering engine
- **@babylonjs/inspector**: Development debugging tool
- **TypeScript**: Type-safe development
- **Vite**: Fast development and build tool

## License

Part of the Animal Zoom project.

## References

- Design Specification: `/docs/design-specification.md`
- Concept Images: `/docs/concept/*.png`
- Babylon.js Docs: https://doc.babylonjs.com
