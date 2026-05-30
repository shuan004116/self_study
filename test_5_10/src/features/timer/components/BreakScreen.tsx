import { useTimerStore } from '../store/timerStore'
import { BREAK_GUIDANCE } from '@/lib/constants'
import { formatTime } from '@/lib/utils'

export default function BreakScreen() {
  const { status, timeRemaining, totalTime, skipBreak } = useTimerStore()
  const isLong = status === 'longBreak'
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0

  const guidance = isLong ? BREAK_GUIDANCE[2] : BREAK_GUIDANCE[Math.floor(Math.random() * 2)]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-center">
        <div className="text-2xl font-bold text-ff-text mb-2">
          {isLong ? '长休息' : '短休息'}
        </div>
        <div className="text-ff-muted text-sm">放松一下，保持专注力</div>
      </div>

      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="100" fill="none" stroke="var(--ff-border)" strokeWidth="6" />
          <circle
            cx="120" cy="120" r="100" fill="none"
            stroke="var(--accent-secondary)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 100}
            strokeDashoffset={2 * Math.PI * 100 - (progress / 100) * 2 * Math.PI * 100}
            transform="rotate(-90 120 120)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-4xl font-bold text-ff-text">{formatTime(timeRemaining)}</div>
          <div className="text-ff-muted text-xs mt-1">剩余休息时间</div>
        </div>
      </div>

      <div className="bg-ff-surface rounded-panel border border-ff-border p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">
            {{ eye: '👁', neck: '🧘', stretch: '💪', breathing: '🌬' }[guidance.type]}
          </span>
          <span className="font-medium text-ff-text">
            {{ eye: '眼部放松', neck: '颈部放松', stretch: '伸展运动', breathing: '呼吸练习' }[guidance.type]}
          </span>
          <span className="text-xs text-ff-muted ml-auto">{guidance.duration}秒</span>
        </div>
        <ul className="space-y-2">
          {guidance.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ff-text-secondary">
              <span className="text-ff-accent font-medium">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={skipBreak}
        className="px-6 py-2 bg-ff-border text-ff-text rounded-card text-sm font-medium hover:bg-ff-muted/20 transition-fast"
      >
        跳过休息
      </button>
    </div>
  )
}
