import { useState } from 'react'
import NoteList from './NoteList'
import NoteEditor from './NoteEditor'
import FeynmanMode from './FeynmanMode'
import ReviewSchedule from '@/features/review/components/ReviewSchedule'
import { useNoteStore } from '../store/noteStore'
import { useReviewStore } from '@/features/review/store/reviewStore'

export default function NoteView() {
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [showFeynman, setShowFeynman] = useState(false)
  const [feynmanTopic, setFeynmanTopic] = useState('')
  const { createNote } = useNoteStore()
  const { createSchedule } = useReviewStore()

  const handleFeynmanComplete = (explanation: string, score: number) => {
    createNote({
      title: `费曼: ${feynmanTopic}`,
      content: `主题: ${feynmanTopic}\n\n${explanation}\n\n简化度: ${score}分`,
      type: 'feynman'
    })
    setShowFeynman(false)
    setFeynmanTopic('')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ff-text">知识笔记</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowFeynman(true); setFeynmanTopic('') }}
            className="px-4 py-2 bg-ff-accent-secondary/10 text-ff-accent-secondary rounded-card text-sm font-medium hover:bg-ff-accent-secondary/20 transition-fast"
          >
            🧠 费曼学习
          </button>
          <button
            onClick={() => setEditingNote('new')}
            className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast"
          >
            + 新建笔记
          </button>
        </div>
      </div>

      {showFeynman ? (
        <div>
          {!feynmanTopic ? (
            <div className="bg-ff-surface rounded-panel border border-ff-border p-6 animate-fadeUp">
              <h3 className="text-lg font-bold text-ff-text mb-4">费曼学习法</h3>
              <p className="text-sm text-ff-text-secondary mb-4">输入你想学习的主题，用简单的语言解释它。</p>
              <input
                type="text"
                value={feynmanTopic}
                onChange={(e) => setFeynmanTopic(e.target.value)}
                placeholder="例如：什么是递归？"
                className="w-full px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && feynmanTopic.trim() && setShowFeynman(true)}
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowFeynman(false)} className="px-4 py-2 text-sm text-ff-text-secondary">取消</button>
                <button
                  onClick={() => setShowFeynman(true)}
                  disabled={!feynmanTopic.trim()}
                  className="px-4 py-2 bg-ff-accent-secondary text-white rounded-card text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-fast"
                >
                  开始学习
                </button>
              </div>
            </div>
          ) : (
            <FeynmanMode
              topic={feynmanTopic}
              onComplete={handleFeynmanComplete}
              onCancel={() => { setShowFeynman(false); setFeynmanTopic('') }}
            />
          )}
        </div>
      ) : editingNote ? (
        <NoteEditor noteId={editingNote} onClose={() => setEditingNote(null)} />
      ) : (
        <>
          <ReviewSchedule />
          <NoteList onSelect={(id) => setEditingNote(id)} />
        </>
      )}
    </div>
  )
}
