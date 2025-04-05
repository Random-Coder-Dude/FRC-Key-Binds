const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setCurrentProject: (projectPath) => ipcRenderer.send('set-current-project', projectPath),
    saveDataToProject: (filename, content) => ipcRenderer.send('save-data-to-project', { filename, content }),
});