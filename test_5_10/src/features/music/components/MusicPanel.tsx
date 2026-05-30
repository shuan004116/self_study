import NowPlaying from './NowPlaying'
import PlayerBar from './PlayerBar'
import { useMusicStore } from '../store/musicStore'

export default function MusicPanel() {
  const { playlists, tracks, importFiles, removeTrack, importMessage, clearImportMessage } = useMusicStore()

  return (
    <div className="space-y-4">
      <NowPlaying />
      <PlayerBar />

      {importMessage && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-card text-xs text-amber-600 whitespace-pre-line relative">
          {importMessage}
          <button
            onClick={clearImportMessage}
            className="absolute top-2 right-2 text-amber-600/60 hover:text-amber-600"
          >
            ×
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider">歌单</h3>
          <button
            onClick={importFiles}
            className="text-xs text-ff-accent hover:text-ff-accent/80 transition-fast"
          >
            + 导入音乐
          </button>
        </div>
        <div className="space-y-1">
          {playlists.map((pl) => (
            <div key={pl.id} className="px-3 py-2 bg-ff-surface rounded-card text-sm text-ff-text hover:bg-ff-border cursor-pointer transition-fast">
              {pl.name}
              <span className="text-ff-muted ml-2 text-xs">{pl.tracks.length}首</span>
            </div>
          ))}
        </div>
      </div>

      {tracks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider mb-2">曲目</h3>
          <div className="space-y-1 max-h-60 overflow-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-2 px-3 py-2 bg-ff-surface rounded-card text-sm text-ff-text hover:bg-ff-border transition-fast group"
              >
                <button
                  onClick={() => useMusicStore.getState().play(track)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="truncate">{track.title}</div>
                  <div className="text-xs text-ff-muted truncate">{track.artist}</div>
                </button>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="text-ff-muted hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-fast"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
