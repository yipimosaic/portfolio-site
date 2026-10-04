'use client'
import React, { useEffect, useState } from 'react'
async function json(response) {
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || '操作失败，请重试。')
  return data
}
export default function MusicAdmin() {
  const [tracks, setTracks] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => { fetch('/api/admin/music', { cache: 'no-store' }).then(json).then(d => { setTracks(d.tracks); setLoaded(true) }).catch(e => setMessage(e.message)) }, [])
  async function upload(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    if (files.length + tracks.length > 50 || files.some(f => !/\.mp3$/i.test(f.name) || f.size > 100 * 1024 * 1024 || !f.size)) { setMessage('请选择 MP3，每首不超过 100 MB，列表最多 50 首。'); return }
    setBusy(true)
    try {
      for (let i = 0; i < files.length; i++) {
        setMessage(`正在上传 ${i + 1} / ${files.length}…`)
        const data = await json(await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'audio/mpeg' }, body: files[i] }))
        const name = files[i].name.replace(/\.mp3$/i, '')
        const parts = name.split(' - ')
        setTracks(t => [...t, { id: crypto.randomUUID(), title: parts.length > 1 ? parts.slice(1).join(' - ') : name, artist: parts.length > 1 ? parts[0] : '', url: data.url }])
      }
      setMessage('上传完成，可修改歌名。点击“保存音乐列表”后生效。')
    } catch (e) { setMessage(e.message + ' 已上传的歌曲保留在列表中，请保存。') } finally { setBusy(false) }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true)
    try { await json(await fetch('/api/admin/music', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tracks }) })); setMessage('音乐列表已保存，刷新作品集即可收听。') }
    catch (e) { setMessage(e.message) } finally { setBusy(false) }
  }
  function edit(index, key, value) { setTracks(t => t.map((track, i) => i === index ? { ...track, [key]: value } : track)) }
  function move(index, offset) { setTracks(t => { const copy = [...t]; [copy[index], copy[index + offset]] = [copy[index + offset], copy[index]]; return copy }) }
  return <section className="music-admin" id="music-admin">
    <div className="admin-panel-heading"><div><p className="admin-kicker">SOUND LIBRARY / 背景音乐</p><h2>音乐管理</h2></div></div>
    <p className="admin-muted">上传 MP3，编辑歌名、歌手和顺序后保存。清空并保存列表可关闭背景音乐功能。</p>
    <form onSubmit={save}><fieldset disabled={busy || !loaded} className="music-admin-fields">
      {tracks.map((track, i) => <div className="music-admin-row" key={track.id}>
        <span>{String(i + 1).padStart(2, '0')}</span>
        <label>歌名<input required maxLength={160} value={track.title} onChange={e => edit(i, 'title', e.target.value)} /></label>
        <label>歌手<input maxLength={160} value={track.artist} onChange={e => edit(i, 'artist', e.target.value)} /></label>
        <audio controls preload="none" src={track.url} aria-label={`试听 ${track.title}`} />
        <div className="music-admin-actions"><button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`上移 ${track.title}`}>↑</button><button type="button" disabled={i === tracks.length - 1} onClick={() => move(i, 1)} aria-label={`下移 ${track.title}`}>↓</button><button type="button" onClick={() => { if (window.confirm(`从列表移除“${track.title}”？保存后生效。`)) setTracks(t => t.filter((_, n) => n !== i)) }}>移除</button></div>
      </div>)}
      <label className="music-upload-label">＋ 上传音乐（可多选）<input type="file" accept=".mp3,audio/mpeg" multiple onChange={upload} /></label>
      <button className="admin-save" type="submit">保存音乐列表 ↗</button>
    </fieldset><p role="status" className="admin-feedback">{message || (!loaded ? '正在读取音乐…' : '')}</p></form>
  </section>
}
