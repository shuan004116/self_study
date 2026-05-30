export type TimerStatus = 'idle' | 'focused' | 'shortBreak' | 'longBreak' | 'paused' | 'countingUp' | 'habitTracking' | 'countdownRunning'

export type TimerMode = 'pomodoro' | 'countup' | 'countdown' | 'habit'

export interface HabitConfig {
  targetMinutes: number
  intervals: number[]
}

export interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartNext: boolean
  breakGuidance: boolean
  dailyGoal: number
}

export interface Session {
  id: string
  taskId: string | null
  startTime: string
  endTime: string | null
  duration: number
  plannedDuration: number
  completed: boolean
  interruptReason?: string
  mode: TimerMode
}

export interface BreakGuidance {
  type: 'eye' | 'neck' | 'stretch' | 'breathing'
  duration: number
  steps: string[]
}
