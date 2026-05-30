import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, Project, Tag } from '@/types/task.types'
import { generateId } from '@/lib/utils'

interface TaskState {
  tasks: Task[]
  projects: Project[]
  tags: Tag[]
  createTask: (data: Partial<Task>) => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTodayFocus: (id: string) => void
  createProject: (data: Partial<Project>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  createTag: (data: Partial<Tag>) => void
  deleteTag: (id: string) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: [],
      tags: [],

      createTask: (data) => {
        const task: Task = {
          id: generateId(),
          title: data.title || '未命名任务',
          description: data.description || '',
          status: 'todo',
          priority: data.priority || 'P2',
          parentId: null,
          projectId: data.projectId || null,
          tags: data.tags || [],
          dueDate: data.dueDate || null,
          estimatedPomodoros: data.estimatedPomodoros || 1,
          actualPomodoros: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          order: Date.now(),
          isTodayFocus: false,
          timerConfig: data.timerConfig || null,
          goalProgress: data.goalProgress || null
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          )
        }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      },

      toggleTodayFocus: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isTodayFocus: !t.isTodayFocus } : t
          )
        }))
      },

      createProject: (data) => {
        const project: Project = {
          id: generateId(),
          name: data.name || '新项目',
          color: data.color || '#E07A5F',
          createdAt: new Date().toISOString()
        }
        set((state) => ({ projects: [...state.projects, project] }))
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...data } : p)
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.map((t) => t.projectId === id ? { ...t, projectId: null } : t)
        }))
      },

      createTag: (data) => {
        const tag: Tag = {
          id: generateId(),
          name: data.name || '新标签',
          color: data.color || '#81B29A'
        }
        set((state) => ({ tags: [...state.tags, tag] }))
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          tasks: state.tasks.map((t) => ({ ...t, tags: t.tags.filter((tagId) => tagId !== id) }))
        }))
      }
    }),
    { name: 'focusflow-tasks' }
  )
)
