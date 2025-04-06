const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');

let mainWindow;
let currentProject = null; // Store the current project path

const windowOptions = {
    width: 800,
    height: 600,
    frame: true,
};

console.log("Starting Electron app...");

// Define a function to get the working directory
const getWorkingDirectory = () => {
    if (!currentProject) {
        console.error("No working directory set.");
        return null;
    }
    return path.join(currentProject, 'deploy', 'keybinder');
};

// Ensure the directory exists
const ensureProjectFolder = (projectFolder) => {
    if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
        console.log(`Created directory: ${projectFolder}`);
    } else {
        console.log(`Directory already exists: ${projectFolder}`);
    }
};

// Start the Express server
const startBackend = () => {
    const backendApp = express();
    const port = 3000;

    // Define a simple API endpoint to check the backend status
    backendApp.get('/api/status', (req, res) => {
        res.json({ status: 'Backend is running', timestamp: new Date() });
    });

    // Define an endpoint to save data to the project folder
    backendApp.post('/api/save', express.json(), (req, res) => {
        const { filename, content } = req.body;
        const projectFolder = getWorkingDirectory();

        if (!projectFolder) {
            return res.status(400).json({ error: 'Working directory is not set.' });
        }

        ensureProjectFolder(projectFolder);

        if (!filename || !content) {
            return res.status(400).json({ error: 'Filename and content are required' });
        }

        const filePath = path.join(projectFolder, filename);
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                console.error(`Error saving file: ${err}`);
                return res.status(500).json({ error: 'Failed to save file' });
            }
            console.log(`File saved: ${filePath}`);
            res.json({ message: 'File saved successfully', filePath });
        });
    });

    backendApp.listen(port, () => {
        console.log(`Backend server is running at http://localhost:${port}`);
    });
};

app.on('ready', () => {
    console.log("App is ready. Creating main window...");
    mainWindow = new BrowserWindow({
        ...windowOptions,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'), // Use a preload script for secure communication
        },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('src/index.html');

    mainWindow.on('closed', () => {
        console.log("Main window closed.");
        mainWindow = null;
    });

    console.log("Main window created and loaded.");

    // Start the backend server
    startBackend();
});

// Listen for the current project path from the renderer process
ipcMain.on('set-current-project', (event, projectPath) => {
    console.log(`Received project path: ${projectPath}`);
    currentProject = projectPath; // Set the current project path dynamically

    // Log the updated working directory
    const workingDirectory = getWorkingDirectory();
    console.log(`Working directory updated to: ${workingDirectory}`);
});

// Listen for saving data to the project
ipcMain.on('save-data-to-project', (event, { filename, content }) => {
    if (!currentProject) {
        console.error("No working directory set. Cannot save data.");
        event.reply('save-data-error', "No working directory set.");
        return;
    }

    const projectFolder = currentProject; // Use the dynamically set project path
    ensureProjectFolder(projectFolder);

    const filePath = path.join(projectFolder, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(`Error saving file: ${err}`);
            event.reply('save-data-error', `Failed to save file: ${err.message}`);
        } else {
            console.log(`File saved successfully: ${filePath}`);
            event.reply('save-data-success', `File saved successfully: ${filePath}`);
        }
    });
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

ipcMain.on('set-current-project', (event, projectPath) => {
    console.log(`Received project path in main process: ${projectPath}`);
    currentProject = projectPath; // Set the current project path dynamically
});
