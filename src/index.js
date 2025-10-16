/* Modules to control application life and create native browser window */
const { app, BrowserWindow, systemPreferences, session, nativeTheme } = require("electron");

// Force light mode
nativeTheme.themeSource = 'light';
// Screen capture permissions are handled by the OS on Windows
const {
  WIN_USERAGENT,
  MAC_USERAGENT,
  LINUX_USERAGENT,
} = require("./constants");

// Enable sandbox mode for enhanced security
app.enableSandbox();

// Enable DevTools in development
app.on('ready', () => {
  require('electron').globalShortcut.register('Control+Shift+I', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  });
});

// Enable hardware acceleration and optimize video performance
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer,WebRTCHWDecoding,WebRTCHWEncoding,HardwareMediaKeyHandling,DesktopCapture,MediaStreamAPI');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('force-gpu-mem-available-mb', '1024');

// Security settings
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('ignore-certificate-errors');

require("./main/cpuinfo");
require("./main/shortcut");
const { createMainWindow } = require("./main/window");

// Platform specific optimizations
if (process.platform === "win32") {
  app.commandLine.appendSwitch('enable-hardware-overlay', 'true');
  app.commandLine.appendSwitch('enable-win7-webrtc-hw-h264');
  app.commandLine.appendSwitch('enable-direct-composition-encoder');
} else if (process.platform === "darwin") {
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
  app.commandLine.appendSwitch('enable-media-encoder');
} else {
  app.commandLine.appendSwitch("enable-transparent-visuals");
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (process.platform === "win32") {
      details.requestHeaders["User-Agent"] = WIN_USERAGENT;
    } else if (process.platform === "darwin") {
      details.requestHeaders["User-Agent"] = MAC_USERAGENT;
    } else {
      details.requestHeaders["User-Agent"] = LINUX_USERAGENT;
    }
    callback({ requestHeaders: details.requestHeaders });
  });
  if (process.platform === "darwin") {
    if (systemPreferences.getMediaAccessStatus("camera") !== "granted") {
      await systemPreferences.askForMediaAccess("camera");
    }
    if (systemPreferences.getMediaAccessStatus("microphone") !== "granted") {
      await systemPreferences.askForMediaAccess("microphone");
    }
    if (systemPreferences.getMediaAccessStatus("screen") !== "granted") {
      hasPromptedForPermission();
      hasScreenCapturePermission();
    }
  }
  createMainWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else {
    global.mainWindow && global.mainWindow.focus();
  }
});
