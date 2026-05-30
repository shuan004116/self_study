import { useNoteStore } from '../store/noteStore'

interface NoteListProps {
  onSelect: (id: string) => void
}

export default function NoteList({ onSelect }: NoteListProps) {
  const { notes, deleteNote } = useNoteStore()

  if (notes.length === 0) {
    return <div className="text-center text-ff-muted py-12">暂无笔记</div>
  }

  return (
    <div className="grid grid-cols-2 gap-3 flex-1 overflow-auto">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelect(note.id)}
          className="bg-ff-surface rounded-card border border-ff-border p-4 cursor-pointer hover:border-ff-accent/30 transition-fast"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-ff-border text-ff-text-secondary">
              {note.type === 'quick' ? '速记' : note.type === 'feynman' ? '费曼' : '正式'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
              className="text-ff-muted hover:text-ff-danger text-xs"
            >
              删除
            </button>
          </div>
          <h3 className="text-sm font-medium text-ff-text mb-1">{note.title || '无标题'}</h3>
          <p className="text-xs text-ff-muted line-clamp-2">{note.content || '无内容'}</p>
        </div>
      ))}
    </div>
  )
}
