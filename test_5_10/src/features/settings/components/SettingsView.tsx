import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useTimerStore } from '@/features/timer/store/timerStore'
import { useTaskStore } from '@/features/tasks/store/taskStore'
import { useNoteStore } from '@/features/notes/store/noteStore'
import { useReviewStore } from '@/features/review/store/reviewStore'

type SettingsTab = 'general' | 'timer' | 'theme' | 'music' | 'data'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full cursor-pointer transition-fast relative ${checked ? 'bg-ff-accent' : 'bg-ff-border'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-fast ${checked ? 'ml-5' : 'ml-0.5'}`} />
    </button>
  )
}

function NumberInput({ value, onChange, min = 1, max = 120 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseInt(e.target.value)
        if (!isNaN(v) && v >= min && v <= max) onChange(v)
      }}
      className="w-20 px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text text-center"
    />
  )
}

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const { settings, updateGeneral, updateTimer, updateTheme, updateMusic, updateData } = useSettingsStore()
  const syncFromSettings = useTimerStore((s) => s.syncFromSettings)

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: '通用' },
    { id: 'timer', label: '番茄钟' },
    { id: 'theme', label: '外观' },
    { id: 'music', label: '音乐' },
    { id: 'data', label: '数据' }
  ]

  const handleTimerChange = (partial: Partial<typeof settings.timer>) => {
    updateTimer(partial)
    syncFromSettings(partial)
  }

  const handleExportAll = () => {
    const data = {
      tasks: useTaskStore.getState().tasks,
      notes: useNoteStore.getState().notes,
      sessions: useTimerStore.getState().sessionHistory,
      reviewSchedules: useReviewStore.getState().schedules,
      settings: settings,
      exportTime: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-ff-text mb-6">设置</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-card text-sm font-medium transition-fast ${
              activeTab === tab.id
                ? 'bg-ff-accent text-white'
                : 'bg-ff-surface text-ff-text-secondary hover:bg-ff-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-ff-surface rounded-panel border border-ff-border p-6 flex-1">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-ff-text">通用设置</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">最小化到托盘</span>
              <Toggle checked={settings.general.minimizeToTray} onChange={(v) => updateGeneral({ minimizeToTray: v })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">系统通知</span>
              <Toggle checked={settings.general.notifications.system} onChange={(v) => updateGeneral({ notifications: { ...settings.general.notifications, system: v } })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">提示音</span>
              <Toggle checked={settings.general.notifications.sound} onChange={(v) => updateGeneral({ notifications: { ...settings.general.notifications, sound: v } })} />
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-ff-text">番茄钟设置</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">专注时长（分钟）</span>
              <NumberInput value={settings.timer.focusDuration} onChange={(v) => handleTimerChange({ focusDuration: v })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">短休息（分钟）</span>
              <NumberInput value={settings.timer.shortBreakDuration} onChange={(v) => handleTimerChange({ shortBreakDuration: v })} min={1} max={30} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">长休息（分钟）</span>
              <NumberInput value={settings.timer.longBreakDuration} onChange={(v) => handleTimerChange({ longBreakDuration: v })} min={1} max={60} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">长休息间隔（个番茄）</span>
              <NumberInput value={settings.timer.longBreakInterval} onChange={(v) => handleTimerChange({ longBreakInterval: v })} min={2} max={10} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">每日目标（个番茄）</span>
              <NumberInput value={settings.timer.dailyGoal} onChange={(v) => handleTimerChange({ dailyGoal: v })} min={1} max={50} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">自动开始下一个</span>
              <Toggle checked={settings.timer.autoStartNext} onChange={(v) => handleTimerChange({ autoStartNext: v })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">休息引导</span>
              <Toggle checked={settings.timer.breakGuidance} onChange={(v) => handleTimerChange({ breakGuidance: v })} />
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-ff-text">外观设置</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">主题模式</span>
              <select
                value={settings.theme.mode}
                onChange={(e) => updateTheme({ mode: e.target.value as 'light' | 'dark' | 'system' })}
                className="px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">主题配色</span>
              <div className="flex gap-2">
                {[
                  { id: 'warm' as const, label: '暖阳', colors: ['#E07A5F', '#E8956E', '#F0C4A8'] },
                  { id: 'ocean' as const, label: '海洋', colors: ['#4A90D9', '#5BA0E0', '#7BB8F0'] },
                  { id: 'forest' as const, label: '森林', colors: ['#5A9E6F', '#81B29A', '#A8D5BA'] },
                  { id: 'sakura' as const, label: '樱花', colors: ['#D4708F', '#E8A0B8', '#F0C4D4'] }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      updateTheme({ themePreset: preset.id, accentColor: preset.colors[0] })
                    }}
                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg border transition-fast ${
                      settings.theme.themePreset === preset.id
                        ? 'border-ff-accent bg-ff-accent/5'
                        : 'border-ff-border hover:border-ff-accent/50'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      {preset.colors.map((c) => (
                        <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-ff-muted">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">强调色</span>
              <div className="flex gap-2">
                {['#E07A5F', '#81B29A', '#6B8DE3', '#E8956E', '#9B8EC4', '#D4A574'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ accentColor: color })}
                    className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-fast ${settings.theme.accentColor === color ? 'border-ff-text scale-110' : 'border-transparent hover:border-ff-text/50'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">计时器风格</span>
              <div className="flex gap-1">
                {([
                  ['digital', '数字'],
                  ['ring', '环形'],
                  ['bar', '进度条']
                ] as const).map(([style, label]) => (
                  <button
                    key={style}
                    onClick={() => updateTheme({ timerStyle: style })}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-fast ${
                      settings.theme.timerStyle === style
                        ? 'bg-ff-accent text-white'
                        : 'bg-ff-bg text-ff-text-secondary hover:bg-ff-border'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-ff-text">音乐设置</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">专注时自动播放</span>
              <Toggle checked={settings.music.autoPlayOnFocus} onChange={(v) => updateMusic({ autoPlayOnFocus: v })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">默认开启白噪音</span>
              <Toggle checked={settings.music.whiteNoiseDefault} onChange={(v) => updateMusic({ whiteNoiseDefault: v })} />
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-ff-text">数据管理</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">自动备份</span>
              <Toggle checked={settings.data.autoBackup} onChange={(v) => updateData({ autoBackup: v })} />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-ff-text">备份频率</span>
              <select
                value={settings.data.backupFrequency}
                onChange={(e) => updateData({ backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text"
              >
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
            <div className="border-t border-ff-border pt-4 mt-4">
              <button
                onClick={handleExportAll}
                className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast"
              >
                导出全部数据 (JSON)
              </button>
              <p className="text-xs text-ff-muted mt-2">导出任务、笔记、会话记录和设置的完整备份</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
