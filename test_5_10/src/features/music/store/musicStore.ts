import { create } from 'zustand'
import { Track, Playlist, PlayMode, WhiteNoise } from '@/types/music.types'

const SUPPORTED_EXTS = ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma']
const BLOCKED_EXTS = ['mflac', 'mgg', 'mgg1', 'mggl', 'bkcmp3', 'bkcflac', 'ncm', 'qmc0', 'qmc2', 'qmc3']

interface MusicState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  mode: PlayMode
  progress: number
  duration: number
  tracks: Track[]
  playlists: Playlist[]
  whiteNoise: WhiteNoise
  importMessage: string | null
  play: (track?: Track) => void
  pause: () => void
  next: () => void
  previous: () => void
  setVolume: (vol: number) => void
  setMode: (mode: PlayMode) => void
  setProgress: (progress: number) => void
  toggleWhiteNoise: () => void
  setWhiteNoiseTrack: (track: string) => void
  importFiles: () => Promise<void>
  removeTrack: (trackId: string) => void
  clearImportMessage: () => void
}

let audio: HTMLAudioElement | null = null
let audioBlobUrls: string[] = []

function createAudioElement(): HTMLAudioElement {
  if (audio) {
    audio.pause()
    audio.removeAttribute('src')
  }
  audio = new Audio()
  audio.preload = 'auto'
  return audio
}

function stripFileName(name: string): { title: string; artist: string } {
  const cleaned = name.replace(/\.(mp3|flac|wav|ogg|m4a|aac|wma)$/i, '')
  const dashMatch = cleaned.match(/^(.+?)\s*[-–—]\s*(.+)$/)
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() }
  }
  return { title: cleaned, artist: '未知艺术家' }
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 60,
  mode: 'sequence',
  progress: 0,
  duration: 0,
  tracks: [],
  playlists: [],
  whiteNoise: { enabled: false, track: 'rain', volume: 30 },
  importMessage: null,

  play: (track) => {
    const { currentTrack, tracks } = get()
    const trackToPlay = track || currentTrack || tracks[0]
    if (!trackToPlay?.audioUrl) return

    const el = createAudioElement()
    el.src = trackToPlay.audioUrl
    el.volume = get().volume / 100

    el.ontimeupdate = () => {
      set({ progress: Math.floor(el!.currentTime) })
    }
    el.onloadedmetadata = () => {
      set({ duration: Math.floor(el!.duration) })
    }
    el.onended = () => {
      get().next()
    }
    el.onerror = () => {
      set({ isPlaying: false })
    }

    el.play().catch(() => set({ isPlaying: false }))
    set({ currentTrack: trackToPlay, isPlaying: true, progress: 0 })
  },

  pause: () => {
    audio?.pause()
    set({ isPlaying: false })
  },

  next: () => {
    const { currentTrack, tracks, mode } = get()
    if (!currentTrack || tracks.length === 0) return

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    let nextIndex: number

    if (mode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * tracks.length)
    } else if (mode === 'single') {
      nextIndex = currentIndex
    } else {
      nextIndex = (currentIndex + 1) % tracks.length
    }

    get().play(tracks[nextIndex])
  },

  previous: () => {
    const { currentTrack, tracks, progress } = get()
    if (!currentTrack || tracks.length === 0) return

    if (progress > 3) {
      audio!.currentTime = 0
      set({ progress: 0 })
      return
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length
    get().play(tracks[prevIndex])
  },

  setVolume: (vol) => {
    set({ volume: vol })
    if (audio) audio.volume = vol / 100
  },

  setMode: (mode) => set({ mode }),

  setProgress: (progress) => {
    set({ progress })
    if (audio && audio.duration) {
      audio.currentTime = progress
    }
  },

  toggleWhiteNoise: () => {
    set((state) => ({
      whiteNoise: { ...state.whiteNoise, enabled: !state.whiteNoise.enabled }
    }))
  },

  setWhiteNoiseTrack: (track) => {
    set((state) => ({
      whiteNoise: { ...state.whiteNoise, track }
    }))
  },

  importFiles: async () => {
    const api = (window as any).electronAPI
    if (!api?.openMusicFile) return

    const filePaths: string[] = await api.openMusicFile()
    if (!filePaths || filePaths.length === 0) return

    const blocked: string[] = []
    const supported: string[] = []

    for (const filePath of filePaths) {
      const ext = filePath.split('.').pop()?.toLowerCase() || ''
      if (BLOCKED_EXTS.includes(ext)) {
        const name = filePath.split(/[/\\]/).pop() || filePath
        blocked.push(name)
      } else if (SUPPORTED_EXTS.includes(ext)) {
        supported.push(filePath)
      } else {
        const name = filePath.split(/[/\\]/).pop() || filePath
        blocked.push(name)
      }
    }

    if (blocked.length > 0 && supported.length === 0) {
      set({ importMessage: `以下文件格式不支持：${blocked.join('、')}。\n支持格式：mp3、flac、wav、ogg、m4a、aac、wma\n\n提示：QQ音乐的 .mflac/.mgg 和网易云的 .ncm 是加密格式，无法直接播放。请先转为标准格式再导入。` })
      return
    }

    if (blocked.length > 0) {
      set({ importMessage: `${blocked.length} 个文件格式不支持已跳过：${blocked.join('、')}` })
    }

    const newTracks: Track[] = []

    for (const filePath of supported) {
      const fileName = filePath.split(/[/\\]/).pop() || filePath
      const { title, artist } = stripFileName(fileName)

      const buffer: number[] = await api.readAudioData(filePath)
      const uint8 = new Uint8Array(buffer)
      const ext = fileName.split('.').pop()?.toLowerCase() || 'mp3'
      const mimeMap: Record<string, string> = {
        mp3: 'audio/mpeg', flac: 'audio/flac', wav: 'audio/wav',
        ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', wma: 'audio/x-ms-wma'
      }
      const blob = new Blob([uint8], { type: mimeMap[ext] || 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      audioBlobUrls.push(audioUrl)

      newTracks.push({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: 'local',
        title,
        artist,
        album: '本地音乐',
        duration: 0,
        coverUrl: '',
        filePath,
        audioUrl
      })
    }

    for (const track of newTracks) {
      if (track.audioUrl) {
        const probe = new Audio()
        probe.src = track.audioUrl
        await new Promise<void>((resolve) => {
          probe.onloadedmetadata = () => {
            track.duration = Math.floor(probe.duration)
            resolve()
          }
          probe.onerror = () => resolve()
          setTimeout(resolve, 3000)
        })
      }
    }

    set((state) => {
      const allTracks = [...state.tracks, ...newTracks]
      const importPlaylist = state.playlists.find((p) => p.id === 'imported')
      const updatedPlaylists = importPlaylist
        ? state.playlists.map((p) =>
            p.id === 'imported' ? { ...p, tracks: [...p.tracks, ...newTracks] } : p
          )
        : [
            ...state.playlists,
            {
              id: 'imported',
              name: '导入的音乐',
              source: 'local' as const,
              tracks: newTracks,
              isSmartGenerated: false
            }
          ]
      const msg = blocked.length > 0
        ? state.importMessage
        : `成功导入 ${newTracks.length} 首音乐`
      return { tracks: allTracks, playlists: updatedPlaylists, importMessage: msg }
    })
  },

  removeTrack: (trackId) => {
    set((state) => {
      const track = state.tracks.find((t) => t.id === trackId)
      if (track?.audioUrl) {
        URL.revokeObjectURL(track.audioUrl)
        audioBlobUrls = audioBlobUrls.filter((u) => u !== track.audioUrl)
      }
      const newTracks = state.tracks.filter((t) => t.id !== trackId)
      const updatedPlaylists = state.playlists.map((p) => ({
        ...p,
        tracks: p.tracks.filter((t) => t.id !== trackId)
      }))
      if (state.currentTrack?.id === trackId) {
        audio?.pause()
        return { tracks: newTracks, playlists: updatedPlaylists, currentTrack: null, isPlaying: false, progress: 0 }
      }
      return { tracks: newTracks, playlists: updatedPlaylists }
    })
  },

  clearImportMessage: () => set({ importMessage: null })
}))
