import { updateUI, updateTimeDate } from "./ui.js";
import { clearLocalStorage } from "./storage.js";
import { openProject, handleProjectSelectionChange } from "./project.js";

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
            updateUI({ showMain: true }); // Ensure the main UI is shown
        } else {
            updateUI({ showHome: true }); // Show the home screen if no current project
        }
    } else {
        updateUI({ showHome: true }); // Show the home screen if no projects exist
    }
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();

    // Add event listeners only if elements exist
    const openProjectButton = document.getElementById("openProject");
    const addProjectButton = document.getElementById("addProjectButton");
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    const clearLocalStorageButton = document.getElementById("clearLocalStorageButton");
    const projectSelector = document.getElementById("projectSelector");

    // Update time and date periodically
    setInterval(updateTimeDate, 1000);
    updateTimeDate();
});