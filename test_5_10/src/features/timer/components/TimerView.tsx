import { useState } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useTaskStore } from '@/features/tasks/store/taskStore'
import PomodoroClock from './PomodoroClock'
import TimerControls from './TimerControls'
import SessionHistory from './SessionHistory'
import BreakScreen from './BreakScreen'

export default function TimerView() {
  const { status, currentTaskId: activeTaskId } = useTimerStore()
  const { tasks, createTask } = useTaskStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showTaskInput, setShowTaskInput] = useState(false)

  const todoTasks = tasks.filter((t) => t.status !== 'done')
  const activeTask = tasks.find((t) => t.id === activeTaskId)

  const handleQuickCreate = () => {
    if (!newTaskTitle.trim()) return
    createTask({ title: newTaskTitle.trim(), priority: 'P2' })
    setNewTaskTitle('')
    setShowTaskInput(false)
  }

  if (status === 'shortBreak' || status === 'longBreak') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-8">
        <BreakScreen />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <PomodoroClock />

      {/* Active task indicator */}
      {activeTask && status !== 'idle' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-ff-accent/10 rounded-card">
          <span className="text-xs text-ff-accent font-medium">当前任务:</span>
          <span className="text-sm text-ff-text">{activeTask.title}</span>
        </div>
      )}

      <TimerControls />

      {/* Task selector - only show when idle */}
      {status === 'idle' && (
        <div className="w-full max-w-md">
          {todoTasks.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-ff-muted mb-2">选择任务开始专注</div>
              <div className="space-y-1 max-h-32 overflow-auto">
                {todoTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-card text-sm cursor-pointer transition-fast ${
                      activeTaskId === task.id
                        ? 'bg-ff-accent/10 border border-ff-accent/30'
                        : 'bg-ff-surface border border-ff-border hover:border-ff-accent/30'
                    }`}
                    onClick={() => useTimerStore.setState({ currentTaskId: task.id })}
                  >
                    <span className="text-ff-text truncate">{task.title}</span>
                    <span className="text-[10px] text-ff-muted ml-2 whitespace-nowrap">🍅{task.actualPomodoros}/{task.estimatedPomodoros}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick create */}
          {!showTaskInput ? (
            <button
              onClick={() => setShowTaskInput(true)}
              className="w-full py-2 border border-dashed border-ff-border rounded-card text-sm text-ff-muted hover:border-ff-accent hover:text-ff-accent transition-fast"
            >
              + 快速创建待办
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCreate()}
                placeholder="输入任务名称..."
                className="flex-1 px-3 py-2 bg-ff-surface border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleQuickCreate}
                className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast"
              >
                创建
              </button>
              <button
                onClick={() => { setShowTaskInput(false); setNewTaskTitle('') }}
                className="px-3 py-2 text-ff-muted hover:text-ff-text transition-fast"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'idle' && <SessionHistory />}
    </div>
  )
}
