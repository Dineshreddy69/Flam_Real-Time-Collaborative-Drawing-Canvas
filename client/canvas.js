/**
 * Canvas drawing logic: Handles tools, mouse events, local prediction, and efficient rendering.
 * - Local drawing: Incremental during stroke (no full redraw lag).
 * - Sync: Full history replay only on server updates or local append.
 * - Smoothing: Quadratic curves for natural paths.
 */

// Globals (exposed to window for cross-module access)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineJoin = ctx.lineCap = 'round';

let drawing = false;
let tool = 'brush';  // Default to 'brush'
let color = '#000000';
let lineWidth = 5;
let currentPath = []; // Current local stroke
let history = []; // Server-synced operations: [{userId, type: 'draw'|'erase', path: [[x,y],...], color, width}]
let otherCursors = {}; // {userId: {x, y, color}}

// Expose to window
window.history = history;
window.otherCursors = otherCursors;

// Initial clear
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Efficient full redraw: Replay history + cursors
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(op => {
        ctx.strokeStyle = op.type === 'erase' ? '#FFFFFF' : op.color;  // FIXED: Matches 'erase'
        ctx.lineWidth = op.width;
        ctx.beginPath();
        op.path.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point[0], point[1]);
            } else {
                // Smooth quadratic curve
                const prev = op.path[i - 1];
                const midX = (prev[0] + point[0]) / 2;
                const midY = (prev[1] + point[1]) / 2;
                ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
            }
        });
        ctx.stroke();
    });
    // Draw cursors
    Object.values(otherCursors).forEach(cur => {
        ctx.beginPath();
        ctx.arc(cur.x, cur.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = cur.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

// Local drawing functions (for prediction during stroke)
function drawLocalPath(path) {
    if (path.length < 2) return;
    ctx.strokeStyle = tool === 'erase' ? '#FFFFFF' : color;  // FIXED: Matches 'erase'
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    path.forEach((point, i) => {
        if (i === 0) {
            ctx.moveTo(point[0], point[1]);
        } else {
            const prev = path[i - 1];
            const midX = (prev[0] + point[0]) / 2;
            const midY = (prev[1] + point[1]) / 2;
            ctx.quadraticCurveTo(prev[0], prev[1], midX, midY);
        }
    });
    ctx.stroke();
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawing = true;
    currentPath = [[x, y]];
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (drawing) {
        currentPath.push([x, y]);
        drawLocalPath(currentPath); // Incremental draw - fast!
    }
    // Send cursor (throttled in websocket.js)
    window.sendCursor && window.sendCursor(x, y);
});

canvas.addEventListener('mouseup', () => {
    if (drawing && currentPath.length > 1) {
        // Send to server for sync (local append happens in websocket.js)
        window.sendPath && window.sendPath({
            type: tool,  // Now 'erase' or 'brush'
            path: [...currentPath],
            color,
            width: lineWidth
        });
    }
    drawing = false;
    currentPath = []; // Reset - no early redraw here!
});

canvas.addEventListener('mouseout', () => {
    drawing = false;
    currentPath = [];
});

// Tool setters (called from main.js)
window.setTool = (newTool) => { tool = newTool; };
window.setColor = (newColor) => { color = newColor; };
window.setWidth = (newWidth) => { lineWidth = newWidth; };

// State updaters (from websocket.js)
window.setHistory = (newHistory) => {
    history = newHistory;
    window.history = history; // Keep exposed
    redraw();
};
window.setOtherCursors = (cursors) => {
    otherCursors = cursors;
    window.otherCursors = cursors; // Keep exposed
    redraw();
};

// Undo/Redo (trigger server)
window.undo = () => window.sendUndo && window.sendUndo();
window.redo = () => window.sendRedo && window.sendRedo();
window.clearAll = () => window.sendClear && window.sendClear();

// Export redraw
window.redraw = redraw;