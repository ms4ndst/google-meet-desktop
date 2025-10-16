const { app, dialog } = require('electron');
const log = require('electron-log');

// Configure electron-log
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    dialog.showErrorBox('Error', 'An unexpected error occurred. The application will try to continue running.');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    log.error('Unhandled Rejection:', error);
});

// Log app events
app.on('ready', () => {
    log.info('Application is ready');
});

app.on('window-all-closed', () => {
    log.info('All windows closed');
});

app.on('will-quit', () => {
    log.info('Application will quit');
});

module.exports = {
    log
};