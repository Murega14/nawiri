'use client'
import { useEffect, useRef } from 'react'

const steps = [
  {
    num: '01',
    title: 'Join a SACCO',
    desc: 'Browse and join an existing SACCO or chama in your area. Complete KYC in minutes with your national ID and phone number.',
  },
  {
    num: '02',
    title: 'Save Consistently',
    desc: 'Make regular deposits to build your savings balance. Every on-time contribution grows your TrustScore automatically.',
  },
  {
    num: '03',
    title: 'Access Loans',
    desc: 'Once your TrustScore qualifies, access SACCO business loans. Repay on time to unlock better terms and higher limits.',
  },
  {
    num: '04',
    title: 'Lend & Earn',
    desc: 'As a trusted member, join the P2P marketplace. Fund short-term loans for fellow members and earn transparent returns.',
  },
]

export default function HowItWorks() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    )
    stepRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="how" className="bg-forest relative overflow-hidden px-8 md:px-16 py-24">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gold/6 blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-0.5 bg-gold-light" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold-light">
            How Nawiri Works
          </span>
        </div>

        <h2 className="font-playfair text-4xl md:text-5xl font-black text-white leading-tight max-w-lg mb-4">
          Your journey to financial{' '}
          <em className="not-italic text-gold">freedom</em>
        </h2>
        <p className="text-white/50 text-[17px] leading-relaxed max-w-lg mb-16">
          From your first deposit to P2P lending — a clear, transparent path with no hidden surprises.
        </p>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* connector line (desktop) */}
          <div
            className="absolute hidden lg:block"
            style={{
              top: 36,
              left: 'calc(12.5% + 16px)',
              right: 'calc(12.5% + 16px)',
              height: 1,
              background:
                'repeating-linear-gradient(to right, rgba(200,153,42,0.4) 0, rgba(200,153,42,0.4) 8px, transparent 8px, transparent 16px)',
            }}
          />
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { stepRefs.current[i] = el }}
              className="step-reveal text-center relative z-10"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className="w-[72px] h-[72px] rounded-full border-2 border-gold/30 bg-white/5 flex items-center justify-center mx-auto mb-6 font-playfair text-2xl font-bold text-gold-light">
                {step.num}
              </div>
              <h3 className="text-white font-bold text-[17px] mb-3">{step.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
