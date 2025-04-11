const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script loaded successfully.");

contextBridge.exposeInMainWorld('electronAPI', {
    setCurrentProject: (projectPath) => ipcRenderer.send('set-current-project', projectPath),
    saveDataToProjectK: (fullPath, filename, key, content) => ipcRenderer.send('save-data-to-project-keybinds', { fullPath, filename, key, content }),
    saveDataToProjectA: (fullPath, filename, key, content) => ipcRenderer.send('save-data-to-project-automations', { fullPath, filename, key, content }),
    showDirectoryPicker: async () => {
        const result = await ipcRenderer.invoke('show-directory-picker');
        return result.filePaths[0];
    },
    getDirectoryName: async (directoryPath) => {
        return await ipcRenderer.invoke('get-directory-name', directoryPath); // Pass directoryPath to the handler
    },
    getDirectoryContents: async (directoryPath) => {
        return await ipcRenderer.invoke('get-directory-contents', directoryPath);
    },
});