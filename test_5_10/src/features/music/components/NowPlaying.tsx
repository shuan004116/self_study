import { useMusicStore } from '../store/musicStore'

export default function NowPlaying() {
  const { currentTrack } = useMusicStore()

  if (!currentTrack) {
    return (
      <div className="text-center py-4 text-ff-muted text-sm">
        未播放
      </div>
    )
  }

  return (
    <div className="bg-ff-surface rounded-card p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-ff-accent/20 rounded-card flex items-center justify-center text-ff-accent">
          ♫
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ff-text truncate">{currentTrack.title}</div>
          <div className="text-xs text-ff-muted truncate">{currentTrack.artist}</div>
        </div>
      </div>
    </div>
  )
}
