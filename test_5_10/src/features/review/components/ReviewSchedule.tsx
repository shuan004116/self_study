import { useReviewStore } from '../store/reviewStore'
import { useNoteStore } from '@/features/notes/store/noteStore'

export default function ReviewSchedule() {
  const { schedules, recordReview } = useReviewStore()
  const { notes } = useNoteStore()

  const dueReviews = schedules.filter((s) => {
    if (s.mastered) return false
    return new Date(s.nextReviewDate) <= new Date()
  })

  if (dueReviews.length === 0) {
    return (
      <div className="text-center py-8 text-ff-muted text-sm">
        暂无待复习内容
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-ff-text">待复习 ({dueReviews.length})</h3>
      {dueReviews.map((schedule) => {
        const note = notes.find((n) => n.id === schedule.noteId)
        return (
          <div key={schedule.noteId} className="bg-ff-surface rounded-card border border-ff-border p-4">
            <div className="text-sm font-medium text-ff-text mb-1">{note?.title || '未命名笔记'}</div>
            <div className="text-xs text-ff-muted mb-3">已复习 {schedule.reviewCount} 次</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => recordReview(schedule.noteId, level as 1 | 2 | 3 | 4 | 5)}
                  className={`flex-1 py-1.5 rounded-card text-xs font-medium transition-fast ${
                    level <= 2
                      ? 'bg-ff-danger/10 text-ff-danger hover:bg-ff-danger/20'
                      : level === 3
                        ? 'bg-ff-accent/10 text-ff-accent hover:bg-ff-accent/20'
                        : 'bg-ff-success/10 text-ff-success hover:bg-ff-success/20'
                  }`}
                >
                  {level === 1 ? '模糊' : level === 2 ? '困难' : level === 3 ? '一般' : level === 4 ? '熟悉' : '掌握'}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
