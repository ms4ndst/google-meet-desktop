const { BrowserWindow, screen } = require('electron');
const path = require('path');

class PiPManager {
    constructor(mainWindow, googleMeetView) {
        this.mainWindow = mainWindow;
        this.googleMeetView = googleMeetView;
        this.pipWindow = null;
        this.isInPiPMode = false;
    }

    toggle() {
        if (this.isInPiPMode) {
            this.disable();
        } else {
            this.enable();
        }
    }

    enable() {
        if (this.isInPiPMode) return;

        const display = screen.getPrimaryDisplay();
        const { width, height } = display.workAreaSize;

        this.pipWindow = new BrowserWindow({
            width: 320,
            height: 180,
            x: width - 320 - 20,
            y: height - 180 - 20,
            frame: false,
            alwaysOnTop: true,
            resizable: true,
            skipTaskbar: true,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                webSecurity: true
            }
        });

        // Clone the meeting view into PiP window
        this.googleMeetView.webContents.capturePage().then((image) => {
            this.pipWindow.webContents.loadURL(`data:text/html,
                <html>
                    <body style="margin: 0; overflow: hidden;">
                        <video id="pipVideo" style="width: 100%; height: 100%; object-fit: cover;"></video>
                    </body>
                    <script>
                        const video = document.getElementById('pipVideo');
                        navigator.mediaDevices.getUserMedia({ video: true })
                            .then(stream => {
                                video.srcObject = stream;
                                video.play();
                            });
                    </script>
                </html>
            `);
        });

        this.isInPiPMode = true;
        this.mainWindow.minimize();
    }

    disable() {
        if (!this.isInPiPMode) return;

        if (this.pipWindow) {
            this.pipWindow.close();
            this.pipWindow = null;
        }

        this.mainWindow.restore();
        this.isInPiPMode = false;
    }

    updatePosition(x, y) {
        if (this.pipWindow) {
            this.pipWindow.setPosition(x, y);
        }
    }

    updateSize(width, height) {
        if (this.pipWindow) {
            this.pipWindow.setSize(width, height);
        }
    }
}

module.exports = PiPManager;