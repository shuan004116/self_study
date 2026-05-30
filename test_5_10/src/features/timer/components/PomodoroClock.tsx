import { useTimerStore } from '../store/timerStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { formatTime } from '@/lib/utils'

export default function PomodoroClock() {
  const { status, timeRemaining, totalTime, elapsedTime, timerMode, habitConfig, completedPomodoros, sessionHistory } = useTimerStore()
  const timerStyle = useSettingsStore((s) => s.settings.theme.timerStyle)

  const isActive = status === 'focused' || status === 'countingUp' || status === 'habitTracking' || status === 'countdownRunning'

  let progress = 0
  let displayTime = 0

  if (timerMode === 'pomodoro' || timerMode === 'countdown') {
    displayTime = timeRemaining
    progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0
  } else if (timerMode === 'countup') {
    displayTime = elapsedTime
    const softTarget = 25 * 60
    progress = Math.min((elapsedTime / softTarget) * 100, 100)
  } else {
    displayTime = elapsedTime
    const target = habitConfig.targetMinutes * 60
    progress = Math.min((elapsedTime / target) * 100, 100)
  }

  const circumference = 2 * Math.PI * 100
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const ringColor = (() => {
    if (status === 'paused') return 'var(--ff-muted)'
    if (status === 'shortBreak') return 'var(--accent-secondary)'
    if (status === 'longBreak') return 'var(--accent-tertiary, #6B8DE3)'
    if (timerMode === 'habit') return 'var(--accent-secondary)'
    if (timerMode === 'countdown') return 'var(--accent-tertiary, #6B8DE3)'
    return 'var(--accent-primary)'
  })()

  const statusText = (() => {
    if (status === 'idle') return '准备开始'
    if (status === 'focused') return '专注中'
    if (status === 'shortBreak') return '短休息'
    if (status === 'longBreak') return '长休息'
    if (status === 'paused') return '已暂停'
    if (status === 'countingUp') return '正向计时'
    if (status === 'habitTracking') return '习惯养成'
    if (status === 'countdownRunning') return '倒计时'
    return ''
  })()

  const today = new Date().toISOString().slice(0, 10)
  const todayCount = sessionHistory.filter((s) => s.completed && s.mode === 'pomodoro' && s.startTime.slice(0, 10) === today).length

  return (
    <div className="relative flex flex-col items-center">
      {/* Ring style */}
      {timerStyle !== 'bar' && (
        <svg width="280" height="280" viewBox="0 0 240 240" className="timer-ring">
          <circle cx="120" cy="120" r="100" fill="none" stroke="var(--ff-border)" strokeWidth={timerStyle === 'digital' ? '2' : '6'} />
          <circle
            cx="120" cy="120" r="100" fill="none"
            stroke={ringColor}
            strokeWidth={timerStyle === 'digital' ? '2' : '6'}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 120 120)"
            className="transition-all duration-1000"
            opacity={status === 'paused' ? 0.5 : 1}
          />
          {timerMode === 'habit' && timerStyle !== 'digital' && habitConfig.intervals.map((mins) => {
            const angle = (mins / habitConfig.targetMinutes) * 360 - 90
            const rad = (angle * Math.PI) / 180
            const x = 120 + 100 * Math.cos(rad)
            const y = 120 + 100 * Math.sin(rad)
            return (
              <circle key={mins} cx={x} cy={y} r="3" fill="var(--accent-secondary)" opacity={elapsedTime >= mins * 60 ? 1 : 0.3} />
            )
          })}
        </svg>
      )}

      {/* Bar style */}
      {timerStyle === 'bar' && (
        <div className="w-[280px] h-[280px] flex flex-col items-center justify-center timer-bar-fallback">
          <div className="w-full px-8 mb-6">
            <div className="h-3 bg-ff-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  backgroundColor: ringColor,
                  opacity: status === 'paused' ? 0.5 : 1
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-ff-muted">{formatTime(displayTime)}</span>
              <span className="text-[10px] text-ff-muted">{timerMode === 'countup' ? '' : formatTime(totalTime)}</span>
            </div>
          </div>
          {timerMode === 'habit' && habitConfig.intervals.map((mins) => (
            <div key={mins} className="flex items-center gap-2 text-xs text-ff-muted mb-1">
              <div className={`w-2 h-2 rounded-full ${elapsedTime >= mins * 60 ? 'bg-ff-accent-secondary' : 'bg-ff-border'}`} />
              <span>{mins} 分钟</span>
            </div>
          ))}
        </div>
      )}

      {/* Time display overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${timerStyle === 'digital' ? 'timer-display' : ''}`}>
        <div className={`font-mono font-bold text-ff-text tracking-wider ${
          timerStyle === 'digital' ? 'text-7xl' : 'text-6xl'
        }`}>
          {formatTime(displayTime)}
        </div>
        <div className="text-ff-muted text-sm mt-2">{statusText}</div>
        {timerMode === 'habit' && isActive && (
          <div className="text-ff-muted text-xs mt-1">
            目标 {habitConfig.targetMinutes} 分钟
          </div>
        )}
        {status === 'idle' && timerMode === 'pomodoro' && (
          <div className="text-ff-muted text-xs mt-1">
            今日已完成 {todayCount} 个番茄
          </div>
        )}
        {isActive && timerMode === 'pomodoro' && (
          <div className="text-ff-muted text-xs mt-1">
            第 {completedPomodoros + 1} 个番茄
          </div>
        )}
      </div>
    </div>
  )
}
