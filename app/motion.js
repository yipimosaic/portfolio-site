import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initMotion() {
  const root = document.getElementById('root')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const hasDeepLink = window.location.hash && window.location.hash !== '#home'
  let active = true

  const context = gsap.context(() => {
    if (reduceMotion) {
      gsap.set('.opening-screen', { display: 'none' })
      return
    }

    if (!hasDeepLink) {
      document.body.classList.add('is-opening')
      const heroLines = gsap.utils.toArray('.hero h1 > span')
      const heroDetails = '.nav-shell, .hero-topline, .eyebrow, .hero-bottom-copy, .hero-bottom'

      gsap.set(heroLines, {
        clipPath: 'inset(100% 0 0 0)',
        yPercent: 64,
        scaleX: 0.78,
        transformOrigin: 'left center'
      })
      gsap.set(heroDetails, { autoAlpha: 0, y: 24 })

      gsap.timeline({
        defaults: { ease: 'power4.out' },
        onComplete: () => {
          document.body.classList.remove('is-opening')
          ScrollTrigger.refresh()
        }
      })
        .set('.opening-screen', { display: 'grid' })
        .from('.opening-index', { y: 45, autoAlpha: 0, duration: 0.7 })
        .from('.opening-type', { yPercent: 100, scaleX: 0.8, autoAlpha: 0, duration: 1.1 }, '-=0.42')
        .fromTo('.opening-progress-bar', { scaleX: 0 }, { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, '-=0.75')
        .to('.opening-content', { autoAlpha: 0, y: -18, duration: 0.3 }, '+=0.13')
        .to('.opening-panel--top', { yPercent: -101, duration: 1.3, ease: 'power4.inOut' }, '-=0.04')
        .to('.opening-panel--bottom', { yPercent: 101, duration: 1.3, ease: 'power4.inOut' }, '<')
        .to(heroLines, {
          clipPath: 'inset(0% 0 0 0)',
          yPercent: 0,
          scaleX: 1,
          duration: 1.55,
          stagger: 0.16,
          ease: 'expo.out'
        }, '<+=0.27')
        .to(heroDetails, { autoAlpha: 1, y: 0, duration: 1.05, stagger: 0.07, ease: 'power3.out' }, '<+=0.32')
        .fromTo('.hero-video', { scale: 1.16 }, { scale: 1.05, duration: 2.2, ease: 'power2.out' }, '<')
        .set('.opening-screen', { display: 'none' })
    } else {
      gsap.set('.opening-screen', { display: 'none' })
    }

    const headingReveal = (trigger, heading, supporting) => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger, start: 'top 78%', once: true }
      })
      timeline
        .from(`${trigger} .section-intro`, {
          clipPath: 'inset(0 100% 0 0)',
          x: -30,
          duration: 0.9,
          ease: 'power3.inOut'
        })
        .from(heading, {
          clipPath: 'inset(0 100% 0 0)',
          x: () => Math.min(window.innerWidth * 0.16, 190),
          y: 80,
          scaleX: 0.77,
          transformOrigin: 'left center',
          duration: 1.65,
          ease: 'power4.out'
        }, '-=0.34')
      if (supporting) {
        timeline.from(supporting, {
          clipPath: 'inset(0 0 100% 0)',
          y: 34,
          duration: 1.05,
          ease: 'power3.out'
        }, '-=0.7')
      }
      return timeline
    }

    headingReveal('#about', '#about-heading', '#about .section-kicker')
    headingReveal('#work', '#work-heading', '#work .work-heading p')
    headingReveal('#strengths', '#strengths-heading', '#strengths .strength-head p')

    gsap.timeline({ scrollTrigger: { trigger: '.about-photo', start: 'top 82%', once: true } })
      .from('.about-photo', { clipPath: 'inset(0 100% 0 0)', x: -75, duration: 1.35, ease: 'power3.inOut' })
      .from('.about-right > *', { clipPath: 'inset(0 0 100% 0)', y: 55, duration: 1.05, stagger: 0.13, ease: 'power3.out' }, '-=0.8')

    gsap.from('.stat', {
      y: 95,
      scaleY: 0.72,
      clipPath: 'inset(0 0 100% 0)',
      transformOrigin: 'top center',
      duration: 1.2,
      stagger: 0.14,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.stats', start: 'top 84%', once: true }
    })

    const projectCards = gsap.utils.toArray('.project-card')
    for (let index = 0; index < projectCards.length; index += 2) {
      const cards = projectCards.slice(index, index + 2)
      const frames = cards.map(card => card.querySelector('.project-image'))
      const images = cards.map(card => card.querySelector('.project-image img'))
      gsap.timeline({ scrollTrigger: { trigger: cards[0], start: 'top 83%', once: true } })
        .from(cards, { y: 110, scale: 0.93, autoAlpha: 0, duration: 1.32, stagger: 0.2, ease: 'power4.out' })
        .from(frames, { clipPath: 'inset(0 100% 0 0)', duration: 1.42, stagger: 0.2, ease: 'power3.inOut' }, 0.1)
        .from(images, { scale: 1.22, duration: 1.7, stagger: 0.2, ease: 'power3.out' }, 0.1)
    }

    if (window.matchMedia('(min-width: 761px)').matches) {
      projectCards.forEach(card => {
        gsap.fromTo(card.querySelector('.project-image img'),
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.25 }
          }
        )
      })
    }

    const strengthCards = gsap.utils.toArray('.strength-card')
    const groupSize = window.innerWidth > 1100 ? 4 : window.innerWidth > 390 ? 2 : 1
    for (let index = 0; index < strengthCards.length; index += groupSize) {
      const cards = strengthCards.slice(index, index + groupSize)
      gsap.from(cards, {
        y: 100,
        scaleY: 0.82,
        clipPath: 'inset(0 0 100% 0)',
        transformOrigin: 'top center',
        duration: 1.35,
        stagger: 0.17,
        ease: 'power4.out',
        scrollTrigger: { trigger: cards[0], start: 'top 82%', once: true }
      })
    }

    gsap.timeline({ scrollTrigger: { trigger: '#contact', start: 'top 76%', once: true } })
      .from('.contact-top', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power3.inOut' })
      .from('.contact-main h2', {
        y: 130,
        scaleX: 0.7,
        clipPath: 'inset(0 100% 0 0)',
        transformOrigin: 'left center',
        duration: 1.8,
        ease: 'power4.out'
      }, '-=0.3')
      .from('.contact-main p, .email-button', { y: 45, clipPath: 'inset(0 0 100% 0)', duration: 1.05, stagger: 0.18, ease: 'power3.out' }, '-=0.8')
      .from('.contact-bottom > *', { y: 55, clipPath: 'inset(0 0 100% 0)', duration: 1, stagger: 0.1, ease: 'power3.out' }, '-=0.58')

    document.fonts?.ready.then(() => {
      if (active) ScrollTrigger.refresh()
    })
  }, root)

  return () => {
    active = false
    document.body.classList.remove('is-opening')
    context.revert()
  }
}
