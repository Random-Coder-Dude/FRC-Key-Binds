// Function to save data into the project directory
function saveData(filename, key, content) {
    if (!filename || !key || !content) {
        console.error("Filename, key, and content are required to save data.");
        return;
    }

    const currentProject = localStorage.getItem("currentProject");
    const projectPaths = JSON.parse(localStorage.getItem("projectPaths")) || {};
    const fullPath = projectPaths[currentProject];

    if (!fullPath || typeof fullPath !== "string") {
        console.error("Full path for the current project is invalid or not found.");
        alert("Failed to save data. Full path for the current project is missing or invalid.");
        return;
    }

    showLoading("Saving Data...");
    window.electronAPI.saveDataToProject(fullPath, filename, key, content);

    // Listen for success or error responses
    window.electronAPI.on('save-data-success', (message) => {
        hideLoading();
        console.log(message);
        alert("Data saved successfully!");
    });

    window.electronAPI.on('save-data-error', ({ message, details }) => {
        hideLoading();
        console.error(message, details);
        alert(`Failed to save data: ${message}`);
    });
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.clear();
    alert("Local storage has been cleared.");
}

export { saveData, clearLocalStorage };