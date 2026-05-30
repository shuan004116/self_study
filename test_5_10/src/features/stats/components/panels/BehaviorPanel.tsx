import { Session } from '@/types/timer.types'
import { getBehaviorStats } from '@/lib/stats'
import PieChart from '../charts/PieChart'
import { PieSlice } from '@/types/stats.types'

interface BehaviorPanelProps {
  sessions: Session[]
}

const MODE_COLORS: Record<string, string> = {
  '番茄钟': '#E07A5F',
  '正向计时': '#81B29A',
  '限时任务': '#6B8DE3',
  '习惯养成': '#E8956E'
}

export default function BehaviorPanel({ sessions }: BehaviorPanelProps) {
  const behavior = getBehaviorStats(sessions)

  const pieData: PieSlice[] = behavior.byMode.map((m) => ({
    name: m.mode,
    value: m.totalMinutes,
    color: MODE_COLORS[m.mode] || '#A39E99',
    percentage: behavior.totalFocusHours > 0 ? Math.round((m.totalMinutes / (behavior.totalFocusHours * 60)) * 100) : 0
  }))

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className={`text-2xl font-bold font-mono ${behavior.completionRate >= 80 ? 'text-ff-success' : behavior.completionRate >= 50 ? 'text-ff-accent' : 'text-ff-danger'}`}>
            {behavior.completionRate}%
          </div>
          <div className="text-xs text-ff-muted mt-1">番茄完成率</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{behavior.avgSessionLength}</div>
          <div className="text-xs text-ff-muted mt-1">平均番茄(分钟)</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-danger font-mono">{behavior.abandoned}</div>
          <div className="text-xs text-ff-muted mt-1">放弃次数</div>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">行为数据</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between py-2 border-b border-ff-border">
            <span className="text-sm text-ff-text-secondary">总会话数</span>
            <span className="text-sm font-medium text-ff-text">{behavior.totalSessions}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ff-border">
            <span className="text-sm text-ff-text-secondary">完成次数</span>
            <span className="text-sm font-medium text-ff-success">{behavior.completed}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ff-border">
            <span className="text-sm text-ff-text-secondary">最长单次专注</span>
            <span className="text-sm font-medium text-ff-text">{behavior.longestFocusSession}分钟</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-ff-border">
            <span className="text-sm text-ff-text-secondary">总专注时长</span>
            <span className="text-sm font-medium text-ff-text">{behavior.totalFocusHours}小时</span>
          </div>
        </div>
      </div>

      {/* Mode distribution */}
      {pieData.length > 0 && (
        <div className="bg-ff-surface rounded-card border border-ff-border p-6">
          <h3 className="text-sm font-medium text-ff-text mb-4">模式分布</h3>
          <PieChart data={pieData} />
        </div>
      )}
    </div>
  )
}
