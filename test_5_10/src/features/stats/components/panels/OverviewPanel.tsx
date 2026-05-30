import { Session } from '@/types/timer.types'
import { Task, Project } from '@/types/task.types'
import { StatsPeriod } from '@/types/stats.types'
import { getDailyStats, getWeeklyStats, getMonthlyStats, getYearlyStats } from '@/lib/stats'
import BarChart from '../charts/BarChart'
import HeatMap from '../charts/HeatMap'
import CalendarGrid from '../charts/CalendarGrid'

interface OverviewPanelProps {
  period: StatsPeriod
  sessions: Session[]
  tasks: Task[]
  projects: Project[]
  today: string
  year: number
  month: number
}

const MODE_COLORS: Record<string, string> = {
  '番茄钟': '#E07A5F',
  '正向计时': '#81B29A',
  '限时任务': '#6B8DE3',
  '习惯养成': '#E8956E'
}

export default function OverviewPanel({ period, sessions, tasks, today, year, month }: OverviewPanelProps) {
  const daily = getDailyStats(sessions, today, tasks)
  const weekly = getWeeklyStats(sessions)
  const monthly = getMonthlyStats(sessions, year, month)
  const yearly = getYearlyStats(sessions, year)

  // Mode distribution for day view
  const daySessions = sessions.filter((s) => s.startTime.slice(0, 10) === today)
  const modeLabels: Record<string, string> = { pomodoro: '番茄钟', countup: '正向计时', countdown: '限时任务', habit: '习惯养成' }
  const modeMinutes = new Map<string, number>()
  for (const s of daySessions) {
    const label = modeLabels[s.mode] || s.mode
    modeMinutes.set(label, (modeMinutes.get(label) || 0) + Math.round(s.duration / 60))
  }
  const modeData = [...modeMinutes.entries()].map(([label, value]) => ({
    label, value, color: MODE_COLORS[label] || '#A39E99'
  }))

  if (period === 'day') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card value={daily.focusMinutes} label="专注分钟" color="text-ff-accent" />
          <Card value={daily.pomodoroCount} label="完成番茄" color="text-ff-accent-secondary" />
          <Card value={daily.completedTasks} label="完成任务" color="text-ff-accent" />
          <Card value={daily.abandonedCount} label="放弃次数" color="text-ff-danger" />
        </div>
        {modeData.length > 0 && (
          <div className="bg-ff-surface rounded-card border border-ff-border p-6">
            <h3 className="text-sm font-medium text-ff-text mb-4">今日模式分布</h3>
            <BarChart data={modeData} height={120} />
          </div>
        )}
        <SessionList sessions={daySessions} />
      </div>
    )
  }

  if (period === 'week') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card value={weekly.totalMinutes} label="本周分钟" color="text-ff-accent" />
          <Card value={weekly.totalPomodoros} label="本周番茄" color="text-ff-accent-secondary" />
          <Card value={weekly.avgMinutes} label="日均分钟" color="text-ff-accent" />
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-6">
          <h3 className="text-sm font-medium text-ff-text mb-4">近7天专注趋势</h3>
          <BarChart data={weekly.days.map((d) => ({ label: `周${d.label}`, value: d.minutes }))} height={160} />
        </div>
      </div>
    )
  }

  if (period === 'month') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card value={monthly.totalMinutes} label="月度分钟" color="text-ff-accent" />
          <Card value={monthly.totalPomodoros} label="月度番茄" color="text-ff-accent-secondary" />
          <Card value={monthly.activeDays} label="活跃天数" color="text-ff-accent" />
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-6">
          <h3 className="text-sm font-medium text-ff-text mb-4">月度热力图</h3>
          <HeatMap data={monthly.heatmap} totalMinutes={monthly.totalMinutes} activeDays={monthly.activeDays} />
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-6">
          <h3 className="text-sm font-medium text-ff-text mb-4">日历视图</h3>
          <CalendarGrid year={year} month={month} sessions={sessions} today={today} />
        </div>
      </div>
    )
  }

  // Year view
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card value={yearly.totalMinutes} label="年度分钟" color="text-ff-accent" />
        <Card value={yearly.totalPomodoros} label="年度番茄" color="text-ff-accent-secondary" />
        <Card value={yearly.activeDays} label="活跃天数" color="text-ff-accent" />
        <Card value={yearly.monthlyAvg} label="月均分钟" color="text-ff-accent" />
      </div>
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">月度趋势</h3>
        <BarChart
          data={yearly.months.map((m) => ({
            label: `${m.month + 1}月`,
            value: m.minutes
          }))}
          height={180}
        />
      </div>
    </div>
  )
}

function Card({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
      <div className={`text-3xl font-bold ${color} font-mono`}>{value}</div>
      <div className="text-xs text-ff-muted mt-1">{label}</div>
    </div>
  )
}

function SessionList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return <div className="text-center text-ff-muted py-8 text-sm">暂无记录</div>
  }
  const modeNames: Record<string, string> = { pomodoro: '番茄钟', countup: '正向计时', countdown: '倒计时', habit: '习惯养成' }
  return (
    <div className="bg-ff-surface rounded-card border border-ff-border p-6">
      <h3 className="text-sm font-medium text-ff-text mb-4">专注记录</h3>
      <div className="space-y-2">
        {[...sessions].reverse().slice(0, 20).map((session) => (
          <div key={session.id} className="flex items-center justify-between py-2 border-b border-ff-border last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${session.completed ? 'bg-ff-success' : 'bg-ff-danger'}`} />
              <span className="text-sm text-ff-text">
                {session.completed ? '完成' : '中断'} · {Math.round(session.duration / 60)}分钟 · {modeNames[session.mode] ?? session.mode}
              </span>
            </div>
            <span className="text-xs text-ff-muted">
              {new Date(session.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
