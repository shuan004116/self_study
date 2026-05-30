export const APP_NAME = 'FocusFlow'

export const DEFAULT_TIMER_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 20,
  longBreakInterval: 4,
  autoStartNext: false,
  breakGuidance: true,
  dailyGoal: 8
}

export const PRIORITY_COLORS = {
  P0: '#E06060',
  P1: '#E07A5F',
  P2: '#E8956E',
  P3: '#A39E99'
} as const

export const STATUS_LABELS = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
  archived: '已归档'
} as const

export const BREAK_GUIDANCE = [
  {
    type: 'eye' as const,
    duration: 60,
    steps: ['闭眼休息20秒', '远眺窗外20秒', '眨眼20次']
  },
  {
    type: 'neck' as const,
    duration: 120,
    steps: ['头部缓慢向左倾斜', '保持15秒', '头部缓慢向右倾斜', '保持15秒', '前后各点头5次']
  },
  {
    type: 'stretch' as const,
    duration: 180,
    steps: ['站起来伸展双臂', '向左向右各侧弯', '转动腰部', '活动手腕和脚踝']
  }
]
