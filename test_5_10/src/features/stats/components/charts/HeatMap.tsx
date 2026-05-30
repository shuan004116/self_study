interface HeatMapProps {
  data: { day: number; minutes: number }[]
  totalMinutes?: number
  activeDays?: number
}

export default function HeatMap({ data, totalMinutes = 0, activeDays = 0 }: HeatMapProps) {
  const avgMinutes = activeDays > 0 ? totalMinutes / activeDays : 0

  return (
    <div className="grid grid-cols-7 gap-1">
      {data.map((d) => {
        const intensity = avgMinutes > 0 ? d.minutes / avgMinutes : 0
        const opacity = Math.min(intensity, 1)
        return (
          <div
            key={d.day}
            className="aspect-square rounded flex items-center justify-center text-xs"
            style={{
              backgroundColor: d.minutes > 0 ? `rgba(224, 122, 95, ${0.2 + opacity * 0.8})` : 'var(--ff-bg)',
              color: d.minutes > 0 ? 'white' : 'var(--ff-muted)'
            }}
            title={`${d.day}日: ${d.minutes}分钟`}
          >
            {d.day}
          </div>
        )
      })}
    </div>
  )
}
