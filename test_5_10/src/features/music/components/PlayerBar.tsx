import { useRef, useCallback } from 'react'
import { useMusicStore } from '../store/musicStore'
import { formatTime } from '@/lib/utils'

export default function PlayerBar() {
  const { isPlaying, progress, currentTrack, volume, mode, duration, play, pause, next, previous, setVolume, setMode, setProgress } = useMusicStore()
  const barRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const modes: Array<{ value: typeof mode; label: string }> = [
    { value: 'sequence', label: '顺序' },
    { value: 'shuffle', label: '随机' },
    { value: 'single', label: '单曲' }
  ]

  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const seekFromEvent = useCallback((clientX: number) => {
    if (!barRef.current || !currentTrack) return
    const rect = barRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const pct = x / rect.width
    setProgress(Math.floor(pct * duration))
  }, [currentTrack, duration, setProgress])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentTrack) return
    dragging.current = true
    seekFromEvent(e.clientX)

    const onMove = (ev: MouseEvent) => {
      if (dragging.current) seekFromEvent(ev.clientX)
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [currentTrack, seekFromEvent])

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex items-center gap-2 text-xs text-ff-muted">
        <span>{formatTime(progress)}</span>
        <div
          ref={barRef}
          className="flex-1 h-1 bg-ff-border rounded-full cursor-pointer relative"
          onMouseDown={handleMouseDown}
        >
          <div
            className="h-full bg-ff-accent rounded-full"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          />
        </div>
        <span>{duration ? formatTime(duration) : '00:00'}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMode(modes[(modes.findIndex((m) => m.value === mode) + 1) % modes.length].value)}
          className="text-xs text-ff-muted hover:text-ff-text transition-fast"
        >
          {modes.find((m) => m.value === mode)?.label}
        </button>

        <div className="flex items-center gap-3">
          <button onClick={previous} className="text-ff-text-secondary hover:text-ff-text transition-fast">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="8,1 2,7 8,13"/><rect x="10" y="1" width="3" height="12"/></svg>
          </button>
          <button
            onClick={handlePlayPause}
            className="w-8 h-8 rounded-full bg-ff-accent text-white flex items-center justify-center hover:opacity-90 transition-fast"
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1" width="3" height="10"/><rect x="7" y="1" width="3" height="10"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><polygon points="2,1 11,6 2,11"/></svg>
            )}
          </button>
          <button onClick={next} className="text-ff-text-secondary hover:text-ff-text transition-fast">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><polygon points="2,1 8,7 2,13"/><rect x="1" y="1" width="3" height="12"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-ff-muted text-xs">🔊</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 accent-ff-accent"
          />
        </div>
      </div>
    </div>
  )
}
