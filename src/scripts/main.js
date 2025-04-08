import { showLoading, hideLoading, updateUI, updateTimeDate } from "./ui.js";
import { saveData, clearLocalStorage } from "./storage.js";
import {
    openProject,
    handleProjectSelectionChange,
    updateProjectSelector,
} from "./project.js";

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

    const openProjectButton = document.getElementById("openProject");
    const addProjectButton = document.getElementById("addProjectButton");
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    const clearLocalStorageButton = document.getElementById("clearLocalStorageButton");
    const projectSelector = document.getElementById("projectSelector");

    // Remove existing event listeners before adding new ones
    openProjectButton.replaceWith(openProjectButton.cloneNode(true));
    addProjectButton.replaceWith(addProjectButton.cloneNode(true));
    homeButton.replaceWith(homeButton.cloneNode(true));
    settingsButton.replaceWith(settingsButton.cloneNode(true));
    closeSettingsButton.replaceWith(closeSettingsButton.cloneNode(true));
    clearLocalStorageButton.replaceWith(clearLocalStorageButton.cloneNode(true));
    projectSelector.replaceWith(projectSelector.cloneNode(true));

    // Reassign variables to the cloned elements
    const newOpenProjectButton = document.getElementById("openProject");
    const newAddProjectButton = document.getElementById("addProjectButton");
    const newHomeButton = document.getElementById("homeButton");
    const newSettingsButton = document.getElementById("settingsButton");
    const newCloseSettingsButton = document.getElementById("closeSettingsButton");
    const newClearLocalStorageButton = document.getElementById("clearLocalStorageButton");
    const newProjectSelector = document.getElementById("projectSelector");

    // Add event listeners to the cloned elements
    newOpenProjectButton.addEventListener("click", openProject);
    newAddProjectButton.addEventListener("click", openProject);
    newHomeButton.addEventListener("click", () => updateUI({ showHome: true }));
    newSettingsButton.addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("hidden");
    });
    newCloseSettingsButton.addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("hidden");
    });
    newClearLocalStorageButton.addEventListener("click", clearLocalStorage);
    newProjectSelector.addEventListener("change", handleProjectSelectionChange);

    setInterval(updateTimeDate, 1000);
    updateTimeDate();
});