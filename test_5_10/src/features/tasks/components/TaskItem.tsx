import { useState } from 'react'
import { Task } from '@/types/task.types'
import { useTaskStore } from '../store/taskStore'
import { useTimerStore } from '@/features/timer/store/timerStore'
import { PRIORITY_COLORS } from '@/lib/constants'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
}

const MODE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  pomodoro: { label: '番茄钟', icon: '🍅', color: '#E07A5F' },
  countup: { label: '正向计时', icon: '⏱', color: '#81B29A' },
  countdown: { label: '限时', icon: '⏳', color: '#6B8DE3' },
  habit: { label: '习惯', icon: '🔥', color: '#E8956E' }
}

const PROJECT_COLORS = [
  '#E07A5F', '#81B29A', '#6B8DE3', '#E8956E',
  '#9B8EC4', '#D4A574', '#7BAFDE', '#C47B8E'
]

export default function TaskItem({ task, onEdit }: TaskItemProps) {
  const { updateTask, deleteTask, projects } = useTaskStore()
  const timerStatus = useTimerStore((s) => s.status)
  const [showProgressInput, setShowProgressInput] = useState(false)
  const [progressInput, setProgressInput] = useState(0)

  const project = projects.find((p) => p.id === task.projectId)
  const projectColor = project
    ? PROJECT_COLORS[projects.indexOf(project) % PROJECT_COLORS.length]
    : null

  const cycleStatus = () => {
    const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo'
    updateTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'done' ? new Date().toISOString() : null
    })
  }

  const startFocus = () => {
    if (timerStatus !== 'idle') return
    const config = task.timerConfig
    if (!config) {
      useTimerStore.getState().start(task.id)
    } else if (config.mode === 'countup') {
      useTimerStore.getState().startCountUp(task.id)
    } else if (config.mode === 'countdown') {
      useTimerStore.getState().startCountdown(task.id, config.focusDuration ?? 45)
    } else if (config.mode === 'habit') {
      useTimerStore.getState().startHabit(task.id, {
        targetMinutes: config.habitTargetMinutes ?? 25,
        intervals: [5, 10, 15, 20]
      })
    } else {
      useTimerStore.getState().start(task.id)
    }
  }

  const handleProgressSubmit = () => {
    if (task.goalProgress && progressInput > 0) {
      const newCompleted = Math.min(task.goalProgress.completed + progressInput, task.goalProgress.target)
      updateTask(task.id, {
        goalProgress: { ...task.goalProgress, completed: newCompleted }
      })
    }
    setShowProgressInput(false)
    setProgressInput(0)
  }

  const goalPercent = task.goalProgress
    ? Math.round((task.goalProgress.completed / task.goalProgress.target) * 100)
    : null

  const modeInfo = task.timerConfig ? MODE_LABELS[task.timerConfig.mode] : null

  return (
    <div
      className={`relative rounded-card px-4 py-3 flex items-center gap-3 border border-ff-border hover:border-ff-accent/30 transition-fast overflow-hidden ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: projectColor || PRIORITY_COLORS[task.priority]
      }}
    >
      {/* Project color background accent */}
      {projectColor && task.status !== 'done' && (
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundColor: projectColor }}
        />
      )}

      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={cycleStatus}
        className="w-4 h-4 rounded border-ff-border text-ff-accent focus:ring-ff-accent cursor-pointer relative z-10"
      />

      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5">
          {/* Mode label */}
          {modeInfo && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: modeInfo.color }}
              title={`${modeInfo.label} 模式`}
            >
              <span>{modeInfo.icon}</span>
              {modeInfo.label}
            </span>
          )}
          {/* Project label */}
          {project && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: projectColor + '20', color: projectColor }}
            >
              {project.name}
            </span>
          )}
          <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-ff-muted' : 'text-ff-text'}`}>
            {task.title}
          </div>
        </div>
        {task.description && (
          <div className="text-xs text-ff-muted mt-0.5 truncate">{task.description}</div>
        )}
        <div className="flex items-center gap-3 mt-1">
          {task.dueDate && (
            <span className="text-xs text-ff-muted">截止: {task.dueDate}</span>
          )}
          {goalPercent !== null && task.goalProgress && (
            <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
              <div className="flex-1 h-1.5 bg-ff-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-ff-accent rounded-full transition-all"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-ff-muted whitespace-nowrap">{goalPercent}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-ff-muted relative z-10">
        {task.estimatedPomodoros > 0 && (
          <span>🍅 {task.actualPomodoros}/{task.estimatedPomodoros}</span>
        )}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] + '18', color: PRIORITY_COLORS[task.priority] }}
        >
          {task.priority}
        </span>
      </div>

      {task.status !== 'done' && timerStatus === 'idle' && (
        <button
          onClick={startFocus}
          className="text-ff-accent hover:text-ff-accent/80 transition-fast relative z-10"
          title="开始专注"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M4 2l8 5-8 5V2z"/></svg>
        </button>
      )}
      {task.goalProgress && task.status !== 'done' && (
        <button
          onClick={() => setShowProgressInput(!showProgressInput)}
          className="text-ff-muted hover:text-ff-accent transition-fast relative z-10"
          title="记录进度"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v12M1 7h12"/></svg>
        </button>
      )}
      <button
        onClick={() => onEdit(task)}
        className="text-ff-muted hover:text-ff-text transition-fast relative z-10"
        title="编辑"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.5 1.5l2 2-8 8H2.5v-2l8-8z"/></svg>
      </button>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-ff-muted hover:text-ff-danger transition-fast relative z-10"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4"/></svg>
      </button>

      {showProgressInput && (
        <div className="absolute right-4 top-full mt-1 bg-ff-surface border border-ff-border rounded-card p-3 shadow-lg z-10">
          <div className="text-xs text-ff-muted mb-2">记录本次完成</div>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={progressInput}
              onChange={(e) => setProgressInput(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-ff-bg border border-ff-border rounded text-sm text-ff-text text-center"
              autoFocus
            />
            <button
              onClick={handleProgressSubmit}
              className="px-2 py-1 bg-ff-accent text-white rounded text-xs"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
