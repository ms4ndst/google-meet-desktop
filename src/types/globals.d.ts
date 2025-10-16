import { BrowserWindow, BrowserView } from 'electron';

declare global {
    namespace NodeJS {
        interface Global {
            mainWindow: BrowserWindow;
            googleMeetView: BrowserView;
        }
    }
}

export { };