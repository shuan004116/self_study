interface GoalProgressBarProps {
  title: string
  completed: number
  target: number
  unit: string
  percent: number
  deadline: string | null
  dailySpeed: number
  estimatedDays: number
}

export default function GoalProgressBar({ title, completed, target, unit, percent, deadline, dailySpeed, estimatedDays }: GoalProgressBarProps) {
  const isOverdue = deadline && new Date(deadline) < new Date() && percent < 100

  return (
    <div className="bg-ff-bg rounded-card p-4 border border-ff-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ff-text truncate">{title}</span>
        <span className="text-xs text-ff-muted">{completed}/{target} {unit}</span>
      </div>
      <div className="w-full h-2.5 bg-ff-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: isOverdue ? 'var(--ff-danger)' : percent >= 100 ? 'var(--ff-success)' : 'var(--accent-primary)'
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${isOverdue ? 'text-ff-danger' : 'text-ff-text-secondary'}`}>
          {percent}%
        </span>
        <div className="flex gap-3 text-ff-muted">
          {dailySpeed > 0 && <span>日均 {dailySpeed} {unit}</span>}
          {estimatedDays > 0 && estimatedDays < 9999 && <span>还需 {estimatedDays} 天</span>}
          {deadline && (
            <span className={isOverdue ? 'text-ff-danger' : ''}>
              截止 {deadline}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
