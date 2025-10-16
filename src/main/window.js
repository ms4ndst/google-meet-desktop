/* All window creation functions */
const path = require("path");
const fs = require("fs");
const {
  BrowserWindow,
  BrowserView,
  ipcMain,
  screen,
  app,
  desktopCapturer
} = require("electron");
const windowStateKeeper = require("electron-window-state");
const TrayManager = require("./trayManager");
const PiPManager = require("./pipManager");
const NotesManager = require("./notesManager");

const GOOGLE_MEET_URL = "https://meet.google.com/";

let trayManager, pipManager, notesManager;

function createMainWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
    fullScreen: false,
    maximize: true,
  });

  const mainWindow = (global.mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
      spellcheck: true,
      devTools: true
    },
    webContentsDebuggingEnabled: true,
  }));
  mainWindowState.manage(mainWindow);
  
  // Register IPC handlers before loading the page
  ipcMain.handle('DESKTOP_CAPTURER_GET_SOURCES', async (event, opts) => {
    console.log('Getting desktop capture sources');
    try {
      const sources = await desktopCapturer.getSources(opts);
      return sources;
    } catch (error) {
      console.error('Error getting desktop capture sources:', error);
      throw error;
    }
  });

  ipcMain.handle("window.minimize", () => {
    console.log('Main process handling window.minimize');
    mainWindow.minimize();
  });

  ipcMain.handle("window.maximize", () => {
    console.log('Main process handling window.maximize');
    const wasMaximized = mainWindow.isMaximized();
    if (!wasMaximized) {
      mainWindow.maximize();
    } else {
      mainWindow.restore();
    }
  });

  ipcMain.handle("window.restore", () => {
    console.log('Main process handling window.restore');
    mainWindow.restore();
  });

  ipcMain.handle("window.close", () => {
    console.log('Main process handling window.close');
    mainWindow.close();
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
  mainWindow.webContents.on("did-finish-load", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.webContents.send("window.maximized");
    }
  });

  const googleMeetView = (global.googleMeetView = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(
        __dirname,
        "..",
        "renderer",
        "adapters",
        "polyfill.js"
      ),
      nativeWindowOpen: true,
      webgl: true,
      plugins: true,
      experimentalFeatures: true,
      enableWebGL: true,
      accelerator: "gpu",
      offscreen: false,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required'
    },
  }));
  
  // Set permissions for media
  googleMeetView.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    return true;
  });
  
  googleMeetView.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });
  mainWindow.setBrowserView(googleMeetView);

  // Load with default light mode
  googleMeetView.webContents.loadURL(GOOGLE_MEET_URL);
  googleMeetView.setBounds({
    x: 0,
    y: 32,
    width: mainWindow.getBounds().width,
    height: mainWindow.getBounds().height - 32,
  });
  googleMeetView.webContents.on("did-finish-load", () => {
    googleMeetView.webContents.insertCSS(
      fs
        .readFileSync(
          path.join(__dirname, "..", "renderer", "css", "screen.css")
        )
        .toString()
    );
  });
  // googleMeetView.webContents.openDevTools();

  // Initialize managers after view creation
  trayManager = new TrayManager(mainWindow, googleMeetView);
  pipManager = new PiPManager(mainWindow, googleMeetView);
  notesManager = new NotesManager(mainWindow);

  // Register IPC handlers
  ipcMain.handle("toggle:pip", () => pipManager.toggle());
  ipcMain.handle("toggle:notes", () => notesManager.toggle());

  mainWindow.on("resize", () => {
    googleMeetView.setBounds({
      x: 0,
      y: 32,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height - 32,
    });
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window.maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window.restored");
  });

  ipcMain.handle("window.home", async () => {
    console.log('Handling window home');
    await googleMeetView.webContents.loadURL(GOOGLE_MEET_URL);
  });

  let canvasWindow = createCanvasWindow();

  const screenToolsWindow = createScreenToolsWindow();

  // screenToolsWindow.moveAbove(canvasWindow.getMediaSourceId());

  ipcMain.handle("window.screenshare.show", () => {
    console.log('Handling screenshare show');
    mainWindow.minimize();
    screenToolsWindow.show();
  });

  ipcMain.handle("window.screenshare.hide", () => {
    console.log('Handling screenshare hide');
    screenToolsWindow.hide();
    screenToolsWindow.reload();
    canvasWindow.hide();
  });

  ipcMain.handle("window.canvas.show", () => {
    console.log('Handling canvas show');
    canvasWindow.show();
  });

  ipcMain.handle("window.canvas.hide", () => {
    console.log('Handling canvas hide');
    canvasWindow.hide();
    canvasWindow.reload();
  });

  ipcMain.handle("window.main.focus", () => {
    console.log('Handling main focus');
    mainWindow.restore();
    mainWindow.focus();
  });

  ipcMain.handle("screenshare.stop", () => {
    console.log('Handling screenshare stop');
    googleMeetView.webContents.send("screenshare.stop");
  });

  mainWindow.on("close", (event) => {
    // Clean up resources
    if (global.googleMeetView) {
      try {
        mainWindow.removeBrowserView(global.googleMeetView);
        global.googleMeetView.webContents.closeDevTools();
        global.googleMeetView.webContents.close();
        global.googleMeetView = null;
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });

  mainWindow.on("closed", () => {
    if (global.mainWindow) {
      global.mainWindow = null;
    }
    // Force cleanup
    if (global.gc) {
      global.gc();
    }
    app.quit();
  });
}

function createCanvasWindow() {
  const primaryWorkarea = screen.getPrimaryDisplay().bounds;
  const canvasWindow = new BrowserWindow({
    x: primaryWorkarea.x,
    y: primaryWorkarea.y,
    width: primaryWorkarea.width,
    height: primaryWorkarea.height,
    transparent: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
    },
    focusable: false,
    show: false,
    resizable: false,
    skipTaskbar: true,
  });
  canvasWindow.webContents.loadFile(
    path.join(__dirname, "..", "renderer", "canvas.html")
  );
  canvasWindow.setAlwaysOnTop(true, "pop-up-menu");
  return canvasWindow;
}

function createScreenToolsWindow() {
  const primaryWorkarea = screen.getPrimaryDisplay().bounds;
  const screenToolsWindow = new BrowserWindow({
    x: 100,
    y: primaryWorkarea.height - 200,
    height: 60,
    width: 300,
    frame: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    focusable: false,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, "..", "renderer", "preload.js"),
    },
  });

  screenToolsWindow.setContentProtection(process.platform === "darwin");

  screenToolsWindow.webContents.loadFile(
    path.join(__dirname, "..", "renderer", "toolbar.html")
  );
  screenToolsWindow.setAlwaysOnTop(true, "screen-saver");
  return screenToolsWindow;
}

module.exports = { createMainWindow };
