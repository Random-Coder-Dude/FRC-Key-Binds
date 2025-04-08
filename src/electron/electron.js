const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let currentProject = null;

const windowOptions = {
    width: 800,
    height: 600,
    frame: true,
};

console.log("Starting Electron app...");

const getWorkingDirectory = () => {
    if (!currentProject) {
        console.error("No working directory set.");
        return null;
    }
    return path.join(currentProject, 'deploy', 'keybinder');
};

const ensureProjectFolder = (projectFolder) => {
    if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true });
        console.log(`Created directory: ${projectFolder}`);
    }
};

app.on('ready', () => {
    console.log("App is ready. Creating main window...");
    mainWindow = new BrowserWindow({
        ...windowOptions,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), // Corrected path
        },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('src/html/index.html'); // Ensure this path is correct

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    console.log("Main window created and loaded.");
});

ipcMain.on('set-current-project', (_event, projectPath) => {
    console.log(`Received project path: ${projectPath}`);
    currentProject = projectPath;
});

ipcMain.on('save-data-to-project', (event, { fullPath, filename, content }) => {
    if (!fullPath || !filename || !content) {
        console.error("Invalid parameters provided for saving data.");
        event.reply('save-data-error', "Invalid parameters provided.");
        return;
    }

    const filePath = path.join(fullPath, 'src', 'main', 'deploy', 'Keybinder', filename);

    try {
        // Ensure the directory exists
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log(`Created directory: ${directory}`);
        }

        // Write the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`File saved successfully: ${filePath}`);
        event.reply('save-data-success', `File saved successfully: ${filePath}`);
    } catch (err) {
        console.error(`Error saving file: ${err.message}`);
        event.reply('save-data-error', `Failed to save file: ${err.message}`);
    }
});

ipcMain.handle('show-directory-picker', async () => {
    console.log("dialog opened")
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result;
});

ipcMain.handle('get-directory-name', async (_event, directoryPath) => {
    return path.basename(directoryPath); // Extract the directory name
});

ipcMain.handle('get-directory-contents', async (_event, directoryPath) => {
    try {
        const contents = fs.readdirSync(directoryPath).map((fileName) => ({
            name: fileName,
            isFile: fs.statSync(path.join(directoryPath, fileName)).isFile(),
        }));
        return contents;
    } catch (error) {
        console.error("Error reading directory contents:", error);
        throw error;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.setMenuBarVisibility(false);
        mainWindow.loadFile('src/index.html');
    }
});
