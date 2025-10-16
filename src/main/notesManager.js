const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class NotesManager {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.notesWindow = null;
        this.notesPath = path.join(app.getPath('userData'), 'meeting-notes');
        this.initialize();
    }

    async initialize() {
        await this.ensureNotesDirectory();
        this.setupIpcHandlers();
    }

    async ensureNotesDirectory() {
        try {
            await fs.mkdir(this.notesPath, { recursive: true });
        } catch (error) {
            console.error('Error creating notes directory:', error);
        }
    }

    setupIpcHandlers() {
        ipcMain.handle('notes:save', async (event, { title, content }) => {
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
            const filePath = path.join(this.notesPath, fileName);
            await fs.writeFile(filePath, content, 'utf8');
            return { success: true, filePath };
        });

        ipcMain.handle('notes:load', async (event, title) => {
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}.md`;
            const filePath = path.join(this.notesPath, fileName);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                return { success: true, content };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
    }

    toggle() {
        if (this.notesWindow) {
            this.notesWindow.close();
            this.notesWindow = null;
            return;
        }

        this.notesWindow = new BrowserWindow({
            width: 400,
            height: this.mainWindow.getBounds().height,
            x: this.mainWindow.getBounds().x - 400,
            y: this.mainWindow.getBounds().y,
            frame: false,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, '..', 'renderer', 'preload.js')
            }
        });

        this.notesWindow.loadFile(path.join(__dirname, '..', 'renderer', 'notes.html'));
    }
}

module.exports = NotesManager;