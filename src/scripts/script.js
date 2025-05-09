// Function to show a loading animation
function showLoading(message = "Loading...") {
    const loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loadingOverlay);
}

// Function to hide the loading animation
function hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Function to dynamically update the UI when switching screens
function updateUI({ showHome = false, showMain = false }) {
    showLoading("Loading Project...");

    const background = document.getElementById("background");
    const openProjectButton = document.getElementById("openProject");
    const projectSelector = document.getElementById("projectSelector");
    const addProjectButton = document.getElementById("addProjectButton");
    const topBar = document.getElementById("topBar");
    const sidebar = document.getElementById("sidebar");
    const mainUI = document.getElementById("mainUI");

    setTimeout(() => {
        if (showHome) {
            background.style.display = "none";
            openProjectButton.style.display = "flex";
            projectSelector.style.display = "none";
            addProjectButton.style.display = "none";
            topBar.style.display = "flex";
            topBarTitle.textContent = "FRC Automation Manager";
            sidebar.style.display = "none";
            mainUI.style.display = "none";
        }

        if (showMain) {
            background.style.display = "none";
            openProjectButton.style.display = "none";
            projectSelector.style.display = "inline-block";
            addProjectButton.style.display = "inline-block";
            topBar.style.display = "flex";
            sidebar.style.display = "block";
            mainUI.style.display = "flex";
        }

        hideLoading();
    }, 500);
}

// Function to initialize the app
function initializeApp() {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const currentProject = localStorage.getItem("currentProject");
    const projectSelector = document.getElementById("projectSelector");
    const topBarTitle = document.getElementById("topBarTitle");

    if (projects.length > 0) {
        projectSelector.innerHTML = projects
            .map((project) => `<option value="${project}">${project}</option>`)
            .join("");

        if (currentProject) {
            projectSelector.value = currentProject;
            topBarTitle.textContent = `Working Directory:`;
        }

        updateUI({ showMain: true });
    } else {
        updateUI({ showHome: true });
    }
}

// Function to handle the Open Project button click
async function openProject() {
    try {
        showLoading("Opening project...");

        const fullPath = await window.electronAPI.showDirectoryPicker();

        if (!fullPath) {
            console.log("Directory selection canceled.");
            return;
        }

        const directoryName = await window.electronAPI.getDirectoryName(fullPath); // Pass fullPath to getDirectoryName
        console.log("Full path:", fullPath);
        console.log("Directory name:", directoryName);

        const hasBuildGradle = await containsBuildGradle(fullPath);

        if (hasBuildGradle) {
            const projects = JSON.parse(localStorage.getItem("projects")) || [];
            const projectPaths = JSON.parse(localStorage.getItem("projectPaths")) || {};

            if (!projects.includes(directoryName)) {
                projects.push(directoryName);
                projectPaths[directoryName] = fullPath;
                localStorage.setItem("projects", JSON.stringify(projects));
                localStorage.setItem("projectPaths", JSON.stringify(projectPaths));
            }

            localStorage.setItem("currentProject", directoryName);
            updateProjectSelector(directoryName);
            triggerDirectoryPickedAnimation(directoryName);
        } else {
            alert("The selected directory does not contain a build.gradle file.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Error during directory selection:", error);
        }
    } finally {
        hideLoading();
    }
}

// Function to handle project selection changes
function handleProjectSelectionChange(event) {
    const selectedProject = event.target.value; // Get the selected project from the dropdown

    // Save the selected project as the current project
    localStorage.setItem("currentProject", selectedProject);

    // Notify the main process of the selected project path
    window.electronAPI.setCurrentProject(selectedProject);

    // Update the UI and title dynamically
    updateProjectSelector(selectedProject);
}

// Function to update the project selector dynamically
function updateProjectSelector(selectedProject) {
    const projectSelector = document.getElementById("projectSelector");
    const topBarTitle = document.getElementById("topBarTitle");
    const projects = JSON.parse(localStorage.getItem("projects")) || [];

    // Populate the dropdown with all projects
    projectSelector.innerHTML = projects
        .map((project) => `<option value="${project}">${project}</option>`)
        .join("");

    // Set the selected project in the dropdown
    projectSelector.value = selectedProject;

    // Update the top bar title
    topBarTitle.textContent = `Working Directory:`;

    // Update the UI to reflect the main app view
    updateUI({ showMain: true });
}

// Function to check if a directory contains a build.gradle file
async function containsBuildGradle(directoryPath) {
    try {
        const contents = await window.electronAPI.getDirectoryContents(directoryPath);
        return contents.some((entry) => entry.name.toLowerCase() === "build.gradle" && entry.isFile);
    } catch (error) {
        console.error("Error reading directory:", error);
        return false;
    }
}

// Function to show an animation when a directory is picked
function triggerDirectoryPickedAnimation(directoryName) {
    const animationElement = document.createElement("div");
    animationElement.id = "directoryPickedAnimation";
    animationElement.textContent = `Directory "${directoryName}" Selected!`;
    document.body.appendChild(animationElement);

    setTimeout(() => animationElement.classList.add("fade-out"), 1000);
    setTimeout(() => animationElement.remove(), 1500);
}

// Function to update the time and date in the top bar
function updateTimeDate() {
    const timeDateElement = document.getElementById("timeDate");
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "numeric" });
    const date = now.toLocaleDateString();
    timeDateElement.textContent = `${date} | ${time}`;
}

// Function to save data into the project directory
function saveData(filename, key, content, KorA) {
    if (!filename || !key || !content || !KorA) {
        console.error("Filename, key, content, and KorA are required to save data.");
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
    try {
        if (KorA === 1) {
            window.electronAPI.saveDataToProjectK(fullPath, filename, key, content);
        } else if (KorA === 2) {
            window.electronAPI.saveDataToProjectA(fullPath, filename, key, content);
        } else {
            console.error("Invalid KorA value. Must be 1 or 2.");
            alert("Invalid KorA value. Please specify 1 for keybinds or 2 for automations.");
            hideLoading();
            return;
        }

        console.log("Data save request sent successfully!");
    } catch (error) {
        console.error("Error while saving data:", error);
        alert("An error occurred while saving data. Check the console for details.");
    } finally {
        setTimeout(() => {
            hideLoading();
        }, 500);
    }
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.clear();
    alert("Local storage has been cleared.");
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();

    document.getElementById("openProject").addEventListener("click", openProject);
    document.getElementById("addProjectButton").addEventListener("click", openProject);
    document.getElementById("homeButton").addEventListener("click", () => updateUI({ showHome: true }));
    document.getElementById("settingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("hidden");
    });
    document.getElementById("closeSettingsButton").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("hidden");
    });

    // Add event listener for clearing local storage
    document.getElementById("clearLocalStorageButton").addEventListener("click", clearLocalStorage);

    // Add event listener for project selection changes
    document.getElementById("projectSelector").addEventListener("change", handleProjectSelectionChange);

    setInterval(updateTimeDate, 1000);
    updateTimeDate();
});

// Remove duplicate event listeners
document.addEventListener("DOMContentLoaded", () => {
    const projectSelector = document.getElementById("projectSelector");
    if (!projectSelector) {
        console.error("Project selector element not found in the DOM.");
    }
});

// Remove duplicate event listener for project selection changes
document.getElementById("projectSelector")?.addEventListener("change", handleProjectSelectionChange);

// Remove duplicate event listener for viewing local storage
document.getElementById("view-local-storage-btn")?.addEventListener("click", () => {
    window.electronAPI.viewLocalStorage();
});

// Remove duplicate Electron API listeners
window.electronAPI.onViewLocalStorageSuccess = null;
window.electronAPI.onViewLocalStorageError = null;

if (!window.electronAPI) {
    console.error("window.electronAPI is not defined. Check preload.js and electron.js configuration.");
}