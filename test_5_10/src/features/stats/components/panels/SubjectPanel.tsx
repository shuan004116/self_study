import { Session } from '@/types/timer.types'
import { Task, Project } from '@/types/task.types'
import { getSubjectStats, getPieChartData } from '@/lib/stats'
import PieChart from '../charts/PieChart'

interface SubjectPanelProps {
  sessions: Session[]
  tasks: Task[]
  projects: Project[]
}

export default function SubjectPanel({ sessions, tasks, projects }: SubjectPanelProps) {
  const pieData = getPieChartData(sessions, tasks, projects)
  const subjectStats = getSubjectStats(sessions, tasks, projects)

  return (
    <div className="space-y-6">
      {/* Pie chart */}
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">时间分配占比</h3>
        <PieChart data={pieData} />
      </div>

      {/* Subject list */}
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">分类统计</h3>
        {subjectStats.length === 0 ? (
          <div className="text-center text-ff-muted py-8 text-sm">暂无分类数据</div>
        ) : (
          <div className="space-y-4">
            {subjectStats.map((s) => (
              <div key={s.projectId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-ff-text font-medium">{s.projectName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ff-muted">
                    <span>{s.totalMinutes}分钟</span>
                    <span>🍅{s.pomodoroCount}</span>
                    <span className="font-mono">{s.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-ff-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
