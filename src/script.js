document.addEventListener("DOMContentLoaded", () => {
    const topBarTitle = document.getElementById("topBarTitle");
    const background = document.getElementById("background");
    const openProjectButton = document.getElementById("openProject");
    const topBar = document.getElementById("topBar");

    // Check if the working directory exists in localStorage
    const workingDirectory = localStorage.getItem("workingDirectory");

    if (workingDirectory) {
        // Hide elements if the working directory exists
        background.style.display = "none";
        openProjectButton.style.display = "none";
        topBar.style.display = "flex"; // Ensure the top bar is visible
        topBarTitle.textContent = `Working Directory: ${workingDirectory}`; // Set the text to the working directory
    } else {
        // Show elements if the working directory does not exist
        background.style.display = "block";
        openProjectButton.style.display = "flex";
        topBar.style.display = "flex";
        topBarTitle.textContent = document.title; // Default title
    }
});

async function openProject() {
    try {
        // Show a directory picker to the user
        const directoryHandle = await window.showDirectoryPicker();

        // Check if the directory contains a build.gradle file
        let hasBuildGradle = false;
        for await (const [name, handle] of directoryHandle.entries()) {
            if (name === "build.gradle" && handle.kind === "file") {
                hasBuildGradle = true;
                break;
            }
        }

        if (hasBuildGradle) {
            // Save the directory handle for later use
            localStorage.setItem("workingDirectory", directoryHandle.name);

            alert("build.gradle found! Working directory set.");
            // Reload the page to apply changes
            location.reload();
        } else {
            alert("Error: build.gradle not found in the selected directory.");
        }
    } catch (error) {
        console.error("Error selecting directory:", error);
    }
}