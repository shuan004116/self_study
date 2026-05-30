import { PieSlice } from '@/types/stats.types'

interface PieChartProps {
  data: PieSlice[]
  size?: number
}

export default function PieChart({ data, size = 180 }: PieChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-ff-muted py-8 text-sm">暂无数据</div>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) {
    return <div className="text-center text-ff-muted py-8 text-sm">暂无数据</div>
  }

  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  let accumulated = 0

  const slices = data.map((d) => {
    const percent = d.value / total
    const dashArray = `${percent * circumference} ${circumference}`
    const dashOffset = -accumulated * circumference
    accumulated += percent
    return { ...d, dashArray, dashOffset, percent }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-500"
          />
        ))}
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="var(--ff-text)" fontSize="16" fontWeight="bold">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fill="var(--ff-muted)" fontSize="10">
          分钟
        </text>
      </svg>

      <div className="space-y-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-ff-text">{s.name}</span>
            <span className="text-ff-muted ml-auto">{s.percent > 0 ? Math.round(s.percent * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
