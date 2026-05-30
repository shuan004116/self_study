interface LineChartProps {
  data: { label: string; value: number }[]
  height?: number
  color?: string
  showDots?: boolean
  showLabels?: boolean
}

export default function LineChart({ data, height = 200, color = 'var(--accent-primary)', showDots = true, showLabels = true }: LineChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-ff-muted py-8 text-sm">暂无数据</div>
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const padding = { top: 20, right: 10, bottom: 30, left: 40 }
  const width = 600
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
    label: d.label,
    value: d.value
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  // Y axis ticks
  const tickCount = 4
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = Math.round((maxVal / tickCount) * i)
    const y = padding.top + chartH - (val / maxVal) * chartH
    return { val, y }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {ticks.map((t) => (
        <g key={t.val}>
          <line x1={padding.left} y1={t.y} x2={width - padding.right} y2={t.y} stroke="var(--ff-border)" strokeWidth="1" strokeDasharray="4,4" />
          <text x={padding.left - 8} y={t.y + 4} textAnchor="end" fill="var(--ff-muted)" fontSize="10">
            {t.val}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaD} fill={color} opacity="0.1" />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

      {/* Dots */}
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="var(--ff-surface)" strokeWidth="2" />
      ))}

      {/* Value labels */}
      {showLabels && data.length <= 14 && points.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 8} textAnchor="middle" fill="var(--ff-text-secondary)" fontSize="9">
          {p.value}
        </text>
      ))}

      {/* X axis labels */}
      {points.filter((_, i) => {
        const step = Math.ceil(data.length / 10)
        return i % step === 0 || i === points.length - 1
      }).map((p, i) => (
        <text key={i} x={p.x} y={height - 5} textAnchor="middle" fill="var(--ff-muted)" fontSize="9">
          {p.label}
        </text>
      ))}
    </svg>
  )
}
