const { contextBridge, ipcRenderer } = require("electron");

// Allowed channels for security
const validChannels = [
  "window.minimize",
  "window.maximize",
  "window.restore",
  "window.close",
  "window.home",
  "window.maximized",
  "window.restored",
  "toggle:pip",
  "toggle:notes",
  "window.screenshare.show",
  "window.screenshare.hide",
  "window.canvas.show",
  "window.canvas.hide",
  "window.main.focus",
  "screenshare.stop",
  "DESKTOP_CAPTURER_GET_SOURCES"
];

console.log('Preload script starting...');

// Function to test IPC
function testIPC() {
  console.log('Testing IPC communication...');
  ipcRenderer.send('window.minimize');
  console.log('Test IPC message sent');
}

// Wait a moment and test IPC
setTimeout(testIPC, 2000);

// Expose protected IPC functionality to renderer
contextBridge.exposeInMainWorld("ipc", {
  invoke: async (channel, data) => {
    console.log('IPC invoke called:', channel);
    if (validChannels.includes(channel)) {
      try {
        console.log('Invoking IPC handler:', channel);
        const result = await ipcRenderer.invoke(channel, data);
        console.log('IPC handler completed:', channel);
        return result;
      } catch (error) {
        console.error('Error in IPC invoke:', error);
        throw error;
      }
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
  send: (channel, data) => {
    console.log('IPC send called:', channel);
    if (validChannels.includes(channel)) {
      try {
        console.log('Sending IPC message:', channel);
        ipcRenderer.send(channel, data);
        console.log('IPC message sent');
      } catch (error) {
        console.error('Error in IPC send:', error);
        throw error;
      }
    } else {
      throw new Error(`Invalid channel: ${channel}`);
    }
  },
  on: (channel, callback) => {
    console.log('IPC on called:', channel);
    if (validChannels.includes(channel)) {
      try {
        // Remove any existing listeners
        ipcRenderer.removeAllListeners(channel);
        // Add new listener
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
        console.log('IPC listener registered for:', channel);
      } catch (error) {
        console.error('Error in IPC on:', error);
        throw error;
      }
    } else {
      throw new Error(`Invalid channel: ${channel}`);
    }
  },
});
