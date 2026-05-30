import { useState } from 'react'

interface FeynmanModeProps {
  topic: string
  onComplete: (explanation: string, score: number) => void
  onCancel: () => void
}

export default function FeynmanMode({ topic, onComplete, onCancel }: FeynmanModeProps) {
  const [explanation, setExplanation] = useState('')
  const [step, setStep] = useState<'explain' | 'review'>('explain')

  const analyzeSimplicity = (text: string): number => {
    const complexWords = ['实现', '优化', '算法', '架构', '并发', '抽象', '封装', '继承', '多态']
    let score = 100
    complexWords.forEach((word) => {
      if (text.includes(word)) score -= 10
    })
    if (text.length < 50) score -= 20
    return Math.max(0, Math.min(100, score))
  }

  const handleReview = () => {
    setStep('review')
  }

  const handleComplete = () => {
    const score = analyzeSimplicity(explanation)
    onComplete(explanation, score)
  }

  return (
    <div className="bg-ff-surface rounded-panel border border-ff-border p-6 animate-fadeUp">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-ff-text">费曼学习法</h3>
        <button onClick={onCancel} className="text-ff-muted hover:text-ff-text text-sm">✕</button>
      </div>

      <div className="bg-ff-accent/5 border border-ff-accent/20 rounded-card p-4 mb-4">
        <div className="text-xs text-ff-accent mb-1">学习主题</div>
        <div className="text-ff-text font-medium">{topic}</div>
      </div>

      {step === 'explain' ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-ff-text-secondary mb-2">
              用最简单的语言解释这个概念，就好像在教一个完全不懂的人。
            </p>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="用简单的话解释..."
              className="w-full h-40 px-3 py-2 bg-ff-bg border border-ff-border rounded-card text-sm text-ff-text focus:border-ff-accent focus:outline-none resize-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-ff-text-secondary">取消</button>
            <button
              onClick={handleReview}
              disabled={!explanation.trim()}
              className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-fast"
            >
              检查简化度
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-ff-bg rounded-card p-4">
            <div className="text-sm font-medium text-ff-text mb-2">简化度分析</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-ff-border rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${analyzeSimplicity(explanation)}%`,
                    backgroundColor: analyzeSimplicity(explanation) > 70 ? 'var(--success)' : analyzeSimplicity(explanation) > 40 ? 'var(--accent-primary)' : 'var(--danger)'
                  }}
                />
              </div>
              <span className="text-sm font-bold text-ff-text">{analyzeSimplicity(explanation)}分</span>
            </div>
            {analyzeSimplicity(explanation) < 70 && (
              <p className="text-xs text-ff-muted mt-2">
                提示：尝试用更日常的词汇替换专业术语，让外行人也能听懂。
              </p>
            )}
          </div>

          <div className="bg-ff-bg rounded-card p-4">
            <div className="text-sm font-medium text-ff-text mb-1">你的解释</div>
            <p className="text-sm text-ff-text-secondary">{explanation}</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setStep('explain')} className="px-4 py-2 text-sm text-ff-text-secondary">重新写</button>
            <button onClick={handleComplete} className="px-4 py-2 bg-ff-accent text-white rounded-card text-sm font-medium hover:opacity-90 transition-fast">
              保存费曼卡片
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
