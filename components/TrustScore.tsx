'use client'
import { useEffect, useRef } from 'react'

const factors = [
  { label: 'SACCO Savings & Conduct', pct: 45, color: 'bg-forest' },
  { label: 'P2P Repayment Behaviour', pct: 30, color: 'bg-gold' },
  { label: 'Recent Cash-Flow Signals', pct: 15, color: 'bg-terra' },
  { label: 'Identity & Contactability', pct: 10, color: 'bg-muted' },
]

const tiers = [
  { letter: 'A', range: '750–850', perk: 'Up to 70% of savings', bg: 'bg-forest/8 border-forest/20', letterColor: 'text-forest' },
  { letter: 'B', range: '650–749', perk: 'Up to 50% of savings', bg: 'bg-gold/8 border-gold/20', letterColor: 'text-gold' },
  { letter: 'C', range: '550–649', perk: 'Up to 30% of savings', bg: 'bg-terra/7 border-terra/20', letterColor: 'text-terra' },
  { letter: 'D', range: 'Below 550', perk: '0–20% of savings', bg: 'bg-forest/4 border-forest/8', letterColor: 'text-muted' },
]

export default function TrustScore() {
  const cardRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const revealObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    if (cardRef.current) revealObs.observe(cardRef.current)

    const barObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !animated.current) {
            animated.current = true
            const bars = e.target.querySelectorAll<HTMLElement>('[data-width]')
            bars.forEach((bar) => {
              const target = bar.getAttribute('data-width') || '0%'
              bar.style.width = '0%'
              requestAnimationFrame(() => {
                bar.style.transition = 'width 1.2s cubic-bezier(0.34,1.2,0.64,1)'
                bar.style.width = target
              })
            })
          }
        })
      },
      { threshold: 0.3 }
    )
    if (barsRef.current) barObs.observe(barsRef.current)

    return () => { revealObs.disconnect(); barObs.disconnect() }
  }, [])

  return (
    <section id="trust" className="px-8 md:px-16 py-24 bg-cream">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-screen-xl mx-auto">
        {/* Left — copy + tiers */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-0.5 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold">TrustScore</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight mb-5">
            Your reputation, <em className="not-italic text-gold">honestly</em> earned
          </h2>
          <p className="text-muted text-[17px] leading-relaxed max-w-md mb-10">
            Your TrustScore (300–850) is built from real behaviour — savings habits, loan repayments,
            and cash-flow signals. No black boxes. You always see exactly what drives it.
          </p>

          {/* Tier cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {tiers.map((t) => (
              <div
                key={t.letter}
                className={`rounded-xl border p-3.5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default ${t.bg}`}
              >
                <div className={`font-playfair text-[28px] font-black mb-0.5 ${t.letterColor}`}>
                  {t.letter}
                </div>
                <div className="font-mono text-[10px] text-muted mb-2">{t.range}</div>
                <div className="text-[11px] font-semibold text-forest">{t.perk}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — score card */}
        <div ref={cardRef} className="reveal">
          <div className="bg-white rounded-3xl p-9 shadow-2xl shadow-forest/10 border border-forest/8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[15px] font-bold text-forest">TrustScore Breakdown</h4>
              <span className="font-mono text-[11px] text-muted">NAWIRI SCORE</span>
            </div>

            {/* Big score */}
            <div className="font-playfair text-[64px] font-black text-forest leading-none mb-1">742</div>
            <div className="text-[13px] text-muted mb-6">Tier B · 300–850 range</div>

            {/* Bar */}
            <div className="relative h-2.5 rounded-full bg-cream-dark overflow-hidden mb-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: '66%',
                  background: 'linear-gradient(90deg, #b05530 0%, #c8992a 40%, #2d6349 80%, #1a3a2a 100%)',
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-[11px] text-muted mb-8">
              <span>300</span><span>600</span><span>850</span>
            </div>

            {/* Factor bars */}
            <div ref={barsRef} className="flex flex-col gap-4">
              {factors.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-[12px] text-muted min-w-[160px]">{f.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-cream-dark overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.color}`}
                      data-width={`${f.pct}%`}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[12px] font-bold text-forest min-w-[36px] text-right">
                    {f.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
