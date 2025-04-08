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
        }

        updateUI({ showMain: true });
    } else {
        updateUI({ showHome: true });
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

    // Remove existing event listeners before adding new ones
    if (openProjectButton) {
        openProjectButton.replaceWith(openProjectButton.cloneNode(true));
        document.getElementById("openProject").addEventListener("click", openProject);
    }

    if (addProjectButton) {
        addProjectButton.replaceWith(addProjectButton.cloneNode(true));
        document.getElementById("addProjectButton").addEventListener("click", openProject);
    }

    if (homeButton) {
        homeButton.replaceWith(homeButton.cloneNode(true));
        document.getElementById("homeButton").addEventListener("click", () => updateUI({ showHome: true }));
    }

    if (settingsButton) {
        settingsButton.replaceWith(settingsButton.cloneNode(true));
        document.getElementById("settingsButton").addEventListener("click", () => {
            document.getElementById("settingsOverlay").classList.remove("hidden");
        });
    }

    if (closeSettingsButton) {
        closeSettingsButton.replaceWith(closeSettingsButton.cloneNode(true));
        document.getElementById("closeSettingsButton").addEventListener("click", () => {
            document.getElementById("settingsOverlay").classList.add("hidden");
        });
    }

    if (clearLocalStorageButton) {
        clearLocalStorageButton.replaceWith(clearLocalStorageButton.cloneNode(true));
        document.getElementById("clearLocalStorageButton").addEventListener("click", clearLocalStorage);
    }

    if (projectSelector) {
        projectSelector.replaceWith(projectSelector.cloneNode(true));
        document.getElementById("projectSelector").addEventListener("change", handleProjectSelectionChange);
    }

    // Update time and date periodically
    setInterval(updateTimeDate, 1000);
    updateTimeDate();
});