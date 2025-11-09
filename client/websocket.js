/**
 * WebSocket client: Socket.io connection, event handling, throttling for efficiency.
 */

// Connect
const socket = io();

// Throttling utility (for cursors: 50ms to reduce spam)
let lastCursorSend = 0;
function throttleCursor(fn, delay = 50) {
    return (...args) => {
        const now = Date.now();
        if (now - lastCursorSend > delay) {
            fn(...args);
            lastCursorSend = now;
        }
    };
}

const throttledSendCursor = throttleCursor((x, y) => {
    socket.emit('cursor', { x, y });
});

// Path send (only on mouseup - no throttle needed)
function sendPath(data) {
    socket.emit('path', data);
    // FIX: Local prediction for sender - append immediately and redraw
    const localOp = { ...data }; // Omit userId (added by server for others)
    history.push(localOp);
    window.redraw && window.redraw();
}

// Undo/Redo/Clear
function sendUndo() { socket.emit('undo'); }
function sendRedo() { socket.emit('redo'); }
function sendClear() { socket.emit('clear'); }

// Exports for other modules
window.sendPath = sendPath;
window.sendCursor = throttledSendCursor;
window.sendUndo = sendUndo;
window.sendRedo = sendRedo;
window.sendClear = sendClear;

// Events
socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom');
});

socket.on('init', (data) => {
    window.setHistory(data.history);
    updateUsers(data.users);
});

socket.on('newPath', (op) => {
    // For others: Append received op (with userId) and redraw
    history.push(op);
    window.redraw && window.redraw();
});

socket.on('cursorsUpdate', (cursors) => {
    window.setOtherCursors(cursors);
});

socket.on('historyUpdate', (newHistory) => {
    window.setHistory(newHistory);
});

socket.on('usersUpdate', updateUsers);

function updateUsers(users) {
    const usersDiv = document.getElementById('users');
    usersDiv.innerHTML = 'Online: ' + users.map(u => 
        `<span style="color: ${u.color};">● ${u.id.slice(0, 6)}</span>`
    ).join(' ');
}