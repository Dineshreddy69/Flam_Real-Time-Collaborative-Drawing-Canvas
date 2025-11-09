/**
 * App initialization: Bind DOM events to tools and canvas functions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tool buttons
    document.getElementById('brush').addEventListener('click', () => {
        window.setTool('brush');
    });
    document.getElementById('eraser').addEventListener('click', () => {
        window.setTool('erase');  // FIXED: Set to 'erase' (matches draw logic)
    });

    // Inputs
    document.getElementById('color').addEventListener('input', (e) => {
        window.setColor(e.target.value);
    });
    document.getElementById('width').addEventListener('input', (e) => {
        window.setWidth(parseInt(e.target.value));
    });

    // Actions
    document.getElementById('undo').addEventListener('click', window.undo);
    document.getElementById('redo').addEventListener('click', window.redo);
    document.getElementById('clear').addEventListener('click', window.clearAll);

    // No need for setTimeout - 'init' event handles first redraw
});