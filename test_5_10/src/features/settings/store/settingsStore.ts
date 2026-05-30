import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, GeneralSettings, ThemeSettings, MusicSettings, DataSettings } from '@/types/settings.types'
import { TimerSettings } from '@/types/timer.types'
import { DEFAULT_TIMER_SETTINGS } from '@/lib/constants'

interface SettingsState {
  settings: AppSettings
  updateGeneral: (partial: Partial<GeneralSettings>) => void
  updateTimer: (partial: Partial<TimerSettings>) => void
  updateTheme: (partial: Partial<ThemeSettings>) => void
  updateMusic: (partial: Partial<MusicSettings>) => void
  updateData: (partial: Partial<DataSettings>) => void
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    autoStart: false,
    minimizeToTray: true,
    language: 'zh',
    notifications: { system: true, sound: true, flash: true }
  },
  timer: DEFAULT_TIMER_SETTINGS,
  music: {
    defaultSource: 'mock',
    defaultPlaylist: 'focus',
    autoPlayOnFocus: true,
    whiteNoiseDefault: false,
    whiteNoiseRatio: 0.3
  },
  theme: {
    mode: 'light',
    accentColor: '#E07A5F',
    fontSize: 14,
    layoutMode: 'standard',
    timerStyle: 'ring',
    themePreset: 'warm'
  },
  data: {
    storagePath: '',
    autoBackup: false,
    backupFrequency: 'weekly'
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateGeneral: (partial) =>
        set((state) => ({
          settings: { ...state.settings, general: { ...state.settings.general, ...partial } }
        })),

      updateTimer: (partial) =>
        set((state) => ({
          settings: { ...state.settings, timer: { ...state.settings.timer, ...partial } }
        })),

      updateTheme: (partial) =>
        set((state) => ({
          settings: { ...state.settings, theme: { ...state.settings.theme, ...partial } }
        })),

      updateMusic: (partial) =>
        set((state) => ({
          settings: { ...state.settings, music: { ...state.settings.music, ...partial } }
        })),

      updateData: (partial) =>
        set((state) => ({
          settings: { ...state.settings, data: { ...state.settings.data, ...partial } }
        }))
    }),
    { name: 'focusflow-settings' }
  )
)
