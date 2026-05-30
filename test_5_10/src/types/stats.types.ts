export type StatsPeriod = 'day' | 'week' | 'month' | 'year'

export type StatsSubTab = 'overview' | 'trend' | 'subject' | 'habit' | 'goal' | 'behavior'

export interface DailyStats {
  date: string
  focusMinutes: number
  pomodoroCount: number
  completedTasks: number
  abandonedCount: number
  totalMinutes: number
}

export interface WeeklyStats {
  days: { date: string; label: string; minutes: number; pomodoros: number }[]
  totalMinutes: number
  totalPomodoros: number
  avgMinutes: number
}

export interface MonthlyStats {
  daysInMonth: number
  heatmap: { day: number; minutes: number }[]
  totalMinutes: number
  totalPomodoros: number
  activeDays: number
}

export interface YearlyStats {
  months: { month: number; minutes: number; pomodoros: number }[]
  totalMinutes: number
  totalPomodoros: number
  activeDays: number
  monthlyAvg: number
}

export interface SubjectStats {
  projectId: string
  projectName: string
  color: string
  totalMinutes: number
  pomodoroCount: number
  percentage: number
}

export interface PieSlice {
  name: string
  value: number
  color: string
  percentage: number
}

export interface HabitStats {
  totalSessions: number
  completedSessions: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  completionRate: number
  dailyData: { date: string; completed: boolean; minutes: number }[]
}

export interface GoalStats {
  activeGoals: number
  completedGoals: number
  avgProgress: number
  details: {
    taskId: string
    title: string
    target: number
    completed: number
    unit: string
    percent: number
    deadline: string | null
    dailySpeed: number
    estimatedDays: number
  }[]
}

export interface BehaviorStats {
  totalSessions: number
  completed: number
  abandoned: number
  completionRate: number
  avgSessionLength: number
  longestFocusSession: number
  totalFocusHours: number
  byMode: { mode: string; count: number; totalMinutes: number }[]
}
