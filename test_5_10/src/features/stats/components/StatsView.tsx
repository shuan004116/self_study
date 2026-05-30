import { useState } from 'react'
import { useTimerStore } from '@/features/timer/store/timerStore'
import { useTaskStore } from '@/features/tasks/store/taskStore'
import { StatsPeriod, StatsSubTab } from '@/types/stats.types'
import { getStreakCount, getLongestStreak, getAverageSessionLength, getBehaviorStats, exportToCSV, downloadCSV, downloadJSON } from '@/lib/stats'
import OverviewPanel from './panels/OverviewPanel'
import TrendPanel from './panels/TrendPanel'
import SubjectPanel from './panels/SubjectPanel'
import HabitPanel from './panels/HabitPanel'
import GoalPanel from './panels/GoalPanel'
import BehaviorPanel from './panels/BehaviorPanel'

const PERIOD_TABS: { id: StatsPeriod; label: string }[] = [
  { id: 'day', label: '今日' },
  { id: 'week', label: '本周' },
  { id: 'month', label: '本月' },
  { id: 'year', label: '本年' }
]

const SUB_TABS: { id: StatsSubTab; label: string }[] = [
  { id: 'overview', label: '总览' },
  { id: 'trend', label: '趋势图' },
  { id: 'subject', label: '分类统计' },
  { id: 'habit', label: '习惯统计' },
  { id: 'goal', label: '目标进度' },
  { id: 'behavior', label: '行为分析' }
]

export default function StatsView() {
  const sessionHistory = useTimerStore((s) => s.sessionHistory)
  const { tasks, projects } = useTaskStore()
  const [period, setPeriod] = useState<StatsPeriod>('week')
  const [subTab, setSubTab] = useState<StatsSubTab>('overview')
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [year, setYear] = useState(() => new Date().getFullYear())

  const today = new Date().toISOString().slice(0, 10)

  // Cumulative stats
  const totalSessions = sessionHistory.filter((s) => s.completed).length
  const totalHours = Math.round(sessionHistory.reduce((sum, s) => sum + s.duration, 0) / 3600 * 10) / 10
  const activeDaysSet = new Set(sessionHistory.filter((s) => s.completed).map((s) => s.startTime.slice(0, 10)))
  const totalDays = activeDaysSet.size || 1
  const dailyAvgHours = Math.round(totalHours / totalDays * 10) / 10
  const streak = getStreakCount(sessionHistory)
  const avgLength = getAverageSessionLength(sessionHistory)
  const behavior = getBehaviorStats(sessionHistory)

  const handleExportCSV = () => {
    const csv = exportToCSV(sessionHistory)
    downloadCSV(csv, `focusflow-sessions-${today}.csv`)
  }

  const handleExportJSON = () => {
    const behaviorStats = getBehaviorStats(sessionHistory)
    const data = {
      exportTime: new Date().toISOString(),
      summary: {
        totalSessions: behaviorStats.totalSessions,
        completedSessions: behaviorStats.completed,
        totalFocusHours: behaviorStats.totalFocusHours,
        completionRate: behaviorStats.completionRate,
        currentStreak: streak,
        longestStreak: getLongestStreak(sessionHistory),
        avgSessionLength: avgLength
      },
      sessions: sessionHistory,
      tasks: tasks.map((t) => ({
        id: t.id, title: t.title, status: t.status, priority: t.priority,
        projectId: t.projectId, completedAt: t.completedAt,
        actualPomodoros: t.actualPomodoros, goalProgress: t.goalProgress
      })),
      projects: projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))
    }
    downloadJSON(data, `focusflow-stats-${today}.json`)
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ff-text">数据统计</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-ff-border text-ff-text rounded-card text-xs font-medium hover:bg-ff-muted/20 transition-fast"
          >
            导出CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-ff-border text-ff-text rounded-card text-xs font-medium hover:bg-ff-muted/20 transition-fast"
          >
            导出JSON
          </button>
        </div>
      </div>

      {/* Cumulative stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <CumCard value={`${totalHours}h`} label="累计时长" color="text-ff-accent" />
        <CumCard value={totalSessions.toString()} label="总番茄" color="text-ff-accent-secondary" />
        <CumCard value={`${dailyAvgHours}h`} label="日均时长" color="text-ff-accent" />
        <CumCard value={`${streak}天`} label="连续打卡" color="text-ff-success" />
        <CumCard value={`${behavior.completionRate}%`} label="完成率" color="text-ff-accent" />
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-ff-bg-secondary rounded-lg p-1 mb-4 w-fit">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-fast ${
              period === tab.id ? 'bg-ff-accent text-white' : 'text-ff-text-secondary hover:text-ff-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Month/Year navigation */}
        {(period === 'month' || period === 'year') && (
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={() => {
                if (period === 'month') {
                  if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1)
                } else {
                  setYear((y) => y - 1)
                }
              }}
              className="text-ff-muted hover:text-ff-text px-1"
            >
              ◀
            </button>
            <span className="text-sm text-ff-text min-w-[80px] text-center">
              {period === 'month' ? `${year}年${month + 1}月` : `${year}年`}
            </span>
            <button
              onClick={() => {
                if (period === 'month') {
                  if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1)
                } else {
                  setYear((y) => y + 1)
                }
              }}
              className="text-ff-muted hover:text-ff-text px-1"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-3 py-1.5 rounded-card text-xs font-medium transition-fast ${
              subTab === tab.id
                ? 'bg-ff-accent/10 text-ff-accent border border-ff-accent/30'
                : 'text-ff-text-secondary hover:text-ff-text border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1">
        {subTab === 'overview' && (
          <OverviewPanel
            period={period}
            sessions={sessionHistory}
            tasks={tasks}
            projects={projects}
            today={today}
            year={year}
            month={month}
          />
        )}
        {subTab === 'trend' && (
          <TrendPanel period={period} sessions={sessionHistory} />
        )}
        {subTab === 'subject' && (
          <SubjectPanel sessions={sessionHistory} tasks={tasks} projects={projects} />
        )}
        {subTab === 'habit' && (
          <HabitPanel sessions={sessionHistory} />
        )}
        {subTab === 'goal' && (
          <GoalPanel tasks={tasks} />
        )}
        {subTab === 'behavior' && (
          <BehaviorPanel sessions={sessionHistory} />
        )}
      </div>
    </div>
  )
}

function CumCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="bg-ff-surface rounded-card border border-ff-border p-3 text-center">
      <div className={`text-xl font-bold ${color} font-mono`}>{value}</div>
      <div className="text-[10px] text-ff-muted mt-0.5">{label}</div>
    </div>
  )
}
