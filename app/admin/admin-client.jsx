'use client'

import React, { useEffect, useState } from 'react'

const emptyProject = (sortOrder = 1) => ({
  title: '', english: '', category: '', year: '', description: '',
  image: '', video: '', published: true, sortOrder,
})

async function readJson(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || '操作失败，请重试。')
  return data
}

export default function AdminClient() {
  const [projects, setProjects] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(emptyProject())
  const [coverFile, setCoverFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [kind, setKind] = useState('image')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadProjects() {
    const data = await readJson(await fetch('/api/admin/projects', { cache: 'no-store' }))
    setProjects(data.projects)
    return data.projects
  }

  useEffect(() => {
    let mounted = true
    loadProjects().catch(err => { if (mounted) setError(err.message) }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  function choose(project) {
    setSelectedId(project.id)
    setForm({ ...project })
    setKind(project.video ? 'video' : 'image')
    setCoverFile(null)
    setVideoFile(null)
    setNotice('')
    setError('')
    if (window.innerWidth < 840) document.getElementById('project-editor')?.scrollIntoView({ behavior: 'smooth' })
  }

  function addNew() {
    setSelectedId(null)
    setForm(emptyProject(projects.length + 1))
    setKind('image')
    setCoverFile(null)
    setVideoFile(null)
    setNotice('')
    setError('')
    if (window.innerWidth < 840) document.getElementById('project-editor')?.scrollIntoView({ behavior: 'smooth' })
  }

  function field(name, value) { setForm(previous => ({ ...previous, [name]: value })) }

  async function upload(file) {
    const response = await fetch('/api/admin/upload', {
      method: 'POST', headers: { 'Content-Type': file.type }, body: file,
    })
    const data = await readJson(response)
    return data.url
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      let next = { ...form }
      if (coverFile) {
        next.image = await upload(coverFile)
        setForm(previous => ({ ...previous, image: next.image }))
        setCoverFile(null)
      }
      if (kind === 'video' && videoFile) {
        next.video = await upload(videoFile)
        setForm(previous => ({ ...previous, video: next.video }))
        setVideoFile(null)
      }
      if (kind === 'image') next.video = ''
      if (!next.image) throw new Error('请先选择项目封面图片。')
      if (kind === 'video' && !next.video) throw new Error('请先选择项目视频。')
      const endpoint = selectedId ? `/api/admin/projects/${encodeURIComponent(selectedId)}` : '/api/admin/projects'
      const result = await readJson(await fetch(endpoint, {
        method: selectedId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
      }))
      const rows = await loadProjects()
      const saved = rows.find(project => project.id === (selectedId || result.id))
      if (saved) { setSelectedId(saved.id); setForm({ ...saved }); setKind(saved.video ? 'video' : 'image') }
      setNotice(next.published ? '已保存，作品集已同步更新。' : '草稿已保存，暂不在作品集展示。')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!selectedId || !window.confirm(`确定删除“${form.title}”吗？`)) return
    setBusy(true)
    setError('')
    try {
      await readJson(await fetch(`/api/admin/projects/${encodeURIComponent(selectedId)}`, { method: 'DELETE' }))
      const rows = await loadProjects()
      setSelectedId(null)
      setForm(emptyProject(rows.length + 1))
      setKind('image')
      setNotice('项目已删除。')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-root">
    <header className="admin-header">
      <div><p className="admin-kicker">PRIVATE WORKSPACE / 项目管理</p><h1>PROJECT<br /><em>DESK.</em></h1></div>
      <div className="admin-header-actions"><span>{String(projects.length).padStart(2, '0')} PROJECTS</span><a href="/" target="_blank" rel="noreferrer">查看作品集 ↗</a></div>
    </header>

    <div className="admin-layout">
      <aside className="admin-list-panel">
        <div className="admin-panel-heading"><h2>项目列表</h2><button type="button" onClick={addNew}>＋ 添加项目</button></div>
        {loading && <p className="admin-muted">正在读取项目…</p>}
        {!loading && !projects.length && <p className="admin-muted">还没有项目。点击上方按钮添加。</p>}
        <div className="admin-list">{projects.map(project => <button key={project.id} type="button" className={`admin-list-item${selectedId === project.id ? ' is-selected' : ''}`} onClick={() => choose(project)}>
          <span className="admin-list-thumb">{project.image && <img src={project.image} alt="" />}</span>
          <span className="admin-list-copy"><strong>{project.title}</strong><small>{project.video ? 'VIDEO' : 'IMAGE'} · {project.category || '未分类'}</small></span>
          <span className={`admin-list-status${project.published ? '' : ' is-draft'}`}>{project.published ? '已发布' : '草稿'}</span>
        </button>)}</div>
      </aside>

      <section className="admin-editor" id="project-editor">
        <div className="admin-panel-heading"><div><span className="admin-kicker">{selectedId ? 'EDIT PROJECT' : 'NEW PROJECT'}</span><h2>{selectedId ? '编辑项目' : '添加项目'}</h2></div><span className="admin-editor-index">{selectedId ? form.no : '＋'}</span></div>
        <form onSubmit={save}>
          <div className="admin-two-fields"><label>项目名称 <input required maxLength="120" value={form.title} onChange={event => field('title', event.target.value)} placeholder="例如：MG" /></label><label>英文副标题 <input maxLength="160" value={form.english} onChange={event => field('english', event.target.value)} placeholder="例如：MOTION PROJECT" /></label></div>
          <div className="admin-two-fields"><label>项目类别 <input maxLength="120" value={form.category} onChange={event => field('category', event.target.value)} placeholder="例如：动态影像 / 视频" /></label><label>年份 <input maxLength="30" value={form.year} onChange={event => field('year', event.target.value)} placeholder="例如：2026" /></label></div>
          <label>项目内容 / 介绍 <textarea maxLength="2000" rows="4" value={form.description} onChange={event => field('description', event.target.value)} placeholder="介绍创作背景、你的职责或作品亮点。" /></label>

          <fieldset className="admin-type"><legend>作品类型</legend><label><input type="radio" name="kind" checked={kind === 'image'} onChange={() => { setKind('image'); setVideoFile(null) }} /> 图片作品</label><label><input type="radio" name="kind" checked={kind === 'video'} onChange={() => setKind('video')} /> 视频作品</label></fieldset>

          <div className="admin-upload-grid"><label className="admin-upload"><span>封面图片 <b>必填</b></span>{form.image && <img src={form.image} alt="当前封面" />}<strong>{coverFile ? coverFile.name : '选择或更换封面'}</strong><small>JPG / PNG / WEBP / AVIF</small><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => setCoverFile(event.target.files?.[0] || null)} /></label>
            {kind === 'video' && <label className="admin-upload"><span>视频文件 <b>必填</b></span><span className="admin-video-symbol">▶</span><strong>{videoFile ? videoFile.name : form.video ? '已上传视频，可重新选择' : '选择视频'}</strong><small>MP4 / WEBM · 单个文件不超过 100 MB</small><input type="file" accept="video/mp4,video/webm" onChange={event => setVideoFile(event.target.files?.[0] || null)} /></label>}</div>

          <div className="admin-options"><label>展示顺序 <input type="number" min="0" max="9999" value={form.sortOrder} onChange={event => field('sortOrder', event.target.value)} /></label><label className="admin-publish"><input type="checkbox" checked={Boolean(form.published)} onChange={event => field('published', event.target.checked)} /> 在作品集展示</label></div>

          {(notice || error) && <p className={`admin-feedback${error ? ' is-error' : ''}`} role="status">{error || notice}</p>}
          <div className="admin-form-actions"><button className="admin-save" type="submit" disabled={busy}>{busy ? '正在保存…' : selectedId ? '保存修改 ↗' : '发布项目 ↗'}</button>{selectedId && <button className="admin-delete" type="button" disabled={busy} onClick={remove}>删除项目</button>}</div>
        </form>
      </section>
    </div>
  </main>
}
