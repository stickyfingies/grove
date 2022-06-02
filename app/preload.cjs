const {
    ipcRenderer,
    contextBridge
} = require('electron');

contextBridge.exposeInMainWorld('webApi', {
    onmessage(endpoint, func) {
        ipcRenderer.on(endpoint, (event, ...args) => func(...args));
    }
});