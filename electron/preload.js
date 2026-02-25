const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  getCurrentWindow: () => ipcRenderer.invoke('get-current-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Require modules (replaces remote.require)
  requireModule: (moduleName) => ipcRenderer.invoke('require-module', moduleName),

  // Platform info
  platform: process.platform
})
