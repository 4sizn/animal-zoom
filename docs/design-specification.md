# Design Specification: Zoom-Style Multi-Canvas Babylon.js Interface

**Project:** Animal Zoom
**Version:** 1.0
**Date:** 2025-12-23
**Platform:** Babylon.js + Vite

---

## Table of Contents
1. [Overview](#overview)
2. [Layout & Grid System](#layout--grid-system)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [UI Components](#ui-components)
6. [Interactive States](#interactive-states)
7. [3D Scene Specifications](#3d-scene-specifications)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Reference Images](#reference-images)

---

## 1. Overview

This specification defines the design system for a Zoom-style video conferencing interface featuring 3D character avatars rendered in individual Babylon.js canvases. Each participant appears in their own canvas cell displaying a 3D character in a cozy room environment.

### Key Features
- Responsive grid layout (2x2, 3x3, or more based on participant count)
- Single Babylon.js Engine with multiple views/cameras
- Individual 3D character scenes per participant
- Bottom control bar with meeting controls
- Pre-join screen with camera preview
- Name labels overlaid on each canvas

---

## 2. Layout & Grid System

### 2.1 Grid Configurations

#### 3x3 Grid (7-9 participants)
**Reference:** `zoom-grid-1.png`, `zoom-grid-2.png`

```
Viewport Width: 100vw (full width)
Viewport Height: 100vh (full height minus control bar)
Grid: 3 columns × 3 rows
Gap: 8px between cells
Padding: 12px around grid container
```

**Cell Dimensions:**
```
Width: calc((100vw - 24px - 16px) / 3)  // Account for padding + gaps
Height: calc((100vh - 80px - 24px - 16px) / 3)  // Account for control bar + padding + gaps
Aspect Ratio: 4:3 (maintain for 3D scenes)
```

#### 2x2 Grid (2-4 participants)
**Reference:** `zoom-grid-3.png`

```
Grid: 2 columns × 2 rows
Gap: 12px between cells
Padding: 16px around grid container
```

**Cell Dimensions:**
```
Width: calc((100vw - 32px - 12px) / 2)
Height: calc((100vh - 80px - 32px - 12px) / 2)
Aspect Ratio: 4:3
```

#### Single Participant (1 participant)
```
Grid: 1 column × 1 row
Padding: 20px
Max Width: 1280px (centered)
Aspect Ratio: 16:9
```

### 2.2 Responsive Breakpoints

```css
/* Desktop Large: 1920px+ */
@media (min-width: 1920px) {
  /* 4x4 grid for 13-16 participants */
  /* 3x3 grid for 7-12 participants */
}

/* Desktop: 1280px - 1919px */
@media (min-width: 1280px) and (max-width: 1919px) {
  /* 3x3 grid for 7-9 participants */
  /* 2x2 grid for 2-6 participants */
}

/* Tablet: 768px - 1279px */
@media (min-width: 768px) and (max-width: 1279px) {
  /* 2x2 grid for 4-9 participants */
  /* 2x1 grid for 2-3 participants */
  /* Control bar: smaller icons */
}

/* Mobile: <768px */
@media (max-width: 767px) {
  /* 1x1 grid (speaker view only) */
  /* Control bar: icon-only mode */
}
```

### 2.3 Layout Spacing

```css
:root {
  --grid-gap-large: 12px;      /* 3x3 and larger */
  --grid-gap-medium: 8px;       /* Desktop 3x3 */
  --grid-gap-small: 6px;        /* Mobile */

  --grid-padding-large: 20px;
  --grid-padding-medium: 12px;
  --grid-padding-small: 8px;

  --control-bar-height: 80px;
  --control-bar-height-mobile: 64px;
}
```

---

## 3. Color System

### 3.1 Color Palette (Extracted from Concept Images)

#### Primary Colors
```css
:root {
  /* Background Colors */
  --bg-primary: #1a1a1a;           /* Main app background (dark) */
  --bg-canvas-cell: #2a2624;       /* Individual canvas cell background */
  --bg-control-bar: #1f1f1f;       /* Bottom control bar */
  --bg-camera-off: #1c1c1c;        /* Camera off state */

  /* Accent Colors */
  --accent-red: #d84a48;           /* Mute/Camera off buttons */
  --accent-red-hover: #e65654;     /* Hover state */
  --accent-green: #8b9f7c;         /* Join now button, active states */
  --accent-green-hover: #9bb088;   /* Hover state */

  /* Border & Outline Colors */
  --border-default: #3a3a3a;       /* Default cell border */
  --border-hover: #4a4a4a;         /* Hover state */
  --border-active-speaker: #8b9f7c; /* Active speaker highlight */
  --border-width-default: 2px;
  --border-width-active: 3px;

  /* Text Colors */
  --text-primary: #ffffff;         /* Primary text (names, labels) */
  --text-secondary: #b8b8b8;       /* Secondary text */
  --text-disabled: #666666;        /* Disabled state */

  /* Overlay Colors */
  --overlay-dark: rgba(0, 0, 0, 0.6);      /* Name label background */
  --overlay-medium: rgba(0, 0, 0, 0.4);    /* Hover overlay */
  --overlay-light: rgba(0, 0, 0, 0.2);     /* Subtle overlays */
}
```

#### UI Element Colors
```css
:root {
  /* Button Colors */
  --btn-primary-bg: #8b9f7c;
  --btn-primary-text: #ffffff;
  --btn-danger-bg: #d84a48;
  --btn-danger-text: #ffffff;
  --btn-secondary-bg: #3a3a3a;
  --btn-secondary-text: #ffffff;

  /* Icon Colors */
  --icon-default: #e8e8e8;
  --icon-active: #8b9f7c;
  --icon-danger: #d84a48;
  --icon-disabled: #666666;
}
```

#### Scene Colors (3D Rendering)
```css
:root {
  /* Room Lighting */
  --scene-ambient-light: #f5e6d3;   /* Warm ambient light */
  --scene-directional-light: #fff8e7; /* Main light source */

  /* Room Background */
  --scene-wall-warm: #c4a57b;        /* Warm room walls */
  --scene-wall-cool: #6a7a8a;        /* Cool room walls (night) */
  --scene-floor: #8b7355;            /* Wooden floor tone */
}
```

### 3.2 Color Usage Guidelines

**Canvas Cell States:**
- Default: `--bg-canvas-cell` with `--border-default`
- Hover: Add `--overlay-medium` overlay + `--border-hover`
- Active Speaker: `--border-active-speaker` (3px border)
- Camera Off: `--bg-camera-off` with centered text

**Control Bar:**
- Background: `--bg-control-bar`
- Mute/Camera buttons: `--accent-red` (when off/muted)
- Active/On buttons: `--accent-green`
- Hover: 10% lighter shade of current color

---

## 4. Typography

### 4.1 Font Families

```css
:root {
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
               'Courier New', monospace;
}
```

### 4.2 Font Scales

```css
:root {
  /* Participant Names */
  --font-name-large: 16px;         /* 2x2 grid */
  --font-name-medium: 14px;        /* 3x3 grid */
  --font-name-small: 12px;         /* 4x4 grid */
  --font-weight-name: 600;         /* Semi-bold */

  /* Camera Off State */
  --font-camera-off: 18px;
  --font-weight-camera-off: 500;   /* Medium */

  /* Control Bar */
  --font-control-label: 13px;
  --font-weight-control: 500;

  /* Join Button */
  --font-join-button: 18px;
  --font-weight-join-button: 600;

  /* Participant Count */
  --font-participant-count: 12px;
  --font-weight-participant-count: 400;
}
```

### 4.3 Text Positioning

#### Name Labels (on canvas cells)
**Reference:** All grid images show name labels at bottom-left

```css
.participant-name {
  position: absolute;
  bottom: 8px;
  left: 8px;

  font-family: var(--font-primary);
  font-size: var(--font-name-medium);
  font-weight: var(--font-weight-name);
  color: var(--text-primary);

  background: var(--overlay-dark);
  padding: 4px 12px;
  border-radius: 4px;

  /* Text rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

  /* Prevent text selection */
  user-select: none;
  pointer-events: none;
}
```

#### Camera Off State Text
**Reference:** `zoom-join-now.png`

```css
.camera-off-text {
  font-family: var(--font-primary);
  font-size: var(--font-camera-off);
  font-weight: var(--font-weight-camera-off);
  color: var(--text-secondary);
  text-align: center;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 5. UI Components

### 5.1 Participant Cell Component

**Structure:**
```html
<div class="participant-cell" data-participant-id="{id}">
  <canvas class="participant-canvas" id="canvas-{id}"></canvas>
  <div class="participant-overlay">
    <span class="participant-name">{name}</span>
    <div class="participant-indicators">
      <!-- Muted icon, camera off icon, etc. -->
    </div>
  </div>
  <div class="active-speaker-indicator"></div>
</div>
```

**Styling:**
```css
.participant-cell {
  position: relative;
  background: var(--bg-canvas-cell);
  border: var(--border-width-default) solid var(--border-default);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.participant-cell:hover {
  border-color: var(--border-hover);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.participant-cell.active-speaker {
  border: var(--border-width-active) solid var(--border-active-speaker);
  box-shadow: 0 0 16px rgba(139, 159, 124, 0.4);
}

.participant-canvas {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.participant-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  pointer-events: none;
}

.participant-name {
  /* See Typography section 4.3 */
}
```

### 5.2 Control Bar Component

**Reference:** Bottom bar in `zoom-grid-1.png`, `zoom-grid-2.png`, `zoom-grid-3.png`

**Structure:**
```html
<div class="control-bar">
  <div class="control-bar-left">
    <span class="participant-count">9 participants</span>
  </div>

  <div class="control-bar-center">
    <button class="control-btn control-btn-danger" data-action="mute">
      <svg class="control-icon">{mute-icon}</svg>
      <span class="control-label">Mute</span>
    </button>

    <button class="control-btn control-btn-danger" data-action="camera">
      <svg class="control-icon">{camera-icon}</svg>
      <span class="control-label">Stop Video</span>
    </button>

    <button class="control-btn" data-action="share">
      <svg class="control-icon">{share-icon}</svg>
      <span class="control-label">Share</span>
    </button>

    <button class="control-btn control-btn-danger" data-action="leave">
      <svg class="control-icon">{leave-icon}</svg>
      <span class="control-label">Leave</span>
    </button>
  </div>

  <div class="control-bar-right">
    <!-- Settings, more options -->
  </div>
</div>
```

**Styling:**
```css
.control-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--control-bar-height);
  background: var(--bg-control-bar);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.control-bar-center {
  display: flex;
  gap: 16px;
  align-items: center;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--btn-secondary-bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.control-btn:hover {
  background: #4a4a4a;
  transform: translateY(-2px);
}

.control-btn-danger {
  background: var(--btn-danger-bg);
}

.control-btn-danger:hover {
  background: var(--accent-red-hover);
}

.control-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.control-label {
  font-size: var(--font-control-label);
  font-weight: var(--font-weight-control);
  white-space: nowrap;
}

.participant-count {
  font-size: var(--font-participant-count);
  color: var(--text-secondary);
}
```

### 5.3 Join Now Screen Component

**Reference:** `zoom-join-now.png`

**Structure:**
```html
<div class="join-screen">
  <div class="join-preview-container">
    <canvas id="preview-canvas" class="join-preview-canvas"></canvas>
    <div class="camera-off-overlay">
      <p class="camera-off-text">Camera is off</p>
    </div>

    <div class="join-preview-controls">
      <button class="join-control-btn join-control-danger" data-action="mute">
        <svg class="join-control-icon">{mute-icon}</svg>
      </button>
      <button class="join-control-btn join-control-danger" data-action="camera">
        <svg class="join-control-icon">{camera-icon}</svg>
      </button>
    </div>
  </div>

  <button class="join-btn">Join now</button>
</div>
```

**Styling:**
```css
.join-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 40px;
}

.join-preview-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16 / 9;
  background: var(--bg-camera-off);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.join-preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.camera-off-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-camera-off);
}

.camera-off-text {
  /* See Typography section 4.3 */
}

.join-preview-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
}

.join-control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--btn-secondary-bg);
}

.join-control-danger {
  background: var(--btn-danger-bg);
}

.join-control-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.join-control-icon {
  width: 28px;
  height: 28px;
  fill: white;
}

.join-btn {
  min-width: 240px;
  padding: 16px 48px;
  font-size: var(--font-join-button);
  font-weight: var(--font-weight-join-button);
  color: var(--btn-primary-text);
  background: var(--btn-primary-bg);
  border: none;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.join-btn:hover {
  background: var(--accent-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.join-btn:active {
  transform: translateY(0);
}
```

---

## 6. Interactive States

### 6.1 Participant Cell States

#### Default State
```css
.participant-cell {
  border: 2px solid var(--border-default);
  opacity: 1;
}
```

#### Hover State
```css
.participant-cell:hover {
  border-color: var(--border-hover);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.participant-cell:hover .participant-overlay {
  opacity: 1;
}
```

#### Active Speaker State
**Visual Indicators:**
- Bright green border (3px)
- Pulsing glow effect
- Slightly elevated z-index

```css
.participant-cell.active-speaker {
  border: 3px solid var(--border-active-speaker);
  box-shadow: 0 0 16px rgba(139, 159, 124, 0.4);
  animation: speaker-pulse 2s ease-in-out infinite;
}

@keyframes speaker-pulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(139, 159, 124, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(139, 159, 124, 0.6);
  }
}
```

#### Camera Off State
```css
.participant-cell.camera-off {
  background: var(--bg-camera-off);
}

.participant-cell.camera-off .participant-canvas {
  display: none;
}

.participant-cell.camera-off::before {
  content: 'Camera is off';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-camera-off);
  color: var(--text-secondary);
}
```

#### Muted State
**Visual Indicators:**
- Muted icon overlay (bottom-right)
- Red microphone icon with slash

```css
.participant-cell.muted .muted-indicator {
  display: flex;
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: var(--accent-red);
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}

.muted-indicator svg {
  width: 18px;
  height: 18px;
  fill: white;
}
```

### 6.2 Control Button States

#### Default State
```css
.control-btn {
  background: var(--btn-secondary-bg);
  opacity: 1;
}
```

#### Hover State
```css
.control-btn:hover {
  background: #4a4a4a;
  transform: translateY(-2px);
}
```

#### Active/Toggled State
```css
.control-btn.active {
  background: var(--accent-green);
  color: white;
}

.control-btn.danger-active {
  background: var(--accent-red);
  color: white;
}
```

#### Disabled State
```css
.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 6.3 Animation Specifications

**Hover Animations:**
```css
.participant-cell,
.control-btn,
.join-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Grid Layout Transitions:**
```css
.participant-grid {
  transition: grid-template-columns 0.3s ease,
              grid-template-rows 0.3s ease;
}
```

**Active Speaker Pulse:**
```css
@keyframes speaker-pulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(139, 159, 124, 0.4);
    border-color: var(--border-active-speaker);
  }
  50% {
    box-shadow: 0 0 24px rgba(139, 159, 124, 0.6);
    border-color: #9bb088;
  }
}
```

---

## 7. 3D Scene Specifications

### 7.1 Camera Configuration (Per Canvas)

**Reference:** Character views in all grid images show upper-body portrait angle

```typescript
// Camera setup for each participant canvas
const camera = new BABYLON.ArcRotateCamera(
  `camera-${participantId}`,
  Math.PI / 2,        // Alpha (horizontal rotation): 90 degrees
  Math.PI / 3,        // Beta (vertical rotation): 60 degrees
  3.5,                // Radius: 3.5 units from target
  new BABYLON.Vector3(0, 1.2, 0),  // Target: character chest height
  scene
);

camera.lowerRadiusLimit = 2.5;
camera.upperRadiusLimit = 5.0;
camera.lowerBetaLimit = Math.PI / 4;
camera.upperBetaLimit = Math.PI / 2.2;

// Field of view
camera.fov = 0.8;  // ~45 degrees

// Disable user control in grid view
camera.attachControl(canvas, false);
```

### 7.2 Lighting Setup

**Three-Point Lighting System:**

```typescript
// 1. Key Light (Main light source)
const keyLight = new BABYLON.DirectionalLight(
  "keyLight",
  new BABYLON.Vector3(-1, -2, -1),
  scene
);
keyLight.position = new BABYLON.Vector3(2, 3, 2);
keyLight.intensity = 0.8;
keyLight.diffuse = new BABYLON.Color3(1, 0.98, 0.9);  // Warm white

// 2. Fill Light (Soften shadows)
const fillLight = new BABYLON.HemisphericLight(
  "fillLight",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
fillLight.intensity = 0.5;
fillLight.diffuse = new BABYLON.Color3(0.96, 0.9, 0.85);  // Warm ambient
fillLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.35);

// 3. Rim Light (Separation from background)
const rimLight = new BABYLON.SpotLight(
  "rimLight",
  new BABYLON.Vector3(0, 2, -2),
  new BABYLON.Vector3(0, -1, 1),
  Math.PI / 3,
  2,
  scene
);
rimLight.intensity = 0.4;
rimLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1);  // Cool highlight

// 4. Ambient Light (Base illumination)
scene.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.25);
```

### 7.3 Scene Background & Environment

**Room Environment Settings:**

```typescript
// Background color (cozy room tone)
scene.clearColor = new BABYLON.Color4(0.16, 0.15, 0.14, 1);  // #2a2624

// Environment texture for reflections (optional)
const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
  "/assets/environment.dds",
  scene
);
scene.environmentTexture = hdrTexture;
scene.environmentIntensity = 0.6;

// Image-based lighting
scene.createDefaultSkybox(hdrTexture, true, 100, 0.3, false);
```

### 7.4 Character Positioning & Scale

```typescript
// Character model setup
const character = loadedMesh;  // Your character model

// Position
character.position = new BABYLON.Vector3(0, 0, 0);

// Scale (adjust based on model)
character.scaling = new BABYLON.Vector3(1, 1, 1);

// Rotation (face camera)
character.rotation.y = 0;  // Face forward

// Ensure character is centered in frame
// Camera target should be at chest/face level
const characterHeight = 1.8;  // Average character height
const targetHeight = characterHeight * 0.65;  // 65% up (chest level)
camera.target = new BABYLON.Vector3(0, targetHeight, 0);
```

### 7.5 Performance Optimizations

**For Multi-Canvas Setup:**

```typescript
// Shared engine instance
const engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  powerPreference: "high-performance"
});

// Per-scene optimizations
scene.autoClear = false;
scene.autoClearDepthAndStencil = false;

// LOD (Level of Detail) for characters
character.addLODLevel(50, simplifiedMesh);   // 50 units distance
character.addLODLevel(100, null);             // Cull beyond 100 units

// Frustum culling
scene.freezeActiveMeshes();  // If characters are static

// Reduce shadow quality for performance
if (shadowGenerator) {
  shadowGenerator.mapSize = 512;  // Lower resolution for grid views
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurScale = 1;
}
```

### 7.6 Scene Rendering Per Canvas

**Multi-View Rendering Pattern:**

```typescript
// Render loop for all canvases
engine.runRenderLoop(() => {
  participants.forEach(participant => {
    const { scene, camera, canvas } = participant;

    // Set viewport for this canvas
    engine.setViewport(new BABYLON.Viewport(
      0, 0, canvas.width, canvas.height
    ));

    // Render this scene
    scene.render();
  });
});

// Resize handling
window.addEventListener('resize', () => {
  participants.forEach(participant => {
    participant.engine.resize();
  });
});
```

---

## 8. Implementation Guidelines

### 8.1 HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animal Zoom</title>
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <!-- Main Grid View -->
  <div id="app" class="app-container">
    <div class="participant-grid" data-grid-size="3x3">
      <!-- Dynamically generated participant cells -->
    </div>

    <!-- Control Bar -->
    <div class="control-bar">
      <!-- Control bar content (see section 5.2) -->
    </div>
  </div>

  <!-- Join Screen (initially visible) -->
  <div id="join-screen" class="join-screen" style="display: flex;">
    <!-- Join screen content (see section 5.3) -->
  </div>

  <script type="module" src="/src/app.ts"></script>
</body>
</html>
```

### 8.2 CSS Grid Implementation

```css
/* Grid Container */
.participant-grid {
  display: grid;
  width: 100vw;
  height: calc(100vh - var(--control-bar-height));
  padding: var(--grid-padding-medium);
  gap: var(--grid-gap-medium);
  box-sizing: border-box;
}

/* Dynamic grid sizes */
.participant-grid[data-grid-size="2x2"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: var(--grid-gap-large);
}

.participant-grid[data-grid-size="3x3"] {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--grid-gap-medium);
}

.participant-grid[data-grid-size="4x4"] {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: var(--grid-gap-small);
}

/* Participant cell fills grid cell */
.participant-cell {
  width: 100%;
  height: 100%;
  min-width: 0;  /* Allow grid items to shrink */
  min-height: 0;
}
```

### 8.3 Canvas Overlay Positioning

```css
/* Canvas positioning within cell */
.participant-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;  /* Maintain aspect ratio */
}

/* Overlay elements */
.participant-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  z-index: 2;
  pointer-events: none;  /* Allow clicks to pass through */
}

/* Allow specific overlay children to receive events */
.participant-overlay button {
  pointer-events: auto;
}
```

### 8.4 Babylon.js Multi-Canvas Setup

**TypeScript Implementation Example:**

```typescript
// src/scene/ParticipantManager.ts

import * as BABYLON from '@babylonjs/core';

interface Participant {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  character?: BABYLON.AbstractMesh;
  isMuted: boolean;
  cameraOff: boolean;
}

class ParticipantManager {
  private engine: BABYLON.Engine;
  private participants: Map<string, Participant> = new Map();

  constructor(primaryCanvas: HTMLCanvasElement) {
    // Single engine instance
    this.engine = new BABYLON.Engine(primaryCanvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      powerPreference: "high-performance"
    });

    this.startRenderLoop();
  }

  addParticipant(id: string, name: string): Participant {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = `canvas-${id}`;
    canvas.className = 'participant-canvas';

    // Create scene
    const scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color4(0.16, 0.15, 0.14, 1);

    // Create camera
    const camera = this.createCamera(id, scene);

    // Setup lighting
    this.setupLighting(scene);

    // Create participant object
    const participant: Participant = {
      id,
      name,
      canvas,
      scene,
      camera,
      isMuted: false,
      cameraOff: false
    };

    // Load character model
    this.loadCharacterModel(participant);

    // Store participant
    this.participants.set(id, participant);

    // Add to DOM
    this.addParticipantToGrid(participant);

    return participant;
  }

  private createCamera(id: string, scene: BABYLON.Scene): BABYLON.ArcRotateCamera {
    const camera = new BABYLON.ArcRotateCamera(
      `camera-${id}`,
      Math.PI / 2,
      Math.PI / 3,
      3.5,
      new BABYLON.Vector3(0, 1.2, 0),
      scene
    );

    camera.fov = 0.8;
    camera.lowerRadiusLimit = 2.5;
    camera.upperRadiusLimit = 5.0;

    return camera;
  }

  private setupLighting(scene: BABYLON.Scene): void {
    // Key light
    const keyLight = new BABYLON.DirectionalLight(
      "keyLight",
      new BABYLON.Vector3(-1, -2, -1),
      scene
    );
    keyLight.position = new BABYLON.Vector3(2, 3, 2);
    keyLight.intensity = 0.8;

    // Fill light
    const fillLight = new BABYLON.HemisphericLight(
      "fillLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    fillLight.intensity = 0.5;
  }

  private async loadCharacterModel(participant: Participant): Promise<void> {
    // Load character model (implement based on your asset structure)
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "/assets/characters/",
      "character.glb",
      participant.scene
    );

    participant.character = result.meshes[0];
    participant.character.position = new BABYLON.Vector3(0, 0, 0);
  }

  private addParticipantToGrid(participant: Participant): void {
    const gridContainer = document.querySelector('.participant-grid');
    if (!gridContainer) return;

    // Create cell wrapper
    const cell = document.createElement('div');
    cell.className = 'participant-cell';
    cell.dataset.participantId = participant.id;

    // Add canvas
    cell.appendChild(participant.canvas);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'participant-overlay';

    const nameLabel = document.createElement('span');
    nameLabel.className = 'participant-name';
    nameLabel.textContent = participant.name;

    overlay.appendChild(nameLabel);
    cell.appendChild(overlay);

    // Add to grid
    gridContainer.appendChild(cell);

    // Update grid size
    this.updateGridLayout();
  }

  private updateGridLayout(): void {
    const gridContainer = document.querySelector('.participant-grid') as HTMLElement;
    if (!gridContainer) return;

    const count = this.participants.size;

    let gridSize: string;
    if (count <= 1) {
      gridSize = '1x1';
    } else if (count <= 4) {
      gridSize = '2x2';
    } else if (count <= 9) {
      gridSize = '3x3';
    } else {
      gridSize = '4x4';
    }

    gridContainer.dataset.gridSize = gridSize;
  }

  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.participants.forEach(participant => {
        if (!participant.cameraOff) {
          participant.scene.render();
        }
      });
    });

    // Handle resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  setActiveSpeaker(participantId: string): void {
    // Remove active speaker from all
    this.participants.forEach((p) => {
      const cell = document.querySelector(`[data-participant-id="${p.id}"]`);
      cell?.classList.remove('active-speaker');
    });

    // Add to specified participant
    const cell = document.querySelector(`[data-participant-id="${participantId}"]`);
    cell?.classList.add('active-speaker');
  }

  toggleMute(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.isMuted = !participant.isMuted;
      const cell = document.querySelector(`[data-participant-id="${participantId}"]`);
      cell?.classList.toggle('muted', participant.isMuted);
    }
  }

  toggleCamera(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.cameraOff = !participant.cameraOff;
      const cell = document.querySelector(`[data-participant-id="${participantId}"]`);
      cell?.classList.toggle('camera-off', participant.cameraOff);
    }
  }
}

export default ParticipantManager;
```

### 8.5 Application Entry Point

```typescript
// src/app.ts

import ParticipantManager from './scene/ParticipantManager';
import './styles/main.css';

// Initialize application
class App {
  private participantManager?: ParticipantManager;

  constructor() {
    this.init();
  }

  private init(): void {
    // Show join screen initially
    this.setupJoinScreen();
  }

  private setupJoinScreen(): void {
    const joinBtn = document.querySelector('.join-btn') as HTMLButtonElement;
    joinBtn?.addEventListener('click', () => {
      this.joinMeeting();
    });
  }

  private joinMeeting(): void {
    // Hide join screen
    const joinScreen = document.getElementById('join-screen');
    if (joinScreen) {
      joinScreen.style.display = 'none';
    }

    // Show main app
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.style.display = 'block';
    }

    // Initialize participant manager
    const primaryCanvas = document.createElement('canvas');
    this.participantManager = new ParticipantManager(primaryCanvas);

    // Add test participants
    this.addTestParticipants();
  }

  private addTestParticipants(): void {
    if (!this.participantManager) return;

    const names = [
      'k.k. slider', 'joey', 'filo',
      'josh', 'emre', 'christina',
      'pollox', 'sab', 'tukka'
    ];

    names.forEach((name, index) => {
      setTimeout(() => {
        this.participantManager?.addParticipant(`participant-${index}`, name);
      }, index * 300);  // Stagger additions
    });
  }
}

// Start application
new App();
```

### 8.6 File Structure Recommendation

```
web_core/
├── src/
│   ├── app.ts                    # Entry point
│   ├── scene/
│   │   ├── ParticipantManager.ts # Multi-canvas manager
│   │   ├── SceneSetup.ts         # Lighting, camera setup
│   │   └── CharacterLoader.ts    # Character model loading
│   ├── components/
│   │   ├── ControlBar.ts         # Control bar logic
│   │   └── JoinScreen.ts         # Join screen logic
│   ├── styles/
│   │   ├── main.css              # Main styles
│   │   ├── variables.css         # CSS variables
│   │   ├── grid.css              # Grid layout
│   │   ├── controls.css          # Control bar styles
│   │   └── join-screen.css       # Join screen styles
│   └── assets/
│       ├── characters/           # Character models (.glb)
│       ├── icons/                # SVG icons
│       └── environment/          # HDR environment maps
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 9. Reference Images

### Image Analysis Summary

#### zoom-grid-1.png
- **Layout:** 3x3 grid with 9 participants
- **Characters:** Various animal characters in cozy room environments
- **Colors:** Warm color palette with dark background (#1a1a1a)
- **UI Elements:** Name labels bottom-left, control bar at bottom with red buttons
- **Notable:** "k.k. slider", "joey", "filo", "josh", "emre", "christina", "pollox", "sab", "tukka"

#### zoom-grid-2.png
- **Layout:** 3x3 grid with 9 participants
- **Characters:** Different room scenes, some nighttime/darker
- **Colors:** Similar warm palette, some cells have cooler lighting
- **UI Elements:** Browser chrome visible at top, participant count "9 members" bottom-left
- **Notable:** Mix of daytime and nighttime room scenes

#### zoom-grid-3.png
- **Layout:** 2x2 grid with 4 participants (larger cells)
- **Characters:** Clearer detail due to larger cell size
- **Colors:** Consistent dark background, warm room tones
- **UI Elements:** "4 members" indicator, same control bar style
- **Notable:** Better visibility of character expressions and room details

#### zoom-join-now.png
- **Layout:** Single preview screen (16:9 aspect ratio)
- **State:** Camera off state displayed
- **UI Elements:**
  - "Camera is off" text centered
  - Two red circular buttons (mute/camera) in preview
  - Large green "Join now" button below preview
  - Browser URL bar showing "cuppuccino.co/meet"
  - "Guest" user indicator, "Relaunch to update" button
- **Colors:** Black preview (#1c1c1c), red buttons (#d84a48), green join button (#8b9f7c)

### Design Patterns Observed

1. **Consistent spacing:** All grids maintain equal gaps between cells
2. **Name labels:** Always positioned bottom-left with dark background
3. **Control bar:** Fixed height (~80px), centered controls
4. **Border styling:** Subtle borders on cells, likely 2px
5. **Corner radius:** All UI elements have rounded corners (~8px cells, ~28px buttons)
6. **Color temperature:** Warm overall palette, consistent with cozy room aesthetic
7. **Icon style:** Simple, minimal icons in control bar
8. **Aspect ratios:** Cells appear to maintain 4:3 ratio in grids

---

## 10. Technical Specifications Summary

### Key Measurements
- **Control Bar Height:** 80px (desktop), 64px (mobile)
- **Grid Gap:** 8px (3x3), 12px (2x2)
- **Grid Padding:** 12px (desktop), 8px (mobile)
- **Cell Border:** 2px (default), 3px (active speaker)
- **Cell Border Radius:** 8px
- **Button Border Radius:** 8px (control bar), 28px (join button)
- **Name Label Padding:** 4px vertical, 12px horizontal
- **Name Label Border Radius:** 4px

### Color Palette (Hex Codes)
- **Background:** #1a1a1a (primary), #2a2624 (cell), #1f1f1f (control bar)
- **Accent Red:** #d84a48
- **Accent Green:** #8b9f7c
- **Border:** #3a3a3a (default), #4a4a4a (hover), #8b9f7c (active)
- **Text:** #ffffff (primary), #b8b8b8 (secondary)
- **Overlay:** rgba(0, 0, 0, 0.6) (name label)

### Font Specifications
- **Font Family:** System font stack (San Francisco, Segoe UI, Roboto)
- **Name Label:** 14px, weight 600 (3x3 grid)
- **Camera Off Text:** 18px, weight 500
- **Control Label:** 13px, weight 500
- **Join Button:** 18px, weight 600

### Babylon.js Scene Settings
- **Camera:** ArcRotateCamera at (α: π/2, β: π/3, radius: 3.5)
- **FOV:** 0.8 radians (~45 degrees)
- **Target Height:** 1.2 units (chest level)
- **Key Light Intensity:** 0.8
- **Fill Light Intensity:** 0.5
- **Clear Color:** rgba(42, 38, 36, 1) or #2a2624

---

## Conclusion

This design specification provides a complete blueprint for implementing the Zoom-style multi-canvas Babylon.js interface. The specification is based on direct analysis of the concept images and includes all necessary measurements, colors, and technical details for web developers to implement the system.

**Key Implementation Priorities:**
1. Responsive grid system with CSS Grid
2. Single Babylon.js Engine with multiple scenes/cameras
3. Overlay positioning for UI elements (names, indicators)
4. Interactive states (hover, active speaker, muted, camera off)
5. Performance optimization for multiple 3D scenes
6. Smooth transitions and animations

**Next Steps:**
1. Set up base HTML structure and CSS variables
2. Implement ParticipantManager class for multi-canvas rendering
3. Create UI components (control bar, join screen)
4. Add character models and test with multiple participants
5. Implement interactive states and event handlers
6. Optimize performance and test responsiveness

---

**Document Version:** 1.0
**Last Updated:** 2025-12-23
**Maintained By:** Design Team
**Related Documents:**
- `/docs/plans/` (implementation plans)
- `/web_core/src/` (source code)
- `/docs/concept/` (concept images)