# Quick Start Guide - Animal Zoom

Get up and running in 60 seconds!

## Prerequisites

- Node.js 16+ or Bun
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation & Run

```bash
# 1. Navigate to the project directory
cd /home/lotus/document/lotus/animal-zoom/web_core

# 2. Install dependencies (if not already done)
bun install
# or: npm install

# 3. Start the development server
bun run dev
# or: npm run dev

# 4. Open your browser to: http://localhost:5173
```

## What You'll See

### 1. Join Screen
- A preview area with "Camera is off" text
- Two red circular buttons (microphone and camera controls)
- A green "Join now" button

### 2. Click "Join now"
- The screen transitions to the main meeting interface
- 9 participants load one by one (k.k. slider, joey, filo, josh, emre, christina, pollox, sab, tukka)
- Each participant appears in a 3x3 grid

### 3. Main Meeting Interface
- **9 3D scenes**: Each cell shows a colored rotating sphere (placeholder for character)
- **Name labels**: Bottom-left of each cell
- **Active speaker**: Green pulsing border rotates every 3 seconds
- **Muted indicators**: Some participants show red microphone icons
- **Camera off**: Some participants show "Camera is off" text
- **Control bar**: Fixed at bottom with 4 buttons

## Interaction

### Control Bar Buttons
- **Mute/Unmute**: Toggle microphone (visual only for now)
- **Stop/Start Video**: Toggle camera (visual only for now)
- **Share**: Click to see placeholder alert
- **Leave**: Confirms before leaving (reloads page)

### Participant Cells
- **Hover**: Cells scale up slightly (1.02x) with shadow
- **Active Speaker**: Green pulsing border animation
- **3D Scenes**: Each sphere rotates slowly

## What's Working

✅ Complete UI/UX matching design specification
✅ Responsive grid layout (1x1, 2x2, 3x3, 4x4)
✅ Multi-canvas Babylon.js rendering (9 simultaneous scenes)
✅ Interactive states (hover, active speaker, muted, camera off)
✅ Join screen with pre-meeting controls
✅ Control bar with all buttons
✅ Smooth animations and transitions
✅ Responsive design (desktop, tablet, mobile)

## What's Next

To make this a real video conferencing app:

1. **Replace Placeholder Spheres**: Load actual animal character GLB/GLTF models
2. **Add Room Environment**: Import cozy room 3D scenes
3. **Implement WebRTC**: Add real video/audio streaming
4. **Backend Integration**: Connect to meeting server
5. **Add More Features**: Chat, recording, screen sharing

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
bun run dev -- --port 5174
```

### Babylon.js Not Loading
- Check browser console for errors
- Ensure all dependencies are installed
- Try clearing browser cache

### Slow Performance
- Check Task Manager/Activity Monitor for CPU/GPU usage
- Try Chrome/Edge for best WebGL performance
- Reduce number of participants (edit `testParticipantNames` in `app.ts`)

## Developer Tools

### Keyboard Shortcuts
- **Shift+Ctrl+Alt+I**: Toggle Babylon.js Inspector (when available)

### Browser Console
Open DevTools (F12) to see:
- Application initialization logs
- Participant addition logs
- Control button interaction logs

### Hot Reload
Vite supports hot module replacement:
- Edit CSS files → instant reload
- Edit TypeScript → automatic recompile

## File Structure

```
web_core/
├── src/
│   ├── app.ts                  # Main entry point
│   ├── scene/
│   │   └── ParticipantManager.ts  # Multi-canvas manager
│   ├── components/
│   │   ├── ControlBar.ts       # Control bar logic
│   │   └── JoinScreen.ts       # Join screen logic
│   └── styles/
│       ├── main.css            # Main stylesheet
│       ├── variables.css       # CSS variables
│       ├── grid.css            # Grid layout
│       ├── controls.css        # Control bar styles
│       └── join-screen.css     # Join screen styles
├── index.html                  # HTML structure
└── package.json                # Dependencies
```

## Need Help?

- Read `/README.md` for comprehensive documentation
- Read `/IMPLEMENTATION.md` for technical details
- Check `/docs/design-specification.md` for design system
- Look at concept images in `/docs/concept/`

## Next Steps

1. **Explore the Code**: Start with `src/app.ts` and follow the flow
2. **Modify Styles**: Edit CSS variables in `src/styles/variables.css`
3. **Add Participants**: Edit `testParticipantNames` array in `app.ts`
4. **Customize**: Change colors, sizes, animations to your liking
5. **Build**: Run `bun run build` for production-ready bundle

Enjoy building with Animal Zoom! 🎉
