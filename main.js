const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');

// Keep a global reference of the window object
let mainWindow;
let epgServer;
let webServer;

// Create the main application window
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Start the EPG server
  startEPGServer();

  // Start the web server
  startWebServer();

  // Wait for servers to start, then load the app
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.show();
  }, 3000);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();
}

// Start the EPG server
function startEPGServer() {
  try {
    epgServer = spawn('node', [path.join(__dirname, 'epg-server.js')], {
      stdio: 'pipe'
    });

    epgServer.stdout.on('data', (data) => {
      console.log(`EPG Server: ${data}`);
    });

    epgServer.stderr.on('data', (data) => {
      console.error(`EPG Server Error: ${data}`);
    });

    epgServer.on('close', (code) => {
      console.log(`EPG Server exited with code ${code}`);
    });
  } catch (error) {
    console.error('Failed to start EPG server:', error);
  }
}

// Start the web server
function startWebServer() {
  const webApp = express();
  webApp.use(cors());
  webApp.use(express.static(__dirname));

  // Serve the main application
  webApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-iptv.html'));
  });

  // Start the web server
  webServer = webApp.listen(8080, 'localhost', () => {
    console.log('Web server running on http://localhost:8080');
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'IPTV Web Player',
      submenu: [
        {
          label: 'About IPTV Web Player',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Clean up servers
  if (epgServer) {
    epgServer.kill();
  }
  if (webServer) {
    webServer.close();
  }
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app termination
app.on('before-quit', () => {
  if (epgServer) {
    epgServer.kill();
  }
  if (webServer) {
    webServer.close();
  }
});