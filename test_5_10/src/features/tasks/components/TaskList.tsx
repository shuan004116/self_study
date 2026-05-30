import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import TaskItem from './TaskItem'
import { Task } from '@/types/task.types'

interface TaskListProps {
  onEditTask: (task: Task) => void
}

export default function TaskList({ onEditTask }: TaskListProps) {
  const { tasks, projects } = useTaskStore()
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupByProject, setGroupByProject] = useState(false)

  const filteredTasks = tasks.filter((t) => {
    if (filterProject !== 'all' && t.projectId !== filterProject) return false
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const renderTaskList = (list: Task[]) => (
    <div className="space-y-2">
      {list.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEditTask} />
      ))}
    </div>
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索任务..."
          className="px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none w-40"
        />
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text"
        >
          <option value="all">所有项目</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text"
        >
          <option value="all">所有状态</option>
          <option value="todo">待办</option>
          <option value="in_progress">进行中</option>
          <option value="done">已完成</option>
        </select>
        <button
          onClick={() => setGroupByProject(!groupByProject)}
          className={`px-3 py-1.5 rounded-card text-sm transition-fast ${groupByProject ? 'bg-ff-accent text-white' : 'bg-ff-bg border border-ff-border text-ff-text-secondary'}`}
        >
          按项目分组
        </button>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center text-ff-muted py-12">
          暂无任务，点击上方按钮创建
        </div>
      ) : groupByProject ? (
        <div className="space-y-4">
          {projects.filter((p) => sortedTasks.some((t) => t.projectId === p.id)).map((project) => (
            <div key={project.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="text-sm font-medium text-ff-text">{project.name}</span>
                <span className="text-xs text-ff-muted">
                  ({sortedTasks.filter((t) => t.projectId === project.id).length})
                </span>
              </div>
              {renderTaskList(sortedTasks.filter((t) => t.projectId === project.id))}
            </div>
          ))}
          {sortedTasks.some((t) => !t.projectId) && (
            <div>
              <div className="text-sm font-medium text-ff-muted mb-2">未分类</div>
              {renderTaskList(sortedTasks.filter((t) => !t.projectId))}
            </div>
          )}
        </div>
      ) : (
        renderTaskList(sortedTasks)
      )}
    </div>
  )
}
