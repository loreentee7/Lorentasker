const { app, BrowserWindow, ipcMain, shell, Notification, dialog, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');

let mainWindow;
function sendUpdate(payload) { mainWindow?.webContents.send('updates:status', payload); }

function configureUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.logger = console;
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    autoUpdater.setFeedURL({ provider: 'github', owner: 'loreentee7', repo: 'Lorentasker', private: true, token });
  }
  autoUpdater.on('checking-for-update', () => sendUpdate({ state: 'checking', message: 'Buscando actualizaciones…' }));
  autoUpdater.on('update-available', i => sendUpdate({ state: 'downloading', message: `Descargando Lorentasker ${i.version}…` }));
  autoUpdater.on('update-not-available', () => sendUpdate({ state: 'current', message: 'Ya tienes la última versión.' }));
  autoUpdater.on('download-progress', p => sendUpdate({ state: 'downloading', progress: Math.round(p.percent), message: `Descargando actualización · ${Math.round(p.percent)}%` }));
  autoUpdater.on('update-downloaded', i => sendUpdate({ state: 'ready', message: `La versión ${i.version} está lista para instalar.` }));
  autoUpdater.on('error', e => sendUpdate({ state: 'error', message: `No se pudo actualizar: ${e.message}` }));
}

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1500, height: 940, minWidth: 1100, minHeight: 720, ...(process.platform === 'win32' ? { frame: false } : { titleBarStyle: 'hiddenInset' }), backgroundColor: '#0b0d12', icon: path.join(__dirname, '../build/icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } });
  const sendWindowState = () => mainWindow?.webContents.send('window:maximized', mainWindow.isMaximized());
  mainWindow.on('maximize', sendWindowState);
  mainWindow.on('unmaximize', sendWindowState);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  if (!app.isPackaged) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => { createWindow(); configureUpdater(); app.on('activate', () => BrowserWindow.getAllWindows().length || createWindow()); });
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
ipcMain.handle('updates:check', async () => {
  if (!app.isPackaged) { sendUpdate({ state: 'dev', message: 'Las actualizaciones se comprueban en la app instalada.' }); return; }
  try { await autoUpdater.checkForUpdates(); } catch (e) { sendUpdate({ state: 'error', message: `No se pudo comprobar: ${e.message}` }); }
});
ipcMain.handle('updates:install', () => autoUpdater.quitAndInstall(false, true));
ipcMain.handle('window:minimize', event => BrowserWindow.fromWebContents(event.sender)?.minimize());
ipcMain.handle('window:toggle-maximize', event => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return false;
  window.isMaximized() ? window.unmaximize() : window.maximize();
  return window.isMaximized();
});
ipcMain.handle('window:close', event => BrowserWindow.fromWebContents(event.sender)?.close());
ipcMain.handle('window:is-maximized', event => BrowserWindow.fromWebContents(event.sender)?.isMaximized() || false);
ipcMain.handle('notification:show', (_, payload) => {
  if (!Notification.isSupported()) return false;
  new Notification({ title: payload?.title || 'Lorentasker', body: payload?.body || '', icon: path.join(__dirname, '../build/icon.png') }).show();
  return true;
});
ipcMain.handle('profile:pick-avatar', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { title: 'Elegir foto de perfil', properties: ['openFile'], filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  const file = result.filePaths[0];
  const image = nativeImage.createFromPath(file);
  if (image.isEmpty()) return null;
  const resized = image.resize({ width: 512, height: 512, quality: 'best' });
  return `data:image/jpeg;base64,${resized.toJPEG(88).toString('base64')}`;
});
ipcMain.handle('data:export', async (_, payload) => {
  const result = await dialog.showSaveDialog(mainWindow, { title: 'Exportar Lorentasker', defaultPath: `lorentasker-backup-${new Date().toISOString().slice(0, 10)}.json`, filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, JSON.stringify(payload, null, 2), 'utf8');
  return result.filePath;
});
ipcMain.handle('data:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { title: 'Importar copia de Lorentasker', properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  return JSON.parse(await fs.readFile(result.filePaths[0], 'utf8'));
});
