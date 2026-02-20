'use client'
import { useEffect, useRef } from 'react'

const testimonials = [
  {
    quote:
      'In eight months my TrustScore went from 490 to 694. The platform showed me exactly what to fix — I just followed it.',
    name: 'David Kipchoge',
    role: 'Small Business Owner · Eldoret',
    avatar: '🧑🏾',
  },
  {
    quote:
      "I've lent across seven loans and earned good returns — and my TrustScore went up every time members repaid on time. It's a win-win.",
    name: 'Fatuma Abdi',
    role: 'Teacher · Mombasa',
    avatar: '👩🏾',
  },
  {
    quote:
      'The auto-debit took away my anxiety about missing payments. My score climbed steadily and I got access to a bigger loan this quarter.',
    name: 'Samuel Njoroge',
    role: 'Farmer & Trader · Nakuru',
    avatar: '👨🏾',
  },
]

export default function Testimonials() {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    )
    refs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="bg-white px-8 md:px-16 py-24">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-0.5 bg-gold" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">Member Stories</span>
      </div>
      <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight mb-14 max-w-lg">
        Real people, real <em className="not-italic text-gold">growth</em>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            ref={(el) => { refs.current[i] = el }}
            className="reveal bg-cream rounded-2xl p-7 border border-forest/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10 transition-all duration-200"
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className="text-gold text-4xl leading-none mb-4">"</div>
            <p className="text-[15px] text-forest leading-relaxed italic mb-6">{t.quote}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-base flex-shrink-0">
                {t.avatar}
              </div>
              <div>
                <div className="text-[14px] font-bold text-forest">{t.name}</div>
                <div className="text-[12px] text-muted">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
