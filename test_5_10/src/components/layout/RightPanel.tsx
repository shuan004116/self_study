import { useState } from 'react'
import NowPlaying from '@/features/music/components/NowPlaying'
import PlayerBar from '@/features/music/components/PlayerBar'
import WhiteNoiseMixer from '@/features/music/components/WhiteNoiseMixer'
import { useNoteStore } from '@/features/notes/store/noteStore'
import { useTimerStore } from '@/features/timer/store/timerStore'
import { useMusicStore } from '@/features/music/store/musicStore'

export default function RightPanel() {
  const [quickNote, setQuickNote] = useState('')
  const { createNote } = useNoteStore()
  const sessionHistory = useTimerStore((s) => s.sessionHistory)
  const { tracks, importFiles, removeTrack, importMessage, clearImportMessage } = useMusicStore()

  const today = new Date().toISOString().slice(0, 10)
  const todaySessions = sessionHistory.filter(
    (s) => s.completed && s.startTime.slice(0, 10) === today
  )
  const todayPomodoros = todaySessions.filter((s) => s.mode === 'pomodoro').length
  const todayMinutes = Math.round(
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60
  )

  const saveQuickNote = () => {
    if (!quickNote.trim()) return
    createNote({ title: '快速速记', content: quickNote, type: 'quick' })
    setQuickNote('')
  }

  return (
    <div className="w-72 bg-ff-bg-secondary border-l border-ff-border flex flex-col overflow-auto">
      {/* Music Player */}
      <div className="p-4 border-b border-ff-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider">音乐播放器</h3>
          <button
            onClick={importFiles}
            className="text-xs text-ff-accent hover:text-ff-accent/80 transition-fast"
          >
            + 导入
          </button>
        </div>
        <NowPlaying />
        {importMessage && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-card text-xs text-amber-600 whitespace-pre-line relative">
            {importMessage}
            <button
              onClick={clearImportMessage}
              className="absolute top-1 right-1 text-amber-600/60 hover:text-amber-600"
            >
              ×
            </button>
          </div>
        )}
        <div className="mt-3">
          <PlayerBar />
        </div>
        {tracks.length > 0 && (
          <div className="mt-3 max-h-32 overflow-auto space-y-1">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-ff-text-secondary hover:bg-ff-border transition-fast group cursor-pointer"
              >
                <button
                  onClick={() => useMusicStore.getState().play(track)}
                  className="flex-1 text-left truncate min-w-0"
                >
                  {track.title}
                </button>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="text-ff-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-fast"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* White Noise */}
      <div className="p-4 border-b border-ff-border">
        <WhiteNoiseMixer />
      </div>

      {/* Quick Note */}
      <div className="p-4 border-b border-ff-border">
        <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider mb-3">快速速记</h3>
        <textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="记录灵感..."
          className="w-full h-20 bg-ff-surface rounded-card p-3 text-sm text-ff-text placeholder-ff-muted resize-none border border-ff-border focus:border-ff-accent focus:outline-none transition-fast"
        />
        {quickNote && (
          <button
            onClick={saveQuickNote}
            className="mt-2 w-full py-1.5 bg-ff-accent/10 text-ff-accent rounded-card text-xs font-medium hover:bg-ff-accent/20 transition-fast"
          >
            保存速记
          </button>
        )}
      </div>

      {/* Daily Summary */}
      <div className="p-4">
        <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider mb-3">今日摘要</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-ff-surface rounded-card p-3 text-center">
            <div className="text-2xl font-bold text-ff-accent">{todayPomodoros}</div>
            <div className="text-xs text-ff-muted">完成番茄</div>
          </div>
          <div className="bg-ff-surface rounded-card p-3 text-center">
            <div className="text-2xl font-bold text-ff-accent-secondary">{todayMinutes}</div>
            <div className="text-xs text-ff-muted">专注分钟</div>
          </div>
        </div>
      </div>
    </div>
  )
}
