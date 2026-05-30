import { useTimerStore } from '../store/timerStore'
import { formatTime } from '@/lib/utils'

export default function SessionHistory() {
  const { sessionHistory } = useTimerStore()

  if (sessionHistory.length === 0) {
    return (
      <div className="text-ff-muted text-sm">
        今日暂无专注记录
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-medium text-ff-text-secondary mb-3">今日会话</h3>
      <div className="space-y-2">
        {sessionHistory.slice(-5).reverse().map((session) => (
          <div key={session.id} className="flex items-center justify-between bg-ff-surface rounded-card px-4 py-2">
            <span className="text-sm text-ff-text">{session.completed ? '✓' : '✗'}</span>
            <span className="text-sm text-ff-text-secondary">{formatTime(session.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
