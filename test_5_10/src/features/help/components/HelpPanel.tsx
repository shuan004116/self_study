import { useState } from 'react'

interface HelpPanelProps {
  onClose: () => void
}

const SECTIONS = [
  {
    id: 'getting-started',
    title: '快速上手',
    items: [
      { q: '如何开始一个番茄钟？', a: '点击左侧"番茄钟"，选择时长后点击开始按钮。默认工作 25 分钟，休息 5 分钟。' },
      { q: '如何添加任务？', a: '切换到"任务"页面，点击右上角"+"按钮创建新任务。支持设置优先级、标签和项目分组。' },
      { q: '如何记录笔记？', a: '切换到"笔记"页面，点击"新建笔记"。支持快速速记和完整笔记两种模式。' },
      { q: '如何查看统计数据？', a: '切换到"统计"页面，可查看日/周/月/年四个维度的专注数据，包括趋势图、分类统计等。' }
    ]
  },
  {
    id: 'music',
    title: '音乐播放器',
    items: [
      { q: '如何导入本地音乐？', a: '点击右侧面板的"+ 导入"按钮，选择本地音频文件（支持 mp3、flac、wav、ogg、m4a、aac、wma）。可多选。' },
      { q: '导入的音乐格式有要求吗？', a: '支持标准音频格式：mp3、flac、wav、ogg、m4a、aac、wma。\n\n注意：QQ 音乐的 .mflac/.mgg 和网易云的 .ncm 是加密格式，无法直接播放，需要先转为标准格式。' },
      { q: '白噪音怎么用？', a: '右侧面板有白噪音开关，开启后可选择 6 种环境音（雨声、海浪、森林、咖啡馆、壁炉、微风），支持独立音量调节。' },
      { q: '如何切换播放模式？', a: '播放控制栏左侧有模式按钮，点击可切换顺序播放、随机播放、单曲循环。' }
    ]
  },
  {
    id: 'timer',
    title: '番茄钟',
    items: [
      { q: '番茄钟有哪些模式？', a: '支持 4 种模式：番茄钟（默认）、正向计时、限时任务、习惯打卡。可在计时页面切换。' },
      { q: '休息时间怎么设置？', a: '在"设置"→"番茄钟"标签页中，可自定义工作时长、短休息时长、长休息时长。' },
      { q: '休息时有运动引导吗？', a: '有。休息时会显示眼部、颈部、伸展运动引导，帮助缓解疲劳。可在设置中开关。' },
      { q: '专注记录在哪里看？', a: '切换到"统计"页面，可查看所有专注记录，支持按任务名搜索和筛选。' }
    ]
  },
  {
    id: 'tasks',
    title: '任务管理',
    items: [
      { q: '如何给任务分类？', a: '创建任务时可设置项目（用颜色区分）和标签，之后可按项目或标签筛选。' },
      { q: '任务优先级怎么设置？', a: '创建/编辑任务时，可选择高/中/低三个优先级，任务卡片会显示对应颜色的指示条。' },
      { q: '如何搜索任务？', a: '任务页面顶部有搜索框，输入关键词即可搜索任务名称。' }
    ]
  },
  {
    id: 'notes',
    title: '笔记系统',
    items: [
      { q: '笔记有哪些类型？', a: '支持两种：快速速记（右侧面板直接输入）和完整笔记（笔记页面创建，支持标题和内容）。' },
      { q: '什么是复习计划？', a: '基于艾宾浩斯遗忘曲线，系统会在最佳时间提醒你复习笔记，巩固记忆。' }
    ]
  },
  {
    id: 'settings',
    title: '设置',
    items: [
      { q: '如何切换主题？', a: '在"设置"→"外观"标签页，可选择 4 套预设主题（暖阳/海洋/森林/樱花），也可自定义强调色。' },
      { q: '数据会丢失吗？', a: '所有数据（任务、笔记、统计、设置）都保存在本地 localStorage 中，关闭应用不会丢失。' },
      { q: '如何导出数据？', a: '在"设置"→"数据"标签页，支持导出为 CSV 或 JSON 格式。' }
    ]
  },
  {
    id: 'faq',
    title: '常见问题',
    items: [
      { q: '应用打开后一片空白？', a: '尝试重新安装最新版本。如果问题持续，在设置中清除数据后重试。' },
      { q: '音乐播放没有声音？', a: '检查系统音量和应用内音量滑块。如果是导入的文件，确认格式受支持（mp3/flac/wav 等）。' },
      { q: '白噪音不响？', a: '确保白噪音开关已开启，并选择了噪音类型。检查应用内白噪音音量是否为 0。' },
      { q: '统计数据不准确？', a: '统计数据基于本地计时记录。如果中途关闭应用，未完成的计时不会被记录。' }
    ]
  }
]

export default function HelpPanel({ onClose }: HelpPanelProps) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-ff-bg rounded-card shadow-2xl w-[720px] max-h-[80vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-48 bg-ff-bg-secondary border-r border-ff-border p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-ff-text">帮助中心</h2>
            <button onClick={onClose} className="text-ff-muted hover:text-ff-text text-lg">×</button>
          </div>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); setExpandedItem(null) }}
              className={`w-full text-left px-3 py-2 rounded-card text-xs transition-fast ${
                activeSection === section.id
                  ? 'bg-ff-accent/10 text-ff-accent font-medium'
                  : 'text-ff-text-secondary hover:bg-ff-border'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto">
          <h3 className="text-base font-bold text-ff-text mb-4">{currentSection.title}</h3>
          <div className="space-y-2">
            {currentSection.items.map((item, i) => {
              const key = `${activeSection}-${i}`
              const isExpanded = expandedItem === key
              return (
                <div key={key} className="border border-ff-border rounded-card overflow-hidden">
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : key)}
                    className="w-full text-left px-4 py-3 text-sm text-ff-text hover:bg-ff-surface transition-fast flex items-center justify-between"
                  >
                    <span>{item.q}</span>
                    <span className="text-ff-muted text-xs ml-2">{isExpanded ? '−' : '+'}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 text-xs text-ff-text-secondary leading-relaxed whitespace-pre-line border-t border-ff-border pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
