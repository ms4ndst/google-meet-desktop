const { desktopCapturer } = require('electron');
const { log } = require('./errorHandling');

class ScreenShareManager {
    constructor() {
        this.activeStreams = new Map();
        this.canvasWindows = new Map();
    }

    // Clean up resources when screen sharing stops
    cleanup(sourceId) {
        if (this.activeStreams.has(sourceId)) {
            const stream = this.activeStreams.get(sourceId);
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                    track.dispatchEvent(new Event('ended'));
                });
            }
            this.activeStreams.delete(sourceId);
            log.info(`Cleaned up stream for source: ${sourceId}`);

            // Force garbage collection for large objects
            if (global.gc) {
                global.gc();
            }
        } if (this.canvasWindows.has(sourceId)) {
            const window = this.canvasWindows.get(sourceId);
            if (!window.isDestroyed()) {
                window.close();
            }
            this.canvasWindows.delete(sourceId);
            log.info(`Cleaned up canvas window for source: ${sourceId}`);
        }
    }

    // Manage screen capture sources
    async getSources() {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['window', 'screen'],
                thumbnailSize: { width: 200, height: 110 }
            });
            return sources;
        } catch (error) {
            log.error('Error getting screen sources:', error);
            throw error;
        }
    }

    // Start screen sharing
    async startSharing(sourceId, window) {
        try {
            this.cleanup(sourceId); // Clean up any existing sharing

            // Store references for cleanup
            this.canvasWindows.set(sourceId, window);

            log.info(`Started screen sharing for source: ${sourceId}`);
            return true;
        } catch (error) {
            log.error('Error starting screen share:', error);
            this.cleanup(sourceId);
            throw error;
        }
    }

    // Stop screen sharing
    stopSharing(sourceId) {
        try {
            this.cleanup(sourceId);
            log.info(`Stopped screen sharing for source: ${sourceId}`);
        } catch (error) {
            log.error('Error stopping screen share:', error);
            throw error;
        }
    }

    // Clean up all resources
    dispose() {
        for (const sourceId of this.activeStreams.keys()) {
            this.cleanup(sourceId);
        }
        log.info('Screen share manager disposed');
    }
}

module.exports = new ScreenShareManager();