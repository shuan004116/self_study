import { useEffect, useRef, useCallback } from 'react'
import { useMusicStore } from '../store/musicStore'

const NOISE_TYPES = [
  { id: 'rain', label: '雨声', icon: '🌧️' },
  { id: 'ocean', label: '海浪', icon: '🌊' },
  { id: 'forest', label: '森林', icon: '🌲' },
  { id: 'cafe', label: '咖啡馆', icon: '☕' },
  { id: 'fire', label: '壁炉', icon: '🔥' },
  { id: 'wind', label: '微风', icon: '💨' }
]

function createNoiseBuffer(ctx: AudioContext, type: string): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * 4
  const buffer = ctx.createBuffer(2, length, sampleRate)

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      let sample = Math.random() * 2 - 1

      switch (type) {
        case 'rain':
          sample *= 0.3
          if (Math.random() > 0.997) sample += (Math.random() - 0.5) * 2
          break
        case 'ocean': {
          const wave = Math.sin((i / sampleRate) * Math.PI * 0.15) * 0.5 + 0.5
          sample *= 0.4 * wave
          break
        }
        case 'forest':
          sample *= 0.15
          if (Math.random() > 0.999) sample += (Math.random() - 0.5) * 0.8
          break
        case 'cafe':
          sample *= 0.2
          if (Math.random() > 0.998) sample += (Math.random() - 0.5) * 1.5
          break
        case 'fire':
          sample *= 0.25
          if (Math.random() > 0.995) sample += (Math.random() - 0.5) * 3
          break
        case 'wind': {
          const drift = Math.sin((i / sampleRate) * Math.PI * 0.08) * 0.6 + 0.4
          sample *= 0.35 * drift
          break
        }
      }
      data[i] = sample
    }
  }
  return buffer
}

export default function WhiteNoiseMixer() {
  const { whiteNoise, toggleWhiteNoise, setWhiteNoiseTrack } = useMusicStore()
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)

  const cleanup = useCallback(() => {
    sourceRef.current?.stop()
    sourceRef.current?.disconnect()
    sourceRef.current = null
    filterRef.current?.disconnect()
    filterRef.current = null
    gainRef.current?.disconnect()
    gainRef.current = null
    ctxRef.current?.close()
    ctxRef.current = null
  }, [])

  const startNoise = useCallback((type: string, volume: number) => {
    cleanup()

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume / 100 * 0.5, ctx.currentTime)
    gainRef.current = gain

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    filterRef.current = filter

    const buffer = createNoiseBuffer(ctx, type)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sourceRef.current = source

    switch (type) {
      case 'rain':
        filter.type = 'lowpass'
        filter.frequency.value = 3000
        break
      case 'ocean':
        filter.type = 'lowpass'
        filter.frequency.value = 800
        break
      case 'forest':
        filter.type = 'highpass'
        filter.frequency.value = 500
        break
      case 'cafe':
        filter.type = 'bandpass'
        filter.frequency.value = 1500
        filter.Q.value = 0.5
        break
      case 'fire':
        filter.type = 'lowpass'
        filter.frequency.value = 2500
        break
      case 'wind':
        filter.type = 'lowpass'
        filter.frequency.value = 600
        break
    }

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  }, [cleanup])

  useEffect(() => {
    if (whiteNoise.enabled) {
      startNoise(whiteNoise.track, whiteNoise.volume)
    } else {
      cleanup()
    }
    return cleanup
  }, [whiteNoise.enabled])

  useEffect(() => {
    if (!whiteNoise.enabled) return
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(
        whiteNoise.volume / 100 * 0.5,
        ctxRef.current.currentTime + 0.3
      )
    }
  }, [whiteNoise.volume, whiteNoise.enabled])

  useEffect(() => {
    if (!whiteNoise.enabled) return
    startNoise(whiteNoise.track, whiteNoise.volume)
  }, [whiteNoise.track])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-ff-muted uppercase tracking-wider">白噪音</h3>
        <button
          onClick={toggleWhiteNoise}
          className={`w-8 h-4 rounded-full transition-fast ${whiteNoise.enabled ? 'bg-ff-accent' : 'bg-ff-border'}`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-fast ${whiteNoise.enabled ? 'ml-5' : 'ml-0.5'}`} />
        </button>
      </div>

      {whiteNoise.enabled && (
        <div className="grid grid-cols-3 gap-1.5">
          {NOISE_TYPES.map((noise) => (
            <button
              key={noise.id}
              onClick={() => setWhiteNoiseTrack(noise.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-card text-xs transition-fast ${
                whiteNoise.track === noise.id
                  ? 'bg-ff-accent/10 text-ff-accent'
                  : 'bg-ff-surface text-ff-text-secondary hover:bg-ff-border'
              }`}
            >
              <span>{noise.icon}</span>
              <span>{noise.label}</span>
            </button>
          ))}
        </div>
      )}

      {whiteNoise.enabled && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-ff-muted">音量</span>
          <input
            type="range"
            min={0}
            max={100}
            value={whiteNoise.volume}
            onChange={(e) => {
              const vol = Number(e.target.value)
              useMusicStore.getState().setWhiteNoiseTrack(whiteNoise.track)
              useMusicStore.setState((s) => ({
                whiteNoise: { ...s.whiteNoise, volume: vol }
              }))
            }}
            className="flex-1 h-1 accent-ff-accent"
          />
        </div>
      )}
    </div>
  )
}
