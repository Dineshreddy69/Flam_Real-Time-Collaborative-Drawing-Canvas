# Real-Time Collaborative Drawing Canvas

## Overview
A multi-user drawing app with real-time sync using HTML5 Canvas and Socket.io.

## Setup
1. Install Node.js.
2. Run `npm install`.
3. Start server: `npm start`.
4. Open http://localhost:3000 in multiple browsers.

## Features
- Brush, eraser, colors, stroke width.
- Real-time drawing sync with cursors.
- Global undo/redo.
- Online users list with assigned colors.

## Known Limitations
- Basic conflict resolution (last-write-wins).
- Tested on desktop; mobile touch support partial.