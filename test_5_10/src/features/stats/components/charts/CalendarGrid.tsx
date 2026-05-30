import { Session } from '@/types/timer.types'

interface CalendarGridProps {
  year: number
  month: number
  sessions: Session[]
  today: string
}

export default function CalendarGrid({ year, month, sessions, today }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: React.ReactNode[] = []

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-ff-surface min-h-[72px]" />)
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const daySessions = sessions.filter((s) => s.completed && s.startTime.slice(0, 10) === dateStr)
    const dayMinutes = Math.round(daySessions.reduce((sum, s) => sum + s.duration, 0) / 60)
    const dayPomodoros = daySessions.filter((s) => s.mode === 'pomodoro').length
    const isToday = dateStr === today

    cells.push(
      <div key={d} className={`bg-ff-surface min-h-[72px] p-1.5 ${isToday ? 'ring-2 ring-ff-accent' : ''}`}>
        <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-ff-accent' : 'text-ff-text'}`}>{d}</div>
        {dayMinutes > 0 && (
          <div className="space-y-0.5">
            <div className="text-[10px] text-ff-accent font-medium">{dayMinutes}分钟</div>
            {dayPomodoros > 0 && <div className="text-[10px] text-ff-muted">{dayPomodoros}🍅</div>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-ff-border rounded-lg overflow-hidden">
      {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
        <div key={d} className="bg-ff-bg-secondary text-center text-xs text-ff-muted py-2 font-medium">{d}</div>
      ))}
      {cells}
    </div>
  )
}
