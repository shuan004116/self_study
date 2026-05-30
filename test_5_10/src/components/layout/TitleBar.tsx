import { APP_NAME } from '@/lib/constants'

export default function TitleBar() {
  return (
    <div
      className="h-10 bg-ff-bg-secondary border-b border-ff-border flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <span className="text-ff-accent font-bold text-sm">🍅</span>
        <span className="text-ff-text font-medium text-sm">{APP_NAME}</span>
      </div>
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI?.window.minimize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-ff-border transition-fast text-ff-text-secondary"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8"/></svg>
        </button>
        <button
          onClick={() => window.electronAPI?.window.maximize()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-ff-border transition-fast text-ff-text-secondary"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1" width="10" height="10" rx="1"/></svg>
        </button>
        <button
          onClick={() => window.electronAPI?.window.close()}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-ff-danger/20 transition-fast text-ff-text-secondary hover:text-ff-danger"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l8 8M10 2l-8 8"/></svg>
        </button>
      </div>
    </div>
  )
}
