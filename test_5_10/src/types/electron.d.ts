interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
  openMusicFile: () => Promise<string[]>
  readAudioData: (filePath: string) => Promise<number[]>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
