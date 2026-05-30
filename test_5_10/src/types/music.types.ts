export type MusicSourceId = 'qqmusic' | 'netease' | 'spotify' | 'local'

export interface MusicSource {
  id: MusicSourceId
  name: string
  isConnected: boolean
}

export interface Track {
  id: string
  source: MusicSourceId
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  filePath?: string
  audioUrl?: string
}

export interface Playlist {
  id: string
  name: string
  source: MusicSourceId
  tracks: Track[]
  isSmartGenerated: boolean
  taskType?: string
}

export type PlayMode = 'sequence' | 'shuffle' | 'single' | 'loop'

export interface WhiteNoise {
  enabled: boolean
  track: string
  volume: number
}

export interface PlayState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  mode: PlayMode
  progress: number
  whiteNoise: WhiteNoise
}
