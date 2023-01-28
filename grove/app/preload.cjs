const {
    ipcRenderer,
    contextBridge
} = require('electron');

contextBridge.exposeInMainWorld('webApi', {
    onmessage(endpoint, func) {
        ipcRenderer.on(endpoint, (event, ...args) => func(...args));
    },

    handleGraphData(func) {
        ipcRenderer.on('graph-data', (event, ...args) => func(...args));
    }
});