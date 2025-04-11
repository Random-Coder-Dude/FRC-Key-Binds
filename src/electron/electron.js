const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const editJsonFile = require("edit-json-file");
const fs = require('fs/promises'); // Use promises for file operations

let mainWindow;
let currentProject = null;

const windowOptions = {
    width: 800,
    height: 600,
    frame: true,
};

console.log("Starting Electron app...");

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

ipcMain.on('save-data-to-project-keybinds', async (event, { fullPath, filename, key, content }) => {
    if (!fullPath || !filename || !key || !content) {
        console.error("Invalid parameters provided for saving data.");
        event.reply('save-data-error', {
            message: "Invalid parameters provided.",
            details: { fullPath, filename, key, content },
        });
        return;
    }

    const filePath = path.join(fullPath, 'src', 'main', 'deploy', 'Keybinder', filename);
    const templatePath = path.join(__dirname, '..', '..', 'lib', 'json', 'keybind_template.json'); // Path to the template

    try {
        // Check if the file exists
        try {
            await fs.access(filePath);
            console.log(`File already exists: ${filePath}`);
        } catch {
            // File does not exist, create it and copy the template
            await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure the directory exists
            await fs.copyFile(templatePath, filePath);
            console.log(`Template copied to: ${filePath}`);
        }

        // Load or create the JSON file
        const file = editJsonFile(filePath, { autosave: true });

        // Retrieve the keybinds array
        const keybinds = file.get("keybinds") || [];

        // Find the object with the matching key
        const targetKeybind = keybinds.find((keybind) => keybind.key === key);

        if (targetKeybind) {
            // Update the action and parameters of the matching keybind
            targetKeybind.action = content.action;
            targetKeybind.parameters = content.parameters;
        } else {
            console.error(`Key "${key}" not found in keybinds.`);
            event.reply('save-data-error', {
                message: `Key "${key}" not found in keybinds.`,
            });
            return;
        }

        // Save the updated keybinds array back to the file
        file.set("keybinds", keybinds);

        console.log(`Data saved successfully for key "${key}": ${filePath}`);
        console.log(file.toObject());

        event.reply('save-data-success', `Data saved successfully for key "${key}": ${filePath}`);
    } catch (err) {
        console.error(`Error saving data: ${err.message}`);
        event.reply('save-data-error', {
            message: "Failed to save data.",
            error: err.message,
        });
    }
});

ipcMain.on('save-data-to-project-automations', async (event, { fullPath, filename, key, content }) => {
    if (!fullPath || !filename || !key || !content) {
        console.error("Invalid parameters provided for saving data.");
        event.reply('save-data-error', {
            message: "Invalid parameters provided.",
            details: { fullPath, filename, key, content },
        });
        return;
    }

    const filePath = path.join(fullPath, 'src', 'main', 'deploy', 'Keybinder', filename);
    const templatePath = path.join(__dirname, '..', '..', 'lib', 'json', 'automation_template.json'); // Path to the template

    try {
        // Check if the file exists
        try {
            await fs.access(filePath);
            console.log(`File already exists: ${filePath}`);
        } catch {
            // File does not exist, create it and copy the template
            await fs.mkdir(path.dirname(filePath), { recursive: true }); // Ensure the directory exists
            await fs.copyFile(templatePath, filePath);
            console.log(`Template copied to: ${filePath}`);
        }

        // Load or create the JSON file
        const file = editJsonFile(filePath, { autosave: true });

        file.append(key, content);

        console.log(`Data saved successfully for key "${key}": ${filePath}`);
        console.log(file.toObject());

        event.reply('save-data-success', `Data saved successfully for key "${key}": ${filePath}`);
    } catch (err) {
        console.error(`Error saving data: ${err.message}`);
        event.reply('save-data-error', {
            message: "Failed to save data.",
            error: err.message,
        });
    }
});

ipcMain.handle('show-directory-picker', async () => {
    console.log("dialog opened");
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
        const fileNames = await fs.readdir(directoryPath, { withFileTypes: true });
        return fileNames.map((file) => ({
            name: file.name,
            isFile: file.isFile(),
        }));
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
