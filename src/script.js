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
    }, 500); // Add a slight delay for the loading animation
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
            console.log("test");
            projectSelector.value = currentProject;
            topBarTitle.textContent = `Working Directory: ${currentProject}`;
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
        console.log("Opening project...");

        if (!window.showDirectoryPicker) {
            alert("Your browser does not support the directory picker API.");
            console.error("Directory picker API not supported.");
            return;
        }

        const directoryHandle = await window.showDirectoryPicker();
        const directoryPath = directoryHandle.name; // Display name
        const fullPath = directoryHandle; // Full path

        console.log("Directory selected:", fullPath);

        const hasBuildGradle = await containsBuildGradle(directoryHandle);
        console.log("Contains build.gradle:", hasBuildGradle);

        if (hasBuildGradle) {
            const projects = JSON.parse(localStorage.getItem("projects")) || [];
            const projectPaths = JSON.parse(localStorage.getItem("projectPaths")) || {};

            if (!projects.includes(directoryPath)) {
                projects.push(directoryPath);
                projectPaths[directoryPath] = fullPath;
                localStorage.setItem("projects", JSON.stringify(projects));
                localStorage.setItem("projectPaths", JSON.stringify(projectPaths));
            }

            localStorage.setItem("currentProject", directoryPath);
            updateProjectSelector(directoryPath);
            triggerDirectoryPickedAnimation(directoryPath);
        } else {
            alert("The selected directory does not contain a build.gradle file.");
            console.error("build.gradle file not found in the selected directory.");
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error("Error during directory selection:", error);
        }
    } finally {
        hideLoading();
        console.log("Finished opening project.");
    }
}

// Function to handle project selection changes
function handleProjectSelectionChange(event) {
    const selectedProject = event.target.value; // Get the selected project from the dropdown
    console.log(`Selected project: ${selectedProject}`);

    // Save the selected project as the current project
    localStorage.setItem("currentProject", selectedProject);
    console.log("Saved to localStorage:", localStorage.getItem("currentProject"));

    // Notify the main process of the selected project path
    window.electronAPI.setCurrentProject(selectedProject);
    console.log("Notified main process of the selected project.");

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
    console.log("Dropdown updated with projects:", projects);

    // Set the selected project in the dropdown
    projectSelector.value = selectedProject;
    console.log("Dropdown value set to:", selectedProject);

    // Update the top bar title
    topBarTitle.textContent = `Working Directory: ${selectedProject}`;
    console.log("Top bar title updated to:", topBarTitle.textContent);

    // Update the UI to reflect the main app view
    updateUI({ showMain: true });
}

// Function to check if a directory contains a build.gradle file
async function containsBuildGradle(directoryHandle) {
    try {
        for await (const [name, handle] of directoryHandle.entries()) {
            if (name.toLowerCase() === "build.gradle" && handle.kind === "file") {
                return true;
            }
        }
    } catch (error) {
        console.error("Error reading directory:", error);
    }
    return false;
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
function saveData(filename, content) {
    if (!filename || !content) {
        console.error("Filename and content are required to save data.");
        return;
    }

    const currentProject = localStorage.getItem("currentProject");
    const projectPaths = JSON.parse(localStorage.getItem("projectPaths")) || {};
    const fullPath = projectPaths[currentProject];

    if (!fullPath) {
        console.error("Full path for the current project not found.");
        alert("Failed to save data. Full path for the current project is missing.");
        return;
    }

    showLoading("Saving Data...");
    window.electronAPI.saveDataToProject(fullPath, { filename, content });

    setTimeout(() => {
        hideLoading();
        console.log("Data saved successfully!");
    }, 500);
}

// Function to clear local storage
function clearLocalStorage() {
    localStorage.clear();
    console.log("Local storage cleared.");
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

document.addEventListener("DOMContentLoaded", () => {
    const projectSelector = document.getElementById("projectSelector");
    if (!projectSelector) {
        console.error("Project selector element not found in the DOM.");
    } else {
        console.log("Project selector element found:", projectSelector);
    }

    // Add event listener for project selection changes
    projectSelector.addEventListener("change", (event) => {
        console.log("Dropdown change event triggered.");
        handleProjectSelectionChange(event);
    });
});

document.getElementById("projectSelector").addEventListener("change", handleProjectSelectionChange);

console.log("window.electronAPI:", window.electronAPI);

if (!window.electronAPI) {
    console.error("window.electronAPI is not defined. Check preload.js and electron.js configuration.");
}