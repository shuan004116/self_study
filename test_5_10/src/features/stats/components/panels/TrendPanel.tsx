import { Session } from '@/types/timer.types'
import { StatsPeriod } from '@/types/stats.types'
import { getDailyTrend } from '@/lib/stats'
import LineChart from '../charts/LineChart'

interface TrendPanelProps {
  period: StatsPeriod
  sessions: Session[]
}

export default function TrendPanel({ period, sessions }: TrendPanelProps) {
  const days = period === 'day' ? 7 : period === 'week' ? 7 : period === 'month' ? 30 : 12
  const trendData = getDailyTrend(sessions, days)

  const totalMinutes = trendData.reduce((sum, d) => sum + d.minutes, 0)
  const maxDay = trendData.reduce((max, d) => d.minutes > max.minutes ? d : max, trendData[0])
  const activeDays = trendData.filter((d) => d.minutes > 0).length

  const periodLabel = { day: '近7天', week: '近7天', month: '近30天', year: '近12个月' }[period]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{totalMinutes}</div>
          <div className="text-xs text-ff-muted mt-1">{periodLabel}总分钟</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent-secondary font-mono">{maxDay?.minutes || 0}</div>
          <div className="text-xs text-ff-muted mt-1">单日最高(分钟)</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{activeDays}</div>
          <div className="text-xs text-ff-muted mt-1">活跃天数</div>
        </div>
      </div>

      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">
          {periodLabel}专注时长趋势
        </h3>
        <LineChart
          data={trendData.map((d) => ({ label: d.label, value: d.minutes }))}
          height={220}
        />
      </div>

      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">每日数据明细</h3>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ff-muted text-xs">
                <th className="text-left py-2">日期</th>
                <th className="text-right py-2">专注(分钟)</th>
                <th className="text-right py-2">番茄</th>
              </tr>
            </thead>
            <tbody>
              {[...trendData].reverse().map((d) => (
                <tr key={d.date} className="border-t border-ff-border">
                  <td className="py-1.5 text-ff-text">{d.date}</td>
                  <td className="py-1.5 text-right text-ff-accent font-mono">{d.minutes}</td>
                  <td className="py-1.5 text-right text-ff-muted font-mono">{d.pomodoros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
