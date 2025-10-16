import { app, BrowserWindow, systemPreferences, session, nativeTheme } from 'electron';
import { hasScreenCapturePermission, hasPromptedForPermission } from 'mac-screen-capture-permissions';
import { WIN_USERAGENT, MAC_USERAGENT, LINUX_USERAGENT } from './constants';
import { log } from './main/errorHandling';
import { createMainWindow } from './main/window';
import './main/cpuinfo';
import './main/shortcut';

// Force light mode
nativeTheme.themeSource = 'light';

// Enable sandbox mode for enhanced security
app.enableSandbox();

// Set security-related preferences
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

// Use software rendering if hardware acceleration fails
app.disableHardwareAcceleration();

if (process.platform !== 'win32' && process.platform !== 'darwin') {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    app.disableHardwareAcceleration();
}

app.whenReady().then(async () => {
    try {
        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            const headers = { ...details.requestHeaders };
            if (process.platform === 'win32') {
                headers['User-Agent'] = WIN_USERAGENT;
            } else if (process.platform === 'darwin') {
                headers['User-Agent'] = MAC_USERAGENT;
            } else {
                headers['User-Agent'] = LINUX_USERAGENT;
            }
            callback({ requestHeaders: headers });
        });

        if (process.platform === 'darwin') {
            if (systemPreferences.getMediaAccessStatus('camera') !== 'granted') {
                await systemPreferences.askForMediaAccess('camera');
            }
            if (systemPreferences.getMediaAccessStatus('microphone') !== 'granted') {
                await systemPreferences.askForMediaAccess('microphone');
            }
            if (systemPreferences.getMediaAccessStatus('screen') !== 'granted') {
                hasPromptedForPermission();
                hasScreenCapturePermission();
            }
        }
        createMainWindow();
    } catch (error) {
        log.error('Error during app initialization:', error);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    } else {
        global.mainWindow?.focus();
    }
});