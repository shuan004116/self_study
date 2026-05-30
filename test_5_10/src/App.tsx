import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

const THEME_PRESETS: Record<string, { light: string; dark: string }> = {
  warm: { light: '#E07A5F', dark: '#E8956E' },
  ocean: { light: '#4A90D9', dark: '#5BA0E0' },
  forest: { light: '#5A9E6F', dark: '#81B29A' },
  sakura: { light: '#D4708F', dark: '#E8A0B8' }
}

export default function App() {
  const themeMode = useSettingsStore((s) => s.settings.theme.mode)
  const accentColor = useSettingsStore((s) => s.settings.theme.accentColor)
  const timerStyle = useSettingsStore((s) => s.settings.theme.timerStyle)

  useEffect(() => {
    const root = document.documentElement
    if (themeMode === 'dark') {
      root.classList.add('dark')
    } else if (themeMode === 'light') {
      root.classList.remove('dark')
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.matches) root.classList.add('dark')
      else root.classList.remove('dark')
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark')
        else root.classList.remove('dark')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [themeMode])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-primary', accentColor)
  }, [accentColor])

  useEffect(() => {
    document.documentElement.setAttribute('data-timer-style', timerStyle)
  }, [timerStyle])

  return <AppLayout />
}
