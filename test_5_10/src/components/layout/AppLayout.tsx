import { useState } from 'react'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import MainArea from './MainArea'
import RightPanel from './RightPanel'
import HelpPanel from '@/features/help/components/HelpPanel'
import { useTimerStore } from '@/features/timer/store/timerStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

export default function AppLayout() {
  const [activeView, setActiveView] = useState('timer')
  const [showHelp, setShowHelp] = useState(false)
  const sessionHistory = useTimerStore((s) => s.sessionHistory)
  const dailyGoal = useSettingsStore((s) => s.settings.timer.dailyGoal)

  const today = new Date().toISOString().slice(0, 10)
  const todaySessions = sessionHistory.filter(
    (s) => s.completed && s.startTime.slice(0, 10) === today
  )

  const streakDays = (() => {
    const days = new Set<string>()
    for (const s of sessionHistory) {
      if (s.completed) days.add(s.startTime.slice(0, 10))
    }
    let streak = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().slice(0, 10)
      if (days.has(key)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  })()

  const viewLabels: Record<string, string> = {
    timer: '番茄钟',
    tasks: '任务',
    notes: '笔记',
    stats: '统计',
    settings: '设置'
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} onHelp={() => setShowHelp(true)} />
        <MainArea activeView={activeView} />
        <RightPanel />
      </div>
      <div className="h-7 bg-ff-bg-secondary border-t border-ff-border flex items-center px-4 text-xs text-ff-muted gap-4">
        <span>当前模式: {viewLabels[activeView] ?? activeView}</span>
        <span>今日番茄: {todaySessions.length}/{dailyGoal}</span>
        <span>连续打卡: {streakDays}天</span>
      </div>
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  )
}
