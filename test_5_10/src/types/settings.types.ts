export interface AppSettings {
  general: GeneralSettings
  timer: import('./timer.types').TimerSettings
  music: MusicSettings
  theme: ThemeSettings
  data: DataSettings
}

export interface GeneralSettings {
  autoStart: boolean
  minimizeToTray: boolean
  language: 'zh' | 'en'
  notifications: {
    system: boolean
    sound: boolean
    flash: boolean
  }
}

export interface MusicSettings {
  defaultSource: string
  defaultPlaylist: string
  autoPlayOnFocus: boolean
  whiteNoiseDefault: boolean
  whiteNoiseRatio: number
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  accentColor: string
  fontSize: number
  layoutMode: 'standard' | 'compact' | 'loose'
  timerStyle: 'digital' | 'ring' | 'bar'
  themePreset: 'warm' | 'ocean' | 'forest' | 'sakura'
}

export interface DataSettings {
  storagePath: string
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}
