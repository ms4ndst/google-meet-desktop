const { Tray, Menu, app, clipboard } = require('electron');
const path = require('path');

class TrayManager {
    constructor(mainWindow, googleMeetView) {
        this.tray = null;
        this.mainWindow = mainWindow;
        this.googleMeetView = googleMeetView;
        this.initialize();
    }

    initialize() {
        this.tray = new Tray(path.join(__dirname, '..', 'assets', 'icon.ico'));
        this.tray.setToolTip('Google Meet Desktop');
        this.updateContextMenu();

        // Update menu periodically to refresh meeting status
        setInterval(() => this.updateContextMenu(), 10000);
    }

    updateContextMenu() {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quick Join Meeting',
                click: () => this.handleQuickJoin()
            },
            {
                label: 'Toggle Camera',
                click: () => this.toggleCamera()
            },
            {
                label: 'Toggle Microphone',
                click: () => this.toggleMicrophone()
            },
            { type: 'separator' },
            {
                label: 'Show Window',
                click: () => {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                }
            },
            {
                label: 'Toggle Picture in Picture',
                click: () => this.togglePiP()
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);

        this.tray.setContextMenu(contextMenu);
    }

    async handleQuickJoin() {
        const meetingUrl = clipboard.readText();
        if (meetingUrl.includes('meet.google.com')) {
            await this.googleMeetView.webContents.loadURL(meetingUrl);
            this.mainWindow.show();
            this.mainWindow.focus();
        }
    }

    toggleCamera() {
        this.googleMeetView.webContents.executeJavaScript(`
            const cameraButton = document.querySelector('[aria-label*="camera"][role="button"]');
            if (cameraButton) cameraButton.click();
        `);
    }

    toggleMicrophone() {
        this.googleMeetView.webContents.executeJavaScript(`
            const micButton = document.querySelector('[aria-label*="microphone"][role="button"]');
            if (micButton) micButton.click();
        `);
    }

    togglePiP() {
        if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
        } else {
            this.mainWindow.minimize();
        }
        // Toggle PiP window here
    }
}

module.exports = TrayManager;