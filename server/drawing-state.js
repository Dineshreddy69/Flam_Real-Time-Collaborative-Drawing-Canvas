/**
 * Global drawing state: History of operations, undo/redo stacks.
 * Shared across all clients via broadcasts.
 */

let history = []; // Operations: [{userId, type, path, color, width}]
let redoStack = []; // For redo

module.exports = {
    getHistory: () => [...history], // Copy for safety

    addOperation: (op) => {
        history.push(op);
        redoStack = []; // Clear redo on new action
    },

    undo: () => {
        if (history.length > 0) {
            redoStack.push(history.pop());
        }
    },

    redo: () => {
        if (redoStack.length > 0) {
            history.push(redoStack.pop());
        }
    },

    clearAll: () => {
        history = [];
        redoStack = [];
    }
};