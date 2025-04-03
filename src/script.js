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
    } else {
        // Show elements if the working directory does not exist
        background.style.display = "block";
        openProjectButton.style.display = "flex";
        topBar.style.display = "flex";
    }

    if (topBarTitle) {
        topBarTitle.textContent = document.title;
    }
});

async function openProject() {
    try {
        // Show a directory picker to the user
        const directoryHandle = await window.showDirectoryPicker();
        
        // Save the directory handle for later use
        localStorage.setItem("workingDirectory", directoryHandle.name);

        // Reload the page to apply changes
        location.reload();
    } catch (error) {
        console.error("Error selecting directory:", error);
    }
}