export type NoteType = 'quick' | 'formal' | 'feynman'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  taskId: string | null
  tags: string[]
  pomodoroId: string | null
  createdAt: string
  updatedAt: string
  reviewSchedule?: ReviewSchedule
}

export interface FeynmanCard {
  id: string
  noteId: string
  topic: string
  userExplanation: string
  simplicityScore: number
  relatedConcepts: string[]
  createdAt: string
}

export interface ReviewSchedule {
  noteId: string
  intervals: number[]
  nextReviewDate: string
  reviewCount: number
  mastered: boolean
  history: ReviewHistoryEntry[]
}

export interface ReviewHistoryEntry {
  date: string
  masteryLevel: 1 | 2 | 3 | 4 | 5
}
