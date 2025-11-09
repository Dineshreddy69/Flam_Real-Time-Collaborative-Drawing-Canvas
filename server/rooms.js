/**
 * Room management: Tracks users, assigns colors, handles cursors.
 * Single room for simplicity.
 */

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
let users = []; // [{id: string, color: string}]
let cursors = {}; // {id: {x: number, y: number, color: string}}

module.exports = {
    addUser: (id) => {
        const color = colors[users.length % colors.length];
        users.push({ id, color });
        cursors[id] = { x: 0, y: 0, color };
    },

    removeUser: (id) => {
        users = users.filter(u => u.id !== id);
        delete cursors[id];
    },

    getUsers: () => users,

    updateCursor: (id, { x, y }) => {
        if (cursors[id]) {
            cursors[id].x = x;
            cursors[id].y = y;
        }
    },

    getCursors: () => ({ ...cursors }) // Shallow copy
};