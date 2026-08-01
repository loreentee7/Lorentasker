const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('lorentasker', {
  checkUpdates: () => ipcRenderer.invoke('updates:check'),
  installUpdate: () => ipcRenderer.invoke('updates:install'),
  showNotification: (payload) => ipcRenderer.invoke('notification:show', payload),
  pickAvatar: () => ipcRenderer.invoke('profile:pick-avatar'),
  exportData: (payload) => ipcRenderer.invoke('data:export', payload),
  importData: () => ipcRenderer.invoke('data:import'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('window:toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximized: (callback) => {
    const listener = (_, maximized) => callback(maximized);
    ipcRenderer.on('window:maximized', listener);
    return () => ipcRenderer.removeListener('window:maximized', listener);
  },
  onUpdateStatus: (callback) => ipcRenderer.on('updates:status', (_, payload) => callback(payload)),
  platform: process.platform
});
