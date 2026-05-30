import { useState } from 'react'
import { useTimerStore } from '../store/timerStore'
import { TimerMode } from '@/types/timer.types'

const MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: '番茄钟',
  countup: '正向计时',
  countdown: '限时任务',
  habit: '习惯养成'
}

const HABIT_TARGETS = [15, 25, 45]
const COUNTDOWN_PRESETS = [30, 45, 60, 90]

export default function TimerControls() {
  const { status, timerMode, currentTaskId, start, startCountUp, startHabit, startCountdown, pause, resume, stop, skipBreak, setTimerMode, habitConfig } = useTimerStore()
  const [countdownMinutes, setCountdownMinutes] = useState(45)

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1 bg-ff-bg-secondary rounded-lg p-1">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimerMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-fast ${
                timerMode === mode
                  ? 'bg-ff-accent text-white'
                  : 'text-ff-text-secondary hover:text-ff-text'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        {timerMode === 'pomodoro' && (
          <button
            onClick={() => start(currentTaskId)}
            className="px-8 py-3 bg-ff-accent text-white rounded-card font-medium hover:opacity-90 transition-fast"
          >
            开始专注
          </button>
        )}

        {timerMode === 'countup' && (
          <button
            onClick={() => startCountUp(currentTaskId)}
            className="px-8 py-3 bg-ff-accent text-white rounded-card font-medium hover:opacity-90 transition-fast"
          >
            开始计时
          </button>
        )}

        {timerMode === 'countdown' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {COUNTDOWN_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setCountdownMinutes(mins)}
                  className={`px-3 py-1 rounded-md text-sm transition-fast ${
                    countdownMinutes === mins
                      ? 'bg-ff-accent text-white'
                      : 'bg-ff-bg-secondary text-ff-text-secondary hover:text-ff-text'
                  }`}
                >
                  {mins}分钟
                </button>
              ))}
            </div>
            <button
              onClick={() => startCountdown(currentTaskId, countdownMinutes)}
              className="px-8 py-3 bg-ff-accent text-white rounded-card font-medium hover:opacity-90 transition-fast"
            >
              开始倒计时
            </button>
          </div>
        )}

        {timerMode === 'habit' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {HABIT_TARGETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => useTimerStore.setState({ habitConfig: { ...habitConfig, targetMinutes: mins } })}
                  className={`px-3 py-1 rounded-md text-sm transition-fast ${
                    habitConfig.targetMinutes === mins
                      ? 'bg-ff-accent text-white'
                      : 'bg-ff-bg-secondary text-ff-text-secondary hover:text-ff-text'
                  }`}
                >
                  {mins}分钟
                </button>
              ))}
            </div>
            <button
              onClick={() => startHabit(currentTaskId)}
              className="px-8 py-3 bg-ff-accent text-white rounded-card font-medium hover:opacity-90 transition-fast"
            >
              开始习惯
            </button>
          </div>
        )}
      </div>
    )
  }

  const isTracking = status === 'countingUp' || status === 'habitTracking'
  const isBreak = status === 'shortBreak' || status === 'longBreak'

  return (
    <div className="flex gap-3">
      {!isBreak && (
        status === 'paused' ? (
          <button
            onClick={resume}
            className="px-6 py-3 bg-ff-accent text-white rounded-card font-medium hover:opacity-90 transition-fast"
          >
            继续
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-3 bg-ff-border text-ff-text rounded-card font-medium hover:bg-ff-muted/20 transition-fast"
          >
            暂停
          </button>
        )
      )}
      <button
        onClick={stop}
        className="px-6 py-3 bg-ff-danger/10 text-ff-danger rounded-card font-medium hover:bg-ff-danger/20 transition-fast"
      >
        {isTracking ? '停止' : '放弃'}
      </button>
      {isBreak && (
        <button
          onClick={skipBreak}
          className="px-6 py-3 bg-ff-border text-ff-text rounded-card font-medium hover:bg-ff-muted/20 transition-fast"
        >
          跳过休息
        </button>
      )}
    </div>
  )
}
