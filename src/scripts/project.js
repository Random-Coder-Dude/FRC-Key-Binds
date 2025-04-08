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

export {
    openProject,
    handleProjectSelectionChange,
    updateProjectSelector,
    containsBuildGradle,
    triggerDirectoryPickedAnimation,
};