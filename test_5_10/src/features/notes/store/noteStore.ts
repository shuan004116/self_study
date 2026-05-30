import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Note, NoteType } from '@/types/note.types'
import { generateId } from '@/lib/utils'

interface NoteState {
  notes: Note[]
  createNote: (data: { title?: string; content?: string; type?: NoteType }) => void
  updateNote: (id: string, data: Partial<Note>) => void
  deleteNote: (id: string) => void
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],

      createNote: (data) => {
        const note: Note = {
          id: generateId(),
          title: data.title || '',
          content: data.content || '',
          type: data.type || 'formal',
          taskId: null,
          tags: [],
          pomodoroId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        set((state) => ({ notes: [...state.notes, note] }))
      },

      updateNote: (id, data) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          )
        }))
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
      }
    }),
    { name: 'focusflow-notes' }
  )
)
