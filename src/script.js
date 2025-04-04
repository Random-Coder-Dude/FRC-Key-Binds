// Function to show a loading animation
function showLoading(message = "Loading...") {
    console.log("Showing loading overlay with message:", message); // Debugging log
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
    console.log("Hiding loading overlay."); // Debugging log
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Ensure these functions are defined before they are used
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Initializing app...");

    // Get references to various DOM elements
    const topBarTitle = document.getElementById("topBarTitle");
    const background = document.getElementById("background");
    const openProjectButton = document.getElementById("openProject");
    const projectSelector = document.getElementById("projectSelector");
    const addProjectButton = document.getElementById("addProjectButton");
    const topBar = document.getElementById("topBar");
    const sidebar = document.getElementById("sidebar");
    const mainUI = document.getElementById("mainUI");
    const timeDateElement = document.getElementById("timeDate");

    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");

    // Ensure all required DOM elements are found
    if (!openProjectButton) {
        console.error("Open Project button not found in the DOM.");
    }
    if (!addProjectButton) {
        console.error("Add Project button not found in the DOM.");
    }
    if (!homeButton) {
        console.error("Home button not found in the DOM.");
    }
    if (!settingsButton) {
        console.error("Settings button not found in the DOM.");
    }

    // Retrieve projects and the current project from localStorage
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const currentProject = localStorage.getItem("currentProject");

    // Function to show the Home Screen
    function showHomeScreen() {
        console.log("Switching to Home Screen...");
        background.style.display = "none"; // Hide background
        openProjectButton.style.display = "flex"; // Show Open Project button
        projectSelector.style.display = "none"; // Hide project selector
        addProjectButton.style.display = "none"; // Hide add project button
        topBar.style.display = "flex"; // Show top bar
        sidebar.style.display = "none"; // Hide sidebar
        mainUI.style.display = "none"; // Hide main UI
        Array.from(mainUI.children).forEach((child) => {
            child.style.display = "none"; // Ensure child elements of mainUI are hidden
        });
        topBarTitle.textContent = "FRC Key Binder"; // Reset the title
    }

    // Function to show the Main App
    function showMainApp() {
        console.log("Switching to Main App...");
        background.style.display = "none"; // Hide background
        openProjectButton.style.display = "none"; // Hide Open Project button
        projectSelector.style.display = "inline-block"; // Show project selector
        addProjectButton.style.display = "inline-block"; // Show add project button
        topBar.style.display = "flex"; // Show top bar
        sidebar.style.display = "block"; // Show sidebar
        mainUI.style.display = "flex"; // Show main UI
        Array.from(mainUI.children).forEach((child) => {
            child.style.display = "block"; // Ensure child elements of mainUI are visible
        });
        topBarTitle.textContent = `Working Directory:`; // Update the title
    }

    // Check if there are any projects saved
    if (projects.length > 0) {
        console.log("Projects found in localStorage:", projects);
        // Populate the project selector dropdown with saved projects
        projectSelector.innerHTML = projects
            .map((project) => `<option value="${project}">${project}</option>`)
            .join("");

        // Set the current project in the dropdown if it exists
        if (currentProject) {
            projectSelector.value = currentProject;
        }

        // Show the Main App
        showMainApp();
    } else {
        console.log("No projects found. Showing Home Screen...");
        // Show the Home Screen
        showHomeScreen();
    }

    // Bind the openProject function to the Open Project button
    if (openProjectButton) {
        console.log("Binding openProject function to Open Project button.");
        openProjectButton.addEventListener("click", openProject);
    }

    // Bind the openProject function to the Add Project button
    if (addProjectButton) {
        console.log("Binding openProject function to Add Project button.");
        addProjectButton.addEventListener("click", openProject);
    }

    // Handle the Home button click to return to the Home Screen
    if (homeButton) {
        homeButton.addEventListener("click", () => {
            console.log("Home button clicked.");
            showHomeScreen();
        });
    }

    // Handle the Settings button click to show the settings overlay
    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            console.log("Settings button clicked.");
            const settingsOverlay = document.getElementById("settingsOverlay");
            settingsOverlay.classList.remove("hidden"); // Show the settings overlay
        });
    }

    // Handle the close button in the settings overlay
    const closeSettingsButton = document.getElementById("closeSettingsButton");
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener("click", () => {
            console.log("Close Settings button clicked.");
            const settingsOverlay = document.getElementById("settingsOverlay");
            settingsOverlay.classList.add("hidden"); // Hide the settings overlay
        });
    }

    // Function to update the time and date in the top bar
    function updateTimeDate() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const date = now.toLocaleDateString();
        timeDateElement.textContent = `${date} | ${time}`; // Update the time and date display
    }

    // Update the time and date every second
    setInterval(updateTimeDate, 1000);
    updateTimeDate(); // Initial call to set the time and date immediately

    // Handle controller type selection changes
    const controllerTypeSelect = document.getElementById("controllerType");
    const controller = document.getElementById("controller");

    controllerTypeSelect.addEventListener("change", (event) => {
        const selectedType = event.target.value;
        controller.className = selectedType; // Update the controller class
    });

    // Set the default controller type to Xbox
    controller.classList.add("xbox");
});

// Function to handle the Open Project button click
async function openProject() {
    console.log("openProject function called.");
    try {
        showLoading("Opening project..."); // Show loading animation

        // Check if the browser supports the directory picker API
        if (!window.showDirectoryPicker) {
            console.error("Directory picker API is not supported.");
            alert("Your browser does not support the directory picker API.");
            return;
        }

        console.log("Opening directory picker..."); // Debugging log before opening the picker
        // Open the directory picker
        const directoryHandle = await window.showDirectoryPicker();

        console.log("Directory selected:", directoryHandle.name); // Debugging log for selected directory

        // Check if the directory contains a build.gradle file
        const hasBuildGradle = await containsBuildGradle(directoryHandle);

        if (hasBuildGradle) {
            console.log("build.gradle file found in directory.");
            const projects = JSON.parse(localStorage.getItem("projects")) || [];

            // Add the selected project to the list if it's not already there
            if (!projects.includes(directoryHandle.name)) {
                projects.push(directoryHandle.name);
                localStorage.setItem("projects", JSON.stringify(projects)); // Save the updated list
            }

            // Save the current project
            localStorage.setItem("currentProject", directoryHandle.name);

            // Show a success animation
            triggerDirectoryPickedAnimation(directoryHandle.name);

            // Reload the page after a short delay to reflect changes
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            console.warn("No build.gradle file found in directory.");
            // Alert the user if the directory does not contain a build.gradle file
            alert("The selected directory does not contain a build.gradle file.");
        }
    } catch (error) {
        // Handle errors gracefully
        if (error.name === "AbortError") {
            console.log("Directory selection was canceled.");
        } else {
            console.error("Error during directory selection:", error);
        }
    } finally {
        hideLoading(); // Hide the loading animation
    }
}

// Function to show an animation when a directory is picked
function triggerDirectoryPickedAnimation(directoryName) {
    const animationElement = document.createElement("div");
    animationElement.id = "directoryPickedAnimation";
    animationElement.textContent = `Directory "${directoryName}" Selected!`;
    document.body.appendChild(animationElement);

    setTimeout(() => {
        animationElement.classList.add("fade-out"); // Fade out the animation
    }, 1000);

    setTimeout(() => {
        animationElement.remove(); // Remove the animation element
    }, 1500);
}

// Function to show an animation when a project is uploaded
function triggerUploadAnimation() {
    const animationElement = document.createElement("div");
    animationElement.id = "uploadAnimation";
    animationElement.textContent = "Project Uploaded!";
    document.body.appendChild(animationElement);

    setTimeout(() => {
        animationElement.classList.add("fade-out"); // Fade out the animation
    }, 500);

    setTimeout(() => {
        animationElement.remove(); // Remove the animation element
    }, 1000);
}

// Function to check if a directory contains a build.gradle file
async function containsBuildGradle(directoryHandle) {
    try {
        for await (const [name, handle] of directoryHandle.entries()) {
            console.log(`Checking file: ${name}`);
            if (name.toLowerCase() === "build.gradle" && handle.kind === "file") {
                return true; // Return true if a build.gradle file is found
            }
        }
    } catch (error) {
        console.error("Error reading directory:", error); // Log any errors
    }
    return false; // Return false if no build.gradle file is found
}