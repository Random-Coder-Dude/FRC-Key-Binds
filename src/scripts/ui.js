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
            topBarTitle.textContent = "FRC Key Binder";
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

// Function to update the time and date in the top bar
function updateTimeDate() {
    const timeDateElement = document.getElementById("timeDate");
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "numeric" });
    const date = now.toLocaleDateString();
    timeDateElement.textContent = `${date} | ${time}`;
}

export { showLoading, hideLoading, updateUI, updateTimeDate };