// Function to save data into the project directory
function saveData(filename, content) {
    if (!filename || !content) {
        console.error("Filename and content are required to save data.");
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
    window.electronAPI.saveDataToProject(fullPath, filename, content);

    setTimeout(() => {
        hideLoading();
        console.log("Data saved successfully!");
    }, 500);
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.clear();
    alert("Local storage has been cleared.");
}

export { saveData, clearLocalStorage };