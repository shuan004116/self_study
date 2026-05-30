import { useState } from 'react'
import { Session } from '@/types/timer.types'
import { getHabitStats } from '@/lib/stats'
import HabitCalendar from '../charts/HabitCalendar'
import LineChart from '../charts/LineChart'

interface HabitPanelProps {
  sessions: Session[]
}

export default function HabitPanel({ sessions }: HabitPanelProps) {
  const habitStats = getHabitStats(sessions)
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())

  const completedDays = new Set(habitStats.dailyData.filter((d) => d.completed).map((d) => d.date))

  const trendData = habitStats.dailyData.slice(-30).map((d) => ({
    label: d.date.slice(5),
    value: d.minutes
  }))

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{habitStats.totalSessions}</div>
          <div className="text-xs text-ff-muted mt-1">总打卡次数</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent-secondary font-mono">{habitStats.completionRate}%</div>
          <div className="text-xs text-ff-muted mt-1">完成率</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-success font-mono">{habitStats.currentStreak}</div>
          <div className="text-xs text-ff-muted mt-1">当前连签</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{habitStats.longestStreak}</div>
          <div className="text-xs text-ff-muted mt-1">最长连签</div>
        </div>
      </div>

      {/* Habit calendar */}
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-ff-text">打卡日历</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) } else setCalMonth((m) => m - 1) }}
              className="text-ff-muted hover:text-ff-text text-sm"
            >
              ◀
            </button>
            <span className="text-sm text-ff-text">{calYear}年{calMonth + 1}月</span>
            <button
              onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) } else setCalMonth((m) => m + 1) }}
              className="text-ff-muted hover:text-ff-text text-sm"
            >
              ▶
            </button>
          </div>
        </div>
        <HabitCalendar year={calYear} month={calMonth} completedDays={completedDays} />
      </div>

      {/* Trend */}
      {trendData.length > 0 && (
        <div className="bg-ff-surface rounded-card border border-ff-border p-6">
          <h3 className="text-sm font-medium text-ff-text mb-4">习惯时长趋势</h3>
          <LineChart data={trendData} height={180} color="var(--accent-secondary)" />
        </div>
      )}
    </div>
  )
}
