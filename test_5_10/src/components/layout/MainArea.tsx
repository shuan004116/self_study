import TimerView from '@/features/timer/components/TimerView'
import TaskView from '@/features/tasks/components/TaskView'
import NoteView from '@/features/notes/components/NoteView'
import StatsView from '@/features/stats/components/StatsView'
import SettingsView from '@/features/settings/components/SettingsView'

interface MainAreaProps {
  activeView: string
}

export default function MainArea({ activeView }: MainAreaProps) {
  const views: Record<string, React.ReactNode> = {
    timer: <TimerView />,
    tasks: <TaskView />,
    notes: <NoteView />,
    stats: <StatsView />,
    settings: <SettingsView />
  }

  return (
    <div className="flex-1 bg-ff-bg overflow-auto p-6">
      {views[activeView] || <TimerView />}
    </div>
  )
}
