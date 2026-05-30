export interface TaskTimerConfig {
  mode: 'countdown' | 'countup' | 'habit'
  focusDuration?: number
  shortBreakDuration?: number
  longBreakDuration?: number
  habitTargetMinutes?: number
}

export interface GoalProgress {
  target: number
  completed: number
  unit: string
  deadline: string | null
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done' | 'archived'
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  parentId: string | null
  projectId: string | null
  tags: string[]
  dueDate: string | null
  estimatedPomodoros: number
  actualPomodoros: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
  order: number
  isTodayFocus: boolean
  timerConfig?: TaskTimerConfig | null
  goalProgress?: GoalProgress | null
}

export interface Project {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface TaskFilters {
  status?: Task['status'][]
  priority?: Task['priority'][]
  tags?: string[]
  projectId?: string
  query?: string
}
