import { useTaskStore } from '../store/taskStore'

export default function TodayFocus() {
  const { tasks, toggleTodayFocus } = useTaskStore()
  const todayTasks = tasks.filter((t) => t.isTodayFocus)

  return (
    <div className="bg-ff-surface rounded-panel border border-ff-border p-4 mb-6">
      <h3 className="text-sm font-medium text-ff-text mb-3">今日聚焦</h3>
      {todayTasks.length === 0 ? (
        <div className="text-xs text-ff-muted">从任务列表中选择今日聚焦项</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {todayTasks.map((task) => (
            <span
              key={task.id}
              onClick={() => toggleTodayFocus(task.id)}
              className="px-3 py-1.5 bg-ff-accent/10 text-ff-accent rounded-card text-xs font-medium cursor-pointer hover:bg-ff-accent/20 transition-fast"
            >
              {task.title}
              <span className="ml-1.5 text-ff-muted">×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
