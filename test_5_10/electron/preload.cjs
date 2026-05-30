const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  openMusicFile: () => ipcRenderer.invoke('dialog:openFile'),
  readAudioData: (filePath) => ipcRenderer.invoke('dialog:readAudioData', filePath)
})
