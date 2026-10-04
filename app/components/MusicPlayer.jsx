'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function MusicPlayer({ suspended }) {
  const audio = useRef(null)
  const [tracks, setTracks] = useState([])
  const [index, setIndex] = useState(0)
  const [wanted, setWanted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [error, setError] = useState('')
  const track = tracks[index]
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/music', { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : Promise.reject()).then(d => setTracks(d.tracks || [])).catch(() => {})
    try { const saved = localStorage.getItem('portfolio-volume'); if (saved !== null && Number.isFinite(Number(saved))) setVolume(Math.min(1, Math.max(0, Number(saved)))) } catch {}
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (audio.current) audio.current.volume = volume
    try { localStorage.setItem('portfolio-volume', String(volume)) } catch {}
  }, [volume, track])
  useEffect(() => {
    const element = audio.current
    if (!element) return
    let cancelled = false
    if (wanted && !suspended && track) {
      element.play().catch(err => {
        if (!cancelled && err.name !== 'AbortError') { setWanted(false); setError('点击播放继续收听') }
      })
    } else element.pause()
    return () => { cancelled = true }
  }, [wanted, suspended, track])
  function next() {
    setError('')
    if (tracks.length === 1) { audio.current.currentTime = 0; if (wanted && !suspended) audio.current.play().catch(() => setWanted(false)) }
    else setIndex(i => (i + 1) % tracks.length)
  }
  if (!track) return null
  return <aside className={`music-widget mono${playing ? ' is-playing' : ''}`} aria-label="背景音乐">
    <audio ref={audio} src={track.url} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={next} onError={() => { setWanted(false); setError('这首暂时无法播放，请切换下一首') }} />
    <div className="music-strip">
      <button className="music-toggle" type="button" aria-label={wanted ? '暂停背景音乐' : '播放背景音乐'} aria-pressed={wanted} onClick={() => { setError(''); setWanted(v => !v) }}>{wanted ? 'Ⅱ' : '▶'}</button>
      <button className="music-expand" type="button" aria-expanded={expanded} aria-controls="music-panel" onClick={() => setExpanded(v => !v)}><span className="music-bars" aria-hidden="true"><i/><i/><i/><i/></span><span>SOUND {suspended && wanted ? '/ HOLD' : playing ? '/ ON' : '/ OFF'}</span><span>{expanded ? '−' : '+'}</span></button>
      <button type="button" className="music-next" onClick={next} aria-label="下一首背景音乐">↦</button>
    </div>
    <div id="music-panel" className="music-panel" hidden={!expanded}>
      <span className="music-counter">{String(index + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')} — NOW SELECTED</span>
      <strong>{track.title}</strong><span className="music-artist">{track.artist}</span>
      <label className="music-volume">VOL <input type="range" min="0" max="100" value={Math.round(volume * 100)} aria-label="背景音乐音量" onChange={e => setVolume(Number(e.target.value) / 100)} /><output>{Math.round(volume * 100)}%</output></label>
      <p className="music-status" role="status">{error || (suspended ? '作品视频播放中 · 音乐暂歇' : 'SOUNDTRACK / 循环播放')}</p>
    </div>
  </aside>
}
