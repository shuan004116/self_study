import { cn } from '@/lib/utils'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  onHelp: () => void
}

const navItems = [
  { id: 'timer', label: '番茄钟', icon: '🍅' },
  { id: 'tasks', label: '任务', icon: '📋' },
  { id: 'notes', label: '笔记', icon: '📝' },
  { id: 'stats', label: '统计', icon: '📊' },
  { id: 'settings', label: '设置', icon: '⚙️' }
]

export default function Sidebar({ activeView, onViewChange, onHelp }: SidebarProps) {
  return (
    <div className="w-16 bg-ff-bg-secondary border-r border-ff-border flex flex-col items-center py-4 gap-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            'w-12 h-12 flex flex-col items-center justify-center rounded-card transition-fast text-xs gap-0.5',
            activeView === item.id
              ? 'bg-ff-accent/10 text-ff-accent'
              : 'text-ff-text-secondary hover:bg-ff-border hover:text-ff-text'
          )}
        >
          <span className="text-lg">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
      <div className="flex-1" />
      <button
        onClick={onHelp}
        className="w-12 h-12 flex flex-col items-center justify-center rounded-card transition-fast text-xs gap-0.5 text-ff-text-secondary hover:bg-ff-border hover:text-ff-text"
      >
        <span className="text-lg">❓</span>
        <span>帮助</span>
      </button>
    </div>
  )
}
