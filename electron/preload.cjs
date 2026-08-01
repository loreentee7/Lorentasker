const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('lorentasker', {
  checkUpdates: () => ipcRenderer.invoke('updates:check'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  onUpdateStatus: (callback) => ipcRenderer.on('updates:status', (_, payload) => callback(payload)),
  platform: process.platform
});
