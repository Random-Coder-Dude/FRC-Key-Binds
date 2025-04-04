const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const windowOptions = {
    width: 800,
    height: 600,
    frame: true,
};

console.log("Starting Electron app...");

app.on('ready', () => {
    console.log("App is ready. Creating main window...");
    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('src/index.html');

    mainWindow.on('closed', () => {
        console.log("Main window closed.");
        mainWindow = null;
    });

    console.log("Main window created and loaded.");
});

app.on('window-all-closed', () => {
    console.log("All windows closed.");
    if (process.platform !== 'darwin') {
        console.log("Quitting app...");
        app.quit();
    }
});

app.on('activate', () => {
    console.log("App activated.");
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log("No windows open. Creating main window...");
        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.setMenuBarVisibility(false);
        mainWindow.loadFile('src/index.html');
    }
});
