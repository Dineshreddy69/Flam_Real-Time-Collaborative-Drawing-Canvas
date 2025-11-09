# Architecture Overview

## Frontend (Vanilla JS + Canvas)
- `index.html`: Basic UI with canvas, tools, user list.
- `style.css`: Minimal styling for tools and canvas.
- `canvas.js`: Handles drawing logic, mouse events, path optimization (uses quadratic curves for smoothness), undo/redo stack (local mirror of server).
- `websocket.js`: Socket.io client for connecting, sending strokes/mouse positions, receiving updates.
- `main.js`: Initializes app, binds events.

Key Techniques:
- Efficient Redraw: Clear canvas and replay history on updates (optimized with offscreen canvas for layers if needed, but kept simple).
- Client Prediction: Draw locally on mousemove, then send batch to server.
- Cursor Indicators: Render other users' cursors as small circles on canvas.

## Backend (Node.js + Socket.io)
- `server.js`: Express server + Socket.io setup. Serves client files.
- `rooms.js`: Manages rooms (single room for simplicity), user connections, assigns colors.
- `drawing-state.js`: Maintains global state: history array of operations, online users.

Real-time Flow:
1. User connects: Assign ID/color, broadcast user list.
2. Drawing: Client sends batched paths → Server appends to history → Broadcasts to all.
3. Undo: Client requests → Server pops history → Broadcasts new history → Clients redraw.
4. Mouse Move: Throttled broadcast for cursors.
5. Conflicts: History is authoritative; clients sync on receive.

Challenges Addressed:
- Latency: Client prediction hides delay.
- High-Frequency Events: Throttle sends (e.g., 100ms batches).
- State Consistency: Server pushes full history on join/undo to ensure sync.
- No DB: In-memory state (fine for demo; add persistence for prod).

This design ensures scalability for small groups; for large, consider sharding or DB.