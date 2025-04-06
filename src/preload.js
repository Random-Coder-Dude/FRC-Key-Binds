const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script loaded successfully.");

contextBridge.exposeInMainWorld('electronAPI', {
    setCurrentProject: (projectPath) => ipcRenderer.send('set-current-project', projectPath),
    saveDataToProject: (filename, content) => ipcRenderer.send('save-data-to-project', { filename, content }),
    viewLocalStorage: () => ipcRenderer.send('view-local-storage'),
    onViewLocalStorageSuccess: (callback) => ipcRenderer.on('view-local-storage-success', (event, data) => callback(data)),
    onViewLocalStorageError: (callback) => ipcRenderer.on('view-local-storage-error', (event, error) => callback(error)),
});