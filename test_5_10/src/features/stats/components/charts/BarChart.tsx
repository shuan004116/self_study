interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  barColor?: string
  showValues?: boolean
}

export default function BarChart({ data, height = 160, barColor = 'var(--accent-primary)', showValues = true }: BarChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-ff-muted py-8 text-sm">暂无数据</div>
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="w-full" style={{ height: height + 30 }}>
      <div className="flex items-end gap-1 h-full px-1" style={{ height }}>
        {data.map((d, i) => {
          const h = maxVal > 0 ? (d.value / maxVal) * (height - 20) : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              {showValues && d.value > 0 && (
                <span className="text-[10px] text-ff-muted mb-0.5">{d.value}</span>
              )}
              <div
                className="w-full rounded-t transition-all duration-500 min-h-[2px]"
                style={{
                  height: `${h}px`,
                  backgroundColor: d.color || barColor,
                  opacity: d.value > 0 ? 1 : 0.2
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 px-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-ff-muted truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
