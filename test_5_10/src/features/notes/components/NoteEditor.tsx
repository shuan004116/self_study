import { useState, useEffect } from 'react'
import { useNoteStore } from '../store/noteStore'

interface NoteEditorProps {
  noteId: string
  onClose: () => void
}

export default function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { notes, createNote, updateNote } = useNoteStore()
  const existing = noteId !== 'new' ? notes.find((n) => n.id === noteId) : null

  const [title, setTitle] = useState(existing?.title || '')
  const [content, setContent] = useState(existing?.content || '')
  const [type, setType] = useState<'quick' | 'formal' | 'feynman'>(existing?.type || 'formal')

  const handleSave = () => {
    if (noteId === 'new') {
      createNote({ title, content, type })
    } else {
      updateNote(noteId, { title, content, type })
    }
    onClose()
  }

  return (
    <div className="flex flex-col flex-1 animate-fadeUp">
      <div className="flex items-center gap-3 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="px-3 py-1.5 bg-ff-surface border border-ff-border rounded-card text-sm text-ff-text"
        >
          <option value="formal">正式笔记</option>
          <option value="quick">速记</option>
          <option value="feynman">费曼笔记</option>
        </select>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="flex-1 px-3 py-1.5 bg-ff-surface border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="开始书写..."
        className="flex-1 px-4 py-3 bg-ff-surface border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none resize-none"
      />
      <div className="flex gap-3 justify-end mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-ff-text-secondary">取消</button>
        <button onClick={handleSave} className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90">
          保存
        </button>
      </div>
    </div>
  )
}
