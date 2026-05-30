interface HabitCalendarProps {
  year: number
  month: number
  completedDays: Set<string>
}

export default function HabitCalendar({ year, month, completedDays }: HabitCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const cells: React.ReactNode[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-ff-surface aspect-square" />)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const completed = completedDays.has(dateStr)
    const isToday = dateStr === today
    const isPast = dateStr <= today

    cells.push(
      <div
        key={d}
        className={`aspect-square rounded flex items-center justify-center text-xs relative ${
          isToday ? 'ring-2 ring-ff-accent' : ''
        }`}
        style={{
          backgroundColor: completed ? 'rgba(129, 178, 154, 0.2)' : 'var(--ff-bg)',
        }}
      >
        <span className={`${completed ? 'text-ff-accent-secondary font-medium' : 'text-ff-muted'}`}>
          {d}
        </span>
        {completed && (
          <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-ff-accent-secondary" />
        )}
        {!completed && isPast && !isToday && (
          <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full border border-ff-muted/30" />
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
        <div key={d} className="text-center text-[10px] text-ff-muted py-1">{d}</div>
      ))}
      {cells}
    </div>
  )
}
