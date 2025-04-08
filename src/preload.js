const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload script loaded successfully.");

contextBridge.exposeInMainWorld('electronAPI', {
    setCurrentProject: (projectPath) => ipcRenderer.send('set-current-project', projectPath),
    saveDataToProject: (fullPath, filename, content) => ipcRenderer.send('save-data-to-project', { fullPath, filename, content }),
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