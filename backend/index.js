const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express'); // Import express

const PORT = 5000; // Define the port for your server
const serverApp = express(); // Create an Express app

// Set up CORS and middleware
serverApp.use(require('cors')());
serverApp.use(express.json());

// Define your API endpoint
serverApp.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Start the Express server
serverApp.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

// Function to create the Electron window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the index.html file from the build folder
    win.loadFile(path.join(__dirname, 'frontend/build/index.html'));
}

// Start the Electron app when ready
app.whenReady().then(() => {
    createWindow(); // Create the Electron window

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
