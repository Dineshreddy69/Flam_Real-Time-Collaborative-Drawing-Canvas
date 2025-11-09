/**
 * Main server: Express for static files, Socket.io for real-time.
 * Serves client from ../client (correct path!).
 */

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const roomsManager = require('./rooms');
const drawingState = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Serve static files from client folder (FIXED PATH!)
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to index.html for client-side routing (if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Socket.io connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', () => {
        roomsManager.addUser(socket.id);
        const initData = {
            history: drawingState.getHistory(),
            users: roomsManager.getUsers()
        };
        socket.emit('init', initData);
        io.emit('usersUpdate', roomsManager.getUsers());
    });

    socket.on('path', (data) => {
        data.userId = socket.id;
        drawingState.addOperation(data);
        socket.broadcast.emit('newPath', data); // Broadcast to others
        // Sender already has it locally via prediction
    });

    socket.on('cursor', (pos) => {
        roomsManager.updateCursor(socket.id, pos);
        io.emit('cursorsUpdate', roomsManager.getCursors());
    });

    socket.on('undo', () => {
        drawingState.undo();
        io.emit('historyUpdate', drawingState.getHistory());
    });

    socket.on('redo', () => {
        drawingState.redo();
        io.emit('historyUpdate', drawingState.getHistory());
    });

    socket.on('clear', () => {
        drawingState.clearAll();
        io.emit('historyUpdate', drawingState.getHistory());
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        roomsManager.removeUser(socket.id);
        io.emit('usersUpdate', roomsManager.getUsers());
        io.emit('cursorsUpdate', roomsManager.getCursors());
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at https://flamdrawingcanvas.netlify.app`);
});