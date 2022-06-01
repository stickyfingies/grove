const {
    ipcRenderer,
    contextBridge
} = require('electron');

contextBridge.exposeInMainWorld('webApi', {
    onmessage: function (func) {
        ipcRenderer.on('response', (event, ...args) => func(...args));
    }
});