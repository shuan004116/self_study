import { Session } from '@/types/timer.types'
import { Task, Project } from '@/types/task.types'
import { SubjectStats, PieSlice, HabitStats, GoalStats, BehaviorStats, YearlyStats } from '@/types/stats.types'

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ─── 基础统计 ────────────────────────────────────────────

export function getDailyStats(sessions: Session[], date: string, tasks?: Task[]): {
  focusMinutes: number
  pomodoroCount: number
  abandonedCount: number
  totalMinutes: number
  completedTasks: number
} {
  const daySessions = sessions.filter((s) => s.startTime.slice(0, 10) === date)
  const focusSessions = daySessions.filter((s) => s.mode === 'pomodoro' || s.mode === 'countdown')
  const focusMinutes = Math.round(focusSessions.reduce((sum, s) => sum + s.duration, 0) / 60)
  const pomodoroCount = focusSessions.filter((s) => s.mode === 'pomodoro' && s.completed).length
  const abandonedCount = daySessions.filter((s) => !s.completed).length
  const totalMinutes = Math.round(daySessions.reduce((sum, s) => sum + s.duration, 0) / 60)
  const completedTasks = tasks
    ? tasks.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === date).length
    : 0
  return { focusMinutes, pomodoroCount, abandonedCount, totalMinutes, completedTasks }
}

export function getWeeklyStats(sessions: Session[]): {
  days: { date: string; label: string; minutes: number; pomodoros: number }[]
  totalPomodoros: number
  totalMinutes: number
  avgMinutes: number
} {
  const days: { date: string; label: string; minutes: number; pomodoros: number }[] = []
  const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = dateStr(d)
    const stats = getDailyStats(sessions, ds)
    days.push({
      date: ds,
      label: weekLabels[d.getDay()],
      minutes: stats.focusMinutes,
      pomodoros: stats.pomodoroCount
    })
  }
  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0)
  const totalPomodoros = days.reduce((sum, d) => sum + d.pomodoros, 0)
  return { days, totalPomodoros, totalMinutes, avgMinutes: Math.round(totalMinutes / 7) }
}

export function getMonthlyStats(sessions: Session[], year: number, month: number): {
  daysInMonth: number
  heatmap: { day: number; minutes: number }[]
  totalMinutes: number
  totalPomodoros: number
  activeDays: number
} {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const heatmap: { day: number; minutes: number }[] = []
  let totalMinutes = 0
  let totalPomodoros = 0
  let activeDays = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const stats = getDailyStats(sessions, date)
    heatmap.push({ day: d, minutes: stats.focusMinutes })
    totalMinutes += stats.focusMinutes
    totalPomodoros += stats.pomodoroCount
    if (stats.focusMinutes > 0) activeDays++
  }

  return { daysInMonth, heatmap, totalMinutes, totalPomodoros, activeDays }
}

export function getYearlyStats(sessions: Session[], year: number): YearlyStats {
  const months: { month: number; minutes: number; pomodoros: number }[] = []
  let totalMinutes = 0
  let totalPomodoros = 0
  let activeDays = 0

  for (let m = 0; m < 12; m++) {
    const monthStats = getMonthlyStats(sessions, year, m)
    months.push({ month: m, minutes: monthStats.totalMinutes, pomodoros: monthStats.totalPomodoros })
    totalMinutes += monthStats.totalMinutes
    totalPomodoros += monthStats.totalPomodoros
    activeDays += monthStats.activeDays
  }

  return { months, totalMinutes, totalPomodoros, activeDays, monthlyAvg: Math.round(totalMinutes / 12) }
}

// ─── 连签 ────────────────────────────────────────────────

export function getStreakCount(sessions: Session[]): number {
  const days = new Set<string>()
  for (const s of sessions) {
    if (s.completed) days.add(s.startTime.slice(0, 10))
  }
  let streak = 0
  const d = new Date()
  while (days.has(dateStr(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function getLongestStreak(sessions: Session[]): number {
  const days = new Set<string>()
  for (const s of sessions) {
    if (s.completed) days.add(s.startTime.slice(0, 10))
  }
  const sorted = [...days].sort()
  let longest = 0
  let current = 0
  let prev = ''
  for (const day of sorted) {
    if (prev) {
      const prevDate = new Date(prev)
      const currDate = new Date(day)
      const diff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        current++
      } else {
        current = 1
      }
    } else {
      current = 1
    }
    longest = Math.max(longest, current)
    prev = day
  }
  return longest
}

// ─── 科目统计 ────────────────────────────────────────────

export function getSubjectStats(sessions: Session[], tasks: Task[], projects: Project[]): SubjectStats[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const projectMinutes = new Map<string, number>()
  const projectPomodoros = new Map<string, number>()

  for (const s of sessions) {
    if (!s.taskId || !s.completed) continue
    const task = taskMap.get(s.taskId)
    const pid = task?.projectId || 'unclassified'
    projectMinutes.set(pid, (projectMinutes.get(pid) || 0) + Math.round(s.duration / 60))
    if (s.mode === 'pomodoro') {
      projectPomodoros.set(pid, (projectPomodoros.get(pid) || 0) + 1)
    }
  }

  const total = [...projectMinutes.values()].reduce((a, b) => a + b, 0)
  const projectMap = new Map(projects.map((p) => [p.id, p.name]))
  const projectColorMap = new Map(projects.map((p) => [p.id, p.color]))

  const stats: SubjectStats[] = []
  for (const [pid, minutes] of projectMinutes) {
    stats.push({
      projectId: pid,
      projectName: projectMap.get(pid) || '未分类',
      color: projectColorMap.get(pid) || '#A39E99',
      totalMinutes: minutes,
      pomodoroCount: projectPomodoros.get(pid) || 0,
      percentage: total > 0 ? Math.round((minutes / total) * 100) : 0
    })
  }

  return stats.sort((a, b) => b.totalMinutes - a.totalMinutes)
}

export function getPieChartData(sessions: Session[], tasks: Task[], projects: Project[]): PieSlice[] {
  const subjectStats = getSubjectStats(sessions, tasks, projects)
  return subjectStats.map((s) => ({
    name: s.projectName,
    value: s.totalMinutes,
    color: s.color,
    percentage: s.percentage
  }))
}

// ─── 平均时长 ────────────────────────────────────────────

export function getAverageSessionLength(sessions: Session[]): number {
  const completed = sessions.filter((s) => s.completed && (s.mode === 'pomodoro' || s.mode === 'countdown'))
  if (completed.length === 0) return 0
  return Math.round(completed.reduce((sum, s) => sum + s.duration, 0) / completed.length / 60)
}

// ─── 趋势数据 ────────────────────────────────────────────

export function getDailyTrend(sessions: Session[], days: number): { date: string; label: string; minutes: number; pomodoros: number }[] {
  const result: { date: string; label: string; minutes: number; pomodoros: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = dateStr(d)
    const stats = getDailyStats(sessions, ds)
    const label = days <= 7
      ? `${d.getMonth() + 1}/${d.getDate()}`
      : days <= 31
        ? `${d.getDate()}`
        : `${d.getMonth() + 1}月`
    result.push({ date: ds, label, minutes: stats.focusMinutes, pomodoros: stats.pomodoroCount })
  }
  return result
}

// ─── 习惯统计 ────────────────────────────────────────────

export function getHabitStats(sessions: Session[]): HabitStats {
  const habitSessions = sessions.filter((s) => s.mode === 'habit')
  const completedSessions = habitSessions.filter((s) => s.completed)
  const totalMinutes = Math.round(habitSessions.reduce((sum, s) => sum + s.duration, 0) / 60)

  // 按天聚合
  const dayMap = new Map<string, { completed: boolean; minutes: number }>()
  for (const s of habitSessions) {
    const day = s.startTime.slice(0, 10)
    const existing = dayMap.get(day)
    if (existing) {
      existing.minutes += Math.round(s.duration / 60)
      if (s.completed) existing.completed = true
    } else {
      dayMap.set(day, { completed: s.completed, minutes: Math.round(s.duration / 60) })
    }
  }

  const dailyData = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  // 计算连签
  const completedDays = new Set(dailyData.filter((d) => d.completed).map((d) => d.date))
  let currentStreak = 0
  const d = new Date()
  while (completedDays.has(dateStr(d))) {
    currentStreak++
    d.setDate(d.getDate() - 1)
  }

  const sortedDays = [...completedDays].sort()
  let longestStreak = 0
  let current = 0
  let prev = ''
  for (const day of sortedDays) {
    if (prev) {
      const diff = (new Date(day).getTime() - new Date(prev).getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) current++
      else current = 1
    } else {
      current = 1
    }
    longestStreak = Math.max(longestStreak, current)
    prev = day
  }

  return {
    totalSessions: habitSessions.length,
    completedSessions: completedSessions.length,
    totalMinutes,
    currentStreak,
    longestStreak,
    completionRate: habitSessions.length > 0 ? Math.round((completedSessions.length / habitSessions.length) * 100) : 0,
    dailyData
  }
}

// ─── 目标进度统计 ────────────────────────────────────────

export function getGoalStats(tasks: Task[]): GoalStats {
  const goals = tasks.filter((t) => t.goalProgress)
  const activeGoals = goals.filter((t) => t.status !== 'done').length
  const completedGoals = goals.filter((t) => t.status === 'done' || (t.goalProgress && t.goalProgress.completed >= t.goalProgress.target)).length

  const details = goals.map((t) => {
    const gp = t.goalProgress!
    const percent = Math.round((gp.completed / gp.target) * 100)
    const createdAt = new Date(t.createdAt)
    const daysSinceCreation = Math.max(1, Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))
    const dailySpeed = Math.round(gp.completed / daysSinceCreation * 10) / 10
    const remaining = gp.target - gp.completed
    const estimatedDays = dailySpeed > 0 ? Math.ceil(remaining / dailySpeed) : Infinity

    return {
      taskId: t.id,
      title: t.title,
      target: gp.target,
      completed: gp.completed,
      unit: gp.unit,
      percent,
      deadline: gp.deadline,
      dailySpeed,
      estimatedDays: estimatedDays === Infinity ? -1 : estimatedDays
    }
  }).sort((a, b) => b.percent - a.percent)

  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, t) => sum + (t.goalProgress!.completed / t.goalProgress!.target) * 100, 0) / goals.length)
    : 0

  return { activeGoals, completedGoals, avgProgress, details }
}

// ─── 行为自律分析 ────────────────────────────────────────

export function getBehaviorStats(sessions: Session[]): BehaviorStats {
  const completed = sessions.filter((s) => s.completed).length
  const abandoned = sessions.filter((s) => !s.completed).length
  const focusSessions = sessions.filter((s) => s.completed && (s.mode === 'pomodoro' || s.mode === 'countdown'))
  const avgSessionLength = focusSessions.length > 0
    ? Math.round(focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length / 60)
    : 0
  const longestFocusSession = focusSessions.length > 0
    ? Math.round(Math.max(...focusSessions.map((s) => s.duration)) / 60)
    : 0
  const totalFocusHours = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 3600 * 10) / 10

  const modeMap = new Map<string, { count: number; totalMinutes: number }>()
  const modeLabels: Record<string, string> = { pomodoro: '番茄钟', countup: '正向计时', countdown: '限时任务', habit: '习惯养成' }
  for (const s of sessions) {
    const label = modeLabels[s.mode] || s.mode
    const existing = modeMap.get(label)
    if (existing) {
      existing.count++
      existing.totalMinutes += Math.round(s.duration / 60)
    } else {
      modeMap.set(label, { count: 1, totalMinutes: Math.round(s.duration / 60) })
    }
  }

  const byMode = [...modeMap.entries()].map(([mode, data]) => ({ mode, ...data }))

  return {
    totalSessions: sessions.length,
    completed,
    abandoned,
    completionRate: sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0,
    avgSessionLength,
    longestFocusSession,
    totalFocusHours,
    byMode
  }
}

// ─── 按日期获取记录 ──────────────────────────────────────

export function getSessionsByDate(sessions: Session[], date: string): Session[] {
  return sessions.filter((s) => s.startTime.slice(0, 10) === date)
}

// ─── 导出 ────────────────────────────────────────────────

export function exportToCSV(sessions: Session[]): string {
  const header = '开始时间,结束时间,时长(秒),计划时长(秒),完成,模式\n'
  const rows = sessions.map((s) =>
    `${s.startTime},${s.endTime || ''},${s.duration},${s.plannedDuration},${s.completed ? '是' : '否'},${s.mode}`
  ).join('\n')
  return header + rows
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(data: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
