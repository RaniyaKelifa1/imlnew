// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Function to create a new browser window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Allow use of Node.js in the renderer process
            preload: path.join(__dirname, 'preload.js'), // Optional, for security
        }
    });

    win.loadURL('http://localhost:3000'); // Load your React app (make sure it's running)
}

// Event listener for when the app is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Create a new window when the app is activated (macOS specific)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
