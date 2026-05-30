import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimerStatus, TimerMode, Session, HabitConfig } from '@/types/timer.types'
import { DEFAULT_TIMER_SETTINGS } from '@/lib/constants'
import { generateId } from '@/lib/utils'
import { useTaskStore } from '@/features/tasks/store/taskStore'

interface TimerState {
  status: TimerStatus
  timeRemaining: number
  totalTime: number
  currentTaskId: string | null
  completedPomodoros: number
  sessionHistory: Session[]
  settings: typeof DEFAULT_TIMER_SETTINGS
  timerMode: TimerMode
  elapsedTime: number
  habitConfig: HabitConfig
  streakCount: number
  start: (taskId?: string | null) => void
  startCountUp: (taskId?: string | null) => void
  startHabit: (taskId?: string | null, config?: HabitConfig) => void
  startCountdown: (taskId: string | null, durationMinutes: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipBreak: () => void
  tick: () => void
  syncFromSettings: (timerSettings: Partial<typeof DEFAULT_TIMER_SETTINGS>) => void
  setTimerMode: (mode: TimerMode) => void
}

let tickInterval: ReturnType<typeof setInterval> | null = null

function notify(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      timeRemaining: DEFAULT_TIMER_SETTINGS.focusDuration * 60,
      totalTime: DEFAULT_TIMER_SETTINGS.focusDuration * 60,
      currentTaskId: null,
      completedPomodoros: 0,
      sessionHistory: [],
      settings: DEFAULT_TIMER_SETTINGS,
      timerMode: 'pomodoro',
      elapsedTime: 0,
      habitConfig: { targetMinutes: 25, intervals: [5, 10, 15, 20] },
      streakCount: 0,

      start: (taskId) => {
        const { settings } = get()
        if (tickInterval) clearInterval(tickInterval)

        set({
          status: 'focused',
          timerMode: 'pomodoro',
          timeRemaining: settings.focusDuration * 60,
          totalTime: settings.focusDuration * 60,
          currentTaskId: taskId ?? null,
          elapsedTime: 0
        })

        tickInterval = setInterval(() => get().tick(), 1000)
      },

      startCountUp: (taskId) => {
        if (tickInterval) clearInterval(tickInterval)

        set({
          status: 'countingUp',
          timerMode: 'countup',
          elapsedTime: 0,
          currentTaskId: taskId ?? null,
          timeRemaining: 0,
          totalTime: 0
        })

        tickInterval = setInterval(() => get().tick(), 1000)
      },

      startHabit: (taskId, config) => {
        if (tickInterval) clearInterval(tickInterval)
        const habitConfig = config ?? get().habitConfig

        set({
          status: 'habitTracking',
          timerMode: 'habit',
          elapsedTime: 0,
          currentTaskId: taskId ?? null,
          habitConfig,
          timeRemaining: 0,
          totalTime: 0
        })

        tickInterval = setInterval(() => get().tick(), 1000)
      },

      startCountdown: (taskId, durationMinutes) => {
        if (tickInterval) clearInterval(tickInterval)
        const totalTime = durationMinutes * 60

        set({
          status: 'countdownRunning',
          timerMode: 'countdown',
          timeRemaining: totalTime,
          totalTime,
          currentTaskId: taskId,
          elapsedTime: 0
        })

        tickInterval = setInterval(() => get().tick(), 1000)
      },

      pause: () => {
        if (tickInterval) clearInterval(tickInterval)
        set({ status: 'paused' })
      },

      resume: () => {
        const { status } = get()
        if (status !== 'paused') return

        tickInterval = setInterval(() => get().tick(), 1000)
        set({ status: 'focused' })
      },

      stop: () => {
        if (tickInterval) clearInterval(tickInterval)
        const { timeRemaining, totalTime, currentTaskId, sessionHistory, timerMode, elapsedTime, settings, status } = get()

        const duration = (timerMode === 'pomodoro' || timerMode === 'countdown')
          ? totalTime - timeRemaining
          : elapsedTime

        const session: Session = {
          id: generateId(),
          taskId: currentTaskId,
          startTime: new Date(Date.now() - duration * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration,
          plannedDuration: timerMode === 'pomodoro' || timerMode === 'countdown' ? totalTime : 0,
          completed: timeRemaining === 0,
          mode: timerMode
        }

        set({
          status: 'idle',
          timeRemaining: settings.focusDuration * 60,
          totalTime: settings.focusDuration * 60,
          currentTaskId: null,
          elapsedTime: 0,
          sessionHistory: [...sessionHistory, session]
        })
      },

      skipBreak: () => {
        if (tickInterval) clearInterval(tickInterval)
        const { settings } = get()
        set({
          status: 'idle',
          timeRemaining: settings.focusDuration * 60,
          totalTime: settings.focusDuration * 60,
        })
      },

      tick: () => {
        const state = get()
        const { status, settings, completedPomodoros, sessionHistory, currentTaskId, totalTime, timerMode, elapsedTime, habitConfig, timeRemaining } = state

        if (timerMode === 'countup') {
          set({ elapsedTime: elapsedTime + 1 })
          return
        }

        if (timerMode === 'habit') {
          const newElapsed = elapsedTime + 1
          if (newElapsed >= habitConfig.targetMinutes * 60) {
            if (tickInterval) clearInterval(tickInterval)
            notify('习惯达成！', `已完成 ${habitConfig.targetMinutes} 分钟`)
            const session: Session = {
              id: generateId(),
              taskId: currentTaskId,
              startTime: new Date(Date.now() - newElapsed * 1000).toISOString(),
              endTime: new Date().toISOString(),
              duration: newElapsed,
              plannedDuration: habitConfig.targetMinutes * 60,
              completed: true,
              mode: 'habit'
            }
            set({
              status: 'idle',
              elapsedTime: 0,
              streakCount: state.streakCount + 1,
              sessionHistory: [...sessionHistory, session]
            })
          } else {
            set({ elapsedTime: newElapsed })
          }
          return
        }

        // pomodoro or countdown mode
        if (timeRemaining <= 0) {
          if (tickInterval) clearInterval(tickInterval)

          const session: Session = {
            id: generateId(),
            taskId: currentTaskId,
            startTime: new Date(Date.now() - totalTime * 1000).toISOString(),
            endTime: new Date().toISOString(),
            duration: totalTime,
            plannedDuration: totalTime,
            completed: true,
            mode: timerMode
          }

          // Increment actualPomodoros on the task
          if (currentTaskId && timerMode === 'pomodoro') {
            try {
              const task = useTaskStore.getState().tasks.find((t) => t.id === currentTaskId)
              if (task) {
                useTaskStore.getState().updateTask(currentTaskId, {
                  actualPomodoros: task.actualPomodoros + 1
                })
              }
            } catch {}
          }

          if (timerMode === 'countdown') {
            // Simple countdown: no breaks, just notify and stop
            notify('时间到！', '倒计时已结束')
            set({
              status: 'idle',
              timeRemaining: settings.focusDuration * 60,
              totalTime: settings.focusDuration * 60,
              currentTaskId: null,
              sessionHistory: [...sessionHistory, session]
            })
            return
          }

          // Pomodoro mode: transition to breaks
          if (status === 'focused') {
            const newCompleted = completedPomodoros + 1
            const isLongBreak = newCompleted % settings.longBreakInterval === 0
            const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration

            notify('番茄完成！', isLongBreak ? '长休息时间到了' : '休息一下吧')

            set({
              status: isLongBreak ? 'longBreak' : 'shortBreak',
              timeRemaining: breakDuration * 60,
              totalTime: breakDuration * 60,
              completedPomodoros: newCompleted,
              sessionHistory: [...sessionHistory, session]
            })

            tickInterval = setInterval(() => get().tick(), 1000)
          } else {
            if (settings.autoStartNext) {
              set({
                status: 'focused',
                timeRemaining: settings.focusDuration * 60,
                totalTime: settings.focusDuration * 60,
                sessionHistory: [...sessionHistory, session]
              })
              tickInterval = setInterval(() => get().tick(), 1000)
            } else {
              set({
                status: 'idle',
                timeRemaining: settings.focusDuration * 60,
                totalTime: settings.focusDuration * 60,
                sessionHistory: [...sessionHistory, session]
              })
            }
          }
        } else {
          set({ timeRemaining: timeRemaining - 1 })
        }
      },

      syncFromSettings: (timerSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...timerSettings }
        })),

      setTimerMode: (mode) => set({ timerMode: mode })
    }),
    {
      name: 'focusflow-timer',
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        streakCount: state.streakCount,
        completedPomodoros: state.completedPomodoros
      })
    }
  )
)
