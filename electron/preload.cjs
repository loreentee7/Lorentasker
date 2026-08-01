const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('lorentasker', {
  checkUpdates: () => ipcRenderer.invoke('updates:check'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  showNotification: (payload) => ipcRenderer.invoke('notification:show', payload),
  pickAvatar: () => ipcRenderer.invoke('profile:pick-avatar'),
  exportData: (payload) => ipcRenderer.invoke('data:export', payload),
  importData: () => ipcRenderer.invoke('data:import'),
  onUpdateStatus: (callback) => ipcRenderer.on('updates:status', (_, payload) => callback(payload)),
  platform: process.platform
});
