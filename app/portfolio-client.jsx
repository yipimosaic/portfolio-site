'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { site } from './content'
import { initMotion } from './motion'
import PatternWaves from './components/PatternWaves'

const Arrow = ({ diagonal = false }) => <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>
const AsteriskMark = ({ className = '' }) => <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false"><path d="M50 5v90M5 50h90M18 18l64 64M82 18 18 82" stroke="currentColor" strokeWidth="5" strokeLinecap="square" /></svg>

export default function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)
  const [activeGallery, setActiveGallery] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [projects, setProjects] = useState(site.projects)
  const videoDialogRef = useRef(null)
  const galleryDialogRef = useRef(null)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/projects', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Projects unavailable')))
      .then(data => { if (!cancelled && Array.isArray(data.projects)) setProjects(data.projects) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const dialog = videoDialogRef.current
    if (!dialog) return
    if (activeVideo && !dialog.open) {
      dialog.showModal()
      dialog.querySelector('video')?.play().catch(() => {})
    } else if (!activeVideo && dialog.open) {
      dialog.close()
    }
  }, [activeVideo])

  useEffect(() => {
    const dialog = galleryDialogRef.current
    if (!dialog) return
    if (activeGallery && !dialog.open) dialog.showModal()
    else if (!activeGallery && dialog.open) dialog.close()
  }, [activeGallery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => initMotion(), [])

  return <>
    <div className="opening-screen" aria-hidden="true">
      <div className="opening-panel opening-panel--top" />
      <div className="opening-panel opening-panel--bottom" />
      <div className="opening-content">
        <div className="opening-index mono"><span>VISUAL PORTFOLIO</span><span>01 / OPENING</span></div>
        <div className="opening-type-mask">
          <div className="opening-type" aria-label="WELCOME TO THE WORLD OF YIPIMASAIKE">
            <span className="opening-type-line">WELCOME TO</span>
            <span className="opening-type-line opening-type-line--blur">THE WORLD OF</span>
            <span className="opening-type-line">YIPIMASAIKE</span>
          </div>
        </div>
        <div className="opening-progress"><span className="opening-progress-bar" /></div>
        <div className="opening-foot mono"><span>DIRECTED WITH INTENTION</span><span>EST. 2026</span></div>
      </div>
    </div>
    <header className={`nav-shell${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand" href="#home" onClick={closeMenu} aria-label="返回首页">
        <span className="brand-box">{site.mark}</span><span>INDEPENDENT IMAGE MAKER</span>
      </a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'CLOSE ×' : 'MENU +'}</button>
      <nav id="main-nav" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="主导航">
        <a href="#about" onClick={closeMenu}>关于 / ABOUT</a>
        <a href="#work" onClick={closeMenu}>作品 / WORK</a>
        <a href="#strengths" onClick={closeMenu}>能力 / SERVICES</a>
        <a className="nav-contact" href="#contact" onClick={closeMenu}>联系我 <Arrow diagonal /></a>
      </nav>
    </header>

    <main>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <video className="hero-video" autoPlay muted loop playsInline poster="/media/project-03.jpg" aria-hidden="true"><source src="/media/hero-motion.webm" type="video/webm" /></video>
        <div className="hero-shade" />
        <div className="hero-grain" />
        <div className="hero-inner container">
          <div className="hero-topline mono"><span>VISUAL PORTFOLIO / 2026</span><span>AVAILABLE FOR COLLABORATION <i className="status-dot" /></span></div>
          <div className="hero-center">
            <p className="eyebrow">DIRECTOR · ART DIRECTOR · DOP · VISUAL DESIGNER</p>
            <h1 id="hero-title">{site.heroTitle.map((line, i) => <span className={i === 1 ? 'blur-line' : ''} key={line}>{line}</span>)}</h1>
            <div className="hero-bottom-copy"><p>{site.heroStatement}</p><p>{site.heroSubline}</p></div>
          </div>
          <div className="hero-bottom mono"><a href="#work">SCROLL TO EXPLORE <span>↓</span></a><span>01 / 05</span><span>IMAGES SHAPE STORIES.</span></div>
        </div>
      </section>

      <div className="wave-sections">
        <div className="wave-backdrop" aria-hidden="true">
          <PatternWaves preset="silk" color="#ffffff" backgroundColor="#0b0c0b" speed={0.22} scale={1.25} opacity={0.55} fade="edges" intro={false} interactive cursorSize={50} cursorStrength={0.35} />
          <div className="wave-backdrop-shade" />
        </div>
      <section className="about section-pad" id="about" aria-labelledby="about-heading">
        <div className="container">
          <SectionIntro index="01" label="THE PERSON BEHIND THE FRAME" />
          <div className="about-grid">
            <div className="about-left"><p className="section-kicker">导演 / 美术指导 / 摄影指导 / 视觉设计师</p><h2 id="about-heading">VISUALS<br /><em>THAT SPEAK.</em></h2><div className="about-photo">{site.portrait ? <img src={site.portrait} alt="个人肖像" /> : <div className="portrait-placeholder"><span className="portrait-cross">+</span><span className="mono">PORTRAIT<br />TO BE ADDED</span></div>}<span className="photo-tag mono">FIG. 01 / PROFILE</span></div></div>
            <div className="about-right"><p className="about-lead">{site.introduction}</p><div className="about-contact mono"><span>CONTACT / 合作联系</span><a href={`mailto:${site.email}`}>{site.email} <Arrow diagonal /></a><a href={`tel:${site.phone}`}>{site.phone} <Arrow diagonal /></a><span>WECHAT / {site.wechat}</span></div></div>
          </div>
          <div className="stats">{site.stats.map(item => <div className="stat" key={item.label}><strong>{item.value}</strong><span className="mono">{item.label}</span></div>)}</div>
        </div>
      </section>

      <section className="work section-pad" id="work" aria-labelledby="work-heading">
        <div className="container"><SectionIntro index="02" label="SELECTED WORKS / 作品精选" /><div className="work-heading"><h2 id="work-heading">SELECTED<br /><span>WORKS<span className="period">.</span></span></h2></div><div className="project-grid">{projects.map((project, index) => <article className={`project-card project-${index + 1}`} key={project.id || project.no}><ProjectImage project={project} onPlay={() => setActiveVideo(project)} onBrowse={() => { setActiveGallery(project); setGalleryIndex(0) }} /><div className="project-meta"><span className="mono">{project.no} / {project.category}</span><span className="mono">{project.year}</span></div><h3>{project.title}</h3><p className="mono project-en">{project.english}</p>{project.description && <p className="project-description">{project.description}</p>}</article>)}</div></div>
      </section>

      <section className="strengths section-pad" id="strengths" aria-labelledby="strengths-heading"><div className="container"><SectionIntro index="03" label="WHAT I BRING TO THE FRAME" /><div className="strength-head"><h2 id="strengths-heading">ONE VISION.<br /><em>FOUR LENSES.</em></h2><p>从方向到细节，<br />让每个环节服务同一个视觉目标。</p></div><div className="strength-grid">{site.strengths.map(item => <article className="strength-card" key={item.num}><div className="strength-card-top mono"><span>{item.num} / 04</span><span>↗</span></div><div><span className="strength-symbol" aria-hidden="true">{item.num === '03' ? <AsteriskMark /> : item.num === '01' ? '◯' : item.num === '02' ? '▧' : '⌁'}</span><h3>{item.title}</h3><p className="mono strength-en">{item.en}</p><p className="strength-text">{item.text}</p></div></article>)}</div></div></section>

      <footer className="contact" id="contact"><div className="container contact-inner"><div className="contact-top mono"><span>04 / LET'S MAKE SOMETHING MATTER</span><span>{site.location}</span></div><div className="contact-main"><p>有想法？让我们聊聊。</p><h2>LET'S<br /><em>CREATE.</em></h2><a className="email-button" href={`mailto:${site.email}`}>发起合作 <Arrow diagonal /></a></div><div className="contact-bottom"><div><span className="mono">EMAIL</span><a href={`mailto:${site.email}`}>{site.email}</a></div><div><span className="mono">PHONE</span><a href={`tel:${site.phone}`}>{site.phone}</a></div><div><span className="mono">WECHAT</span><span>{site.wechat}</span></div><div className="footer-tools"><a href="/admin" className="admin-entry mono">管理项目 ↗</a><a href="#home" className="backtop mono">BACK TO TOP ↑</a></div></div><div className="footer-line mono"><span>© {new Date().getFullYear()} {site.name}</span><span>DIRECTED WITH INTENTION.</span></div></div></footer>
      </div>
    </main>
    <dialog
      ref={videoDialogRef}
      className="video-dialog"
      aria-label={activeVideo ? `${activeVideo.title} 视频` : '作品视频'}
      onClose={() => setActiveVideo(null)}
      onClick={event => { if (event.target === event.currentTarget) setActiveVideo(null) }}
    >
      <div className="video-dialog-inner">
        <div className="video-dialog-top mono"><span>{activeVideo ? `PROJECT ${activeVideo.no} / ${activeVideo.title}` : 'PROJECT VIDEO'}</span><button type="button" onClick={() => setActiveVideo(null)} aria-label="关闭视频">CLOSE ×</button></div>
        {activeVideo && <video key={activeVideo.video} src={activeVideo.video} poster={activeVideo.image} controls playsInline preload="metadata" />}
      </div>
    </dialog>
    <dialog
      ref={galleryDialogRef}
      className="gallery-dialog"
      aria-label={activeGallery ? `${activeGallery.title} 图片图库` : '作品图库'}
      onClose={() => setActiveGallery(null)}
      onClick={event => { if (event.target === event.currentTarget) setActiveGallery(null) }}
    >
      <div className="gallery-dialog-inner">
        <div className="video-dialog-top mono"><span>{activeGallery ? `PROJECT ${activeGallery.no} / ${activeGallery.title} · ${galleryIndex + 1} / ${(activeGallery.gallery || [activeGallery.image]).length}` : 'PROJECT GALLERY'}</span><button type="button" onClick={() => setActiveGallery(null)} aria-label="关闭图库">CLOSE ×</button></div>
        {activeGallery && <>
          <div className="gallery-stage"><img src={(activeGallery.gallery || [activeGallery.image])[galleryIndex]} alt={`${activeGallery.title} ${galleryIndex + 1}`} /></div>
          {(activeGallery.gallery || [activeGallery.image]).length > 1 && <div className="gallery-controls"><button type="button" onClick={() => setGalleryIndex(index => (index - 1 + (activeGallery.gallery || [activeGallery.image]).length) % (activeGallery.gallery || [activeGallery.image]).length)} aria-label="上一张">← PREV</button><div className="gallery-thumbs">{(activeGallery.gallery || [activeGallery.image]).map((image, index) => <button key={image} type="button" className={index === galleryIndex ? 'is-active' : ''} onClick={() => setGalleryIndex(index)}><img src={image} alt="" /></button>)}</div><button type="button" onClick={() => setGalleryIndex(index => (index + 1) % (activeGallery.gallery || [activeGallery.image]).length)} aria-label="下一张">NEXT →</button></div>}
        </>}
      </div>
    </dialog>
  </>
}

function ProjectImage({ project, onPlay, onBrowse }) {
  const galleryCount = (project.gallery || [project.image]).length
  const image = <><img src={project.image} alt={project.alt} loading="lazy" /><span className="image-number mono">FRAME / {project.no}{galleryCount > 1 ? ` · ${galleryCount} IMAGES` : ''}</span><span className="project-arrow" aria-hidden="true">{project.video ? '▶' : '↗'}</span>{project.video && <span className="project-play-label mono">PLAY VIDEO / 播放视频</span>}</>
  return <div className={`project-image${project.video ? ' has-video' : ''}`}>{project.video ? <button className="project-play-button" type="button" onClick={onPlay} aria-label={`播放 ${project.title} 视频`}>{image}</button> : <button className="project-browse-button" type="button" onClick={onBrowse} aria-label={`浏览 ${project.title} 图片`}>{image}</button>}</div>
}

function SectionIntro({ index, label }) { return <div className="section-intro mono"><span>/{index}</span><span>{label}</span><span className="intro-line" /></div> }
