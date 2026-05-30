import { useState } from 'react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import TodayFocus from './TodayFocus'
import { Task } from '@/types/task.types'

export default function TaskView() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ff-text">任务管理</h1>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast"
        >
          + 新建任务
        </button>
      </div>

      {showForm && (
        <TaskForm onClose={handleClose} editTask={editingTask} simple={!editingTask} />
      )}

      <TodayFocus />
      <TaskList onEditTask={handleEdit} />
    </div>
  )
}
