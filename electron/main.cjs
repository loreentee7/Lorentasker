const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

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
  mainWindow = new BrowserWindow({ width: 1500, height: 940, minWidth: 1100, minHeight: 720, titleBarStyle: 'hiddenInset', backgroundColor: '#0b0d12', icon: path.join(__dirname, '../build/icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  if (!app.isPackaged) mainWindow.loadURL('http://localhost:5173');
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => { createWindow(); configureUpdater(); app.on('activate', () => BrowserWindow.getAllWindows().length || createWindow()); });
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
ipcMain.handle('updates:check', async () => {
  if (!app.isPackaged) { sendUpdate({ state: 'dev', message: 'Las actualizaciones se comprueban en la app instalada.' }); return; }
  try { await autoUpdater.checkForUpdates(); } catch (e) { sendUpdate({ state: 'error', message: `No se pudo comprobar: ${e.message}` }); }
});
ipcMain.handle('updates:install', () => autoUpdater.quitAndInstall(false, true));
