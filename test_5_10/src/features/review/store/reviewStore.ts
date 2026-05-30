import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ReviewSchedule, ReviewHistoryEntry } from '@/types/note.types'
import { generateId } from '@/lib/utils'

interface ReviewState {
  schedules: ReviewSchedule[]
  createSchedule: (noteId: string) => void
  recordReview: (noteId: string, masteryLevel: ReviewHistoryEntry['masteryLevel']) => void
  getDueReviews: () => ReviewSchedule[]
}

const EBBINGHAUS_INTERVALS = [1, 2, 4, 7, 15, 30]

function getNextReviewDate(reviewCount: number): string {
  const interval = EBBINGHAUS_INTERVALS[Math.min(reviewCount, EBBINGHAUS_INTERVALS.length - 1)]
  const date = new Date()
  date.setDate(date.getDate() + interval)
  return date.toISOString()
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      schedules: [],

      createSchedule: (noteId) => {
        const schedule: ReviewSchedule = {
          noteId,
          intervals: EBBINGHAUS_INTERVALS,
          nextReviewDate: getNextReviewDate(0),
          reviewCount: 0,
          mastered: false,
          history: []
        }
        set((state) => ({
          schedules: [...state.schedules.filter((s) => s.noteId !== noteId), schedule]
        }))
      },

      recordReview: (noteId, masteryLevel) => {
        set((state) => ({
          schedules: state.schedules.map((s) => {
            if (s.noteId !== noteId) return s
            const newCount = s.reviewCount + 1
            const newHistory = [...s.history, { date: new Date().toISOString(), masteryLevel }]
            const mastered = masteryLevel >= 4 && newCount >= 3
            return {
              ...s,
              reviewCount: newCount,
              nextReviewDate: mastered ? '' : getNextReviewDate(newCount),
              mastered,
              history: newHistory
            }
          })
        }))
      },

      getDueReviews: () => {
        const now = new Date().toISOString()
        return get().schedules.filter((s) => !s.mastered && s.nextReviewDate <= now)
      }
    }),
    { name: 'focusflow-review' }
  )
)
