import { Task } from '@/types/task.types'
import { getGoalStats } from '@/lib/stats'
import GoalProgressBar from '../charts/GoalProgressBar'

interface GoalPanelProps {
  tasks: Task[]
}

export default function GoalPanel({ tasks }: GoalPanelProps) {
  const goalStats = getGoalStats(tasks)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{goalStats.activeGoals}</div>
          <div className="text-xs text-ff-muted mt-1">活跃目标</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-success font-mono">{goalStats.completedGoals}</div>
          <div className="text-xs text-ff-muted mt-1">已完成</div>
        </div>
        <div className="bg-ff-surface rounded-card border border-ff-border p-4 text-center">
          <div className="text-2xl font-bold text-ff-accent font-mono">{goalStats.avgProgress}%</div>
          <div className="text-xs text-ff-muted mt-1">平均进度</div>
        </div>
      </div>

      {/* Goal list */}
      <div className="bg-ff-surface rounded-card border border-ff-border p-6">
        <h3 className="text-sm font-medium text-ff-text mb-4">目标进度</h3>
        {goalStats.details.length === 0 ? (
          <div className="text-center text-ff-muted py-8 text-sm">暂无目标数据，在任务中创建带目标进度的任务即可</div>
        ) : (
          <div className="space-y-3">
            {goalStats.details.map((g) => (
              <GoalProgressBar
                key={g.taskId}
                title={g.title}
                completed={g.completed}
                target={g.target}
                unit={g.unit}
                percent={g.percent}
                deadline={g.deadline}
                dailySpeed={g.dailySpeed}
                estimatedDays={g.estimatedDays}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
