import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { Task, TaskTimerConfig, GoalProgress } from '@/types/task.types'

interface TaskFormProps {
  onClose: () => void
  editTask?: Task | null
  simple?: boolean
}

export default function TaskForm({ onClose, editTask, simple }: TaskFormProps) {
  const { createTask, updateTask, projects, tags } = useTaskStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2')
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [timerConfig, setTimerConfig] = useState<TaskTimerConfig | null>(null)
  const [goalProgress, setGoalProgress] = useState<GoalProgress | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Simple mode state
  const [simpleMode, setSimpleMode] = useState<'pomodoro' | 'goal' | 'habit'>('pomodoro')
  const [simpleDuration, setSimpleDuration] = useState(25)

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDescription(editTask.description)
      setPriority(editTask.priority)
      setEstimatedPomodoros(editTask.estimatedPomodoros)
      setProjectId(editTask.projectId)
      setSelectedTags(editTask.tags)
      setDueDate(editTask.dueDate || '')
      setTimerConfig(editTask.timerConfig || null)
      setGoalProgress(editTask.goalProgress || null)
      // Derive simple mode from timerConfig
      if (editTask.timerConfig) {
        if (editTask.timerConfig.mode === 'countdown') setSimpleMode('pomodoro')
        else if (editTask.timerConfig.mode === 'habit') setSimpleMode('habit')
        else if (editTask.timerConfig.mode === 'countup') setSimpleMode('pomodoro')
        else setSimpleMode('pomodoro')
        if (editTask.timerConfig.focusDuration) setSimpleDuration(editTask.timerConfig.focusDuration)
      }
      if (editTask.goalProgress) {
        setSimpleMode('goal')
      }
      setShowAdvanced(true)
    }
  }, [editTask])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let finalTimerConfig = timerConfig
    let finalGoalProgress = goalProgress

    // Simple mode: build config from simple selections
    if (simple && !showAdvanced) {
      if (simpleMode === 'pomodoro') {
        finalTimerConfig = { mode: 'countdown', focusDuration: simpleDuration }
        finalGoalProgress = null
      } else if (simpleMode === 'goal') {
        finalTimerConfig = { mode: 'pomodoro' }
        finalGoalProgress = goalProgress || { target: 100, completed: 0, unit: '道', deadline: null }
      } else if (simpleMode === 'habit') {
        finalTimerConfig = { mode: 'habit', habitTargetMinutes: simpleDuration }
        finalGoalProgress = null
      }
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedPomodoros,
      projectId,
      tags: selectedTags,
      dueDate: dueDate || null,
      timerConfig: finalTimerConfig || null,
      goalProgress: finalGoalProgress || null
    }

    if (editTask) {
      updateTask(editTask.id, data)
    } else {
      createTask(data)
    }
    onClose()
  }

  // Simple one-step popup mode (like 参考图)
  if (simple && !showAdvanced && !editTask) {
    return (
      <div className="bg-ff-surface rounded-panel border border-ff-border p-6 mb-6 animate-fadeUp">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入待办名称"
              className="w-full px-3 py-2.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
              autoFocus
            />
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2">
            {([
              ['pomodoro', '普通番茄钟'],
              ['goal', '定目标'],
              ['habit', '养习惯']
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSimpleMode(mode)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-fast ${
                  simpleMode === mode
                    ? 'bg-ff-accent text-white'
                    : 'bg-ff-bg text-ff-text-secondary hover:bg-ff-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Duration presets */}
          {simpleMode !== 'goal' && (
            <div>
              <label className="block text-xs text-ff-muted mb-2">时长</label>
              <div className="flex gap-2">
                {[15, 25, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSimpleDuration(mins)}
                    className={`px-3 py-1.5 rounded-card text-xs font-medium transition-fast ${
                      simpleDuration === mins
                        ? 'bg-ff-accent text-white'
                        : 'bg-ff-bg text-ff-text-secondary hover:bg-ff-border'
                    }`}
                  >
                    {mins}分钟
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal config */}
          {simpleMode === 'goal' && (
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs text-ff-muted mb-1">目标数量</label>
                <input
                  type="number"
                  min={1}
                  value={goalProgress?.target ?? 100}
                  onChange={(e) => setGoalProgress({ target: Number(e.target.value), completed: 0, unit: goalProgress?.unit || '道', deadline: null })}
                  className="w-20 px-2 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-ff-muted mb-1">单位</label>
                <input
                  type="text"
                  value={goalProgress?.unit ?? '道'}
                  onChange={(e) => setGoalProgress({ target: goalProgress?.target ?? 100, completed: 0, unit: e.target.value, deadline: null })}
                  placeholder="道/页/章"
                  className="w-20 px-2 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text text-center"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ff-text-secondary hover:text-ff-text transition-fast">
              取消
            </button>
            <button type="submit" className="px-6 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast">
              开始专注
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Full form mode (for editing or advanced)
  return (
    <div className="bg-ff-surface rounded-panel border border-ff-border p-6 mb-6 animate-fadeUp">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ff-text mb-1">任务标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入任务标题..."
            className="w-full px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ff-text mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可选描述..."
            className="w-full px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none resize-none h-20"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-ff-text mb-1">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
            >
              <option value="P0">P0 紧急</option>
              <option value="P1">P1 重要</option>
              <option value="P2">P2 普通</option>
              <option value="P3">P3 低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ff-text mb-1">预估番茄</label>
            <input
              type="number"
              min={1}
              max={20}
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ff-text mb-1">截止日期</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ff-text mb-1">项目</label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                className="px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
              >
                <option value="">无项目</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ff-text mb-1">标签</label>
              <div className="flex gap-1 flex-wrap">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTags(
                      selectedTags.includes(tag.id)
                        ? selectedTags.filter((t) => t !== tag.id)
                        : [...selectedTags, tag.id]
                    )}
                    className={`px-2 py-0.5 rounded text-xs transition-fast ${
                      selectedTags.includes(tag.id) ? 'text-white' : 'bg-ff-bg text-ff-text-secondary'
                    }`}
                    style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timer Config */}
        <div className="p-4 bg-ff-bg rounded-card border border-ff-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ff-text">计时设置</span>
          </div>
          <div>
            <label className="block text-xs text-ff-text-secondary mb-1">计时模式</label>
            <div className="flex gap-1">
              {(['pomodoro', 'countup', 'countdown', 'habit'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimerConfig({ ...timerConfig, mode })}
                  className={`px-3 py-1 rounded-md text-xs transition-fast ${
                    (timerConfig?.mode ?? 'pomodoro') === mode ? 'bg-ff-accent text-white' : 'bg-ff-surface text-ff-text-secondary'
                  }`}
                >
                  {{ pomodoro: '番茄钟', countup: '正向计时', countdown: '限时任务', habit: '习惯养成' }[mode]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="p-4 bg-ff-bg rounded-card border border-ff-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ff-text">目标进度</span>
            <button
              type="button"
              onClick={() => setGoalProgress(goalProgress ? null : { target: 100, completed: 0, unit: '道', deadline: null })}
              className={`w-10 h-5 rounded-full cursor-pointer transition-fast relative ${goalProgress ? 'bg-ff-accent' : 'bg-ff-border'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-fast ${goalProgress ? 'ml-5' : 'ml-0.5'}`} />
            </button>
          </div>
          {goalProgress && (
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-ff-text-secondary mb-1">目标数量</label>
                <input
                  type="number"
                  min={1}
                  value={goalProgress.target}
                  onChange={(e) => setGoalProgress({ ...goalProgress, target: Number(e.target.value) })}
                  className="w-20 px-2 py-1 bg-ff-surface border border-ff-border rounded text-sm text-ff-text text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-ff-text-secondary mb-1">单位</label>
                <input
                  type="text"
                  value={goalProgress.unit}
                  onChange={(e) => setGoalProgress({ ...goalProgress, unit: e.target.value })}
                  placeholder="道/页/章"
                  className="w-20 px-2 py-1 bg-ff-surface border border-ff-border rounded text-sm text-ff-text text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-ff-text-secondary mb-1">截止日期</label>
                <input
                  type="date"
                  value={goalProgress.deadline || ''}
                  onChange={(e) => setGoalProgress({ ...goalProgress, deadline: e.target.value || null })}
                  className="px-2 py-1 bg-ff-surface border border-ff-border rounded text-sm text-ff-text"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ff-text-secondary hover:text-ff-text transition-fast">
            取消
          </button>
          <button type="submit" className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast">
            {editTask ? '保存修改' : '创建任务'}
          </button>
        </div>
      </form>
    </div>
  )
}
