# FocusFlow 待完成事项

> 记录时间：2026-05-10

---

## 一、已完成的功能

### 核心功能
- 4 种计时模式：番茄钟、正向计时、限时任务、习惯打卡
- 任务管理：新建/编辑/删除/项目分组/标签/筛选/搜索
- 任务卡片：项目颜色背景、模式标签、优先级指示条
- 一步式任务创建弹窗（番茄钟页面直接创建）
- 休息引导：眼部/颈部/伸展运动引导
- 笔记系统、复习计划（艾宾浩斯遗忘曲线）
- 音乐播放器、白噪音混合器
- 数据持久化：任务/笔记/复习/计时/设置全部 localStorage 持久化

### 统计模块（刚完成重写）
- 日/周/月/年 四个时间维度
- 6 个子面板：总览、趋势图、分类统计、习惯统计、目标进度、行为分析
- 7 个图表组件：折线图、饼图、柱状图、热力图、日历网格、习惯打卡日历、目标进度条
- CSV + JSON 数据导出

### 设置模块
- 通用/番茄钟/外观/音乐/数据 5 个标签页
- 4 套主题配色预设（暖阳/海洋/森林/樱花）
- 3 种计时器风格（数字/环形/进度条）
- 每日目标、休息引导开关

### UI 优化
- 右侧面板实时显示今日番茄数和专注分钟
- 状态栏显示实际每日目标
- 标题栏窗口控制（最小化/最大化/关闭）
- 最小化图标已修复为 `-`

---

## 二、Electron 打包 — ✅ 已完成

### 解决方案
使用方案 B：跳过代码签名打包。

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win --config.win.signAndEditExecutable=false
```

### 产物
- `release/FocusFlow-1.0.0-Setup.exe`（79MB，NSIS 安装包）

### 打包原理
1. `npx vite build` — 把 React/TS 编译成 HTML/CSS/JS 到 `dist/`
2. `npx electron-builder --win` — 把 `dist/` + `electron/` 打包进 asar，用 NSIS 生成 `.exe` 安装包
3. 产物在 `release/` 目录

---

## 三、未来可优化的方向

### 短期
- 给应用加个自定义图标（目前用默认 Electron 图标）
- 统计页增加「自定义日期范围」筛选
- 专注记录支持按任务名搜索

### 中期
- 音乐播放器接入真实音频文件
- 云端同步（需联网）
- 键盘快捷键支持

### 长期
- 多语言支持
- 插件系统
- 社交/排行榜功能

---

## 四、关键文件路径

| 文件 | 说明 |
|------|------|
| `electron/main.cjs` | Electron 主进程 |
| `electron/preload.cjs` | 预加载脚本 |
| `scripts/dev.cjs` | 开发启动脚本 |
| `electron-builder.yml` | 打包配置 |
| `package.json` | 依赖和脚本 |
| `src/features/stats/` | 统计模块（刚重写） |
| `src/features/timer/` | 计时模块 |
| `src/features/tasks/` | 任务模块 |
| `src/features/settings/` | 设置模块 |
| `src/lib/stats.ts` | 统计计算函数 |
| `src/types/stats.types.ts` | 统计类型定义 |
| `CHANGELOG.md` | 使用指南 + 更新日志 |

---

## 五、启动命令

```bash
# 开发模式（推荐日常使用）
npm run dev

# 仅启动网页版（不启动 Electron）
npm run dev:web

# 打包（需要 VPN 或代理）
npx electron-builder --win
```
