'use client'
import { useEffect, useRef } from 'react'

const features = [
  {
    icon: '🔒',
    iconBg: 'bg-forest/10',
    title: 'One Active Loan at a Time',
    desc: 'No stacking. No overextension. Members can only hold one active P2P loan — keeping the marketplace healthy and fair for everyone.',
  },
  {
    icon: '⚡',
    iconBg: 'bg-gold/12',
    title: 'Auto-Debit on Due Date',
    desc: 'Repayments are automatically debited on the agreed date. Predictable for borrowers, reliable for lenders. No chasing, no surprises.',
  },
  {
    icon: '📊',
    iconBg: 'bg-terra/10',
    title: 'Transparent Fees, Always',
    desc: 'Every fee is shown upfront before you commit. No hidden charges. Rates are risk-based and tied to your TrustScore tier.',
  },
  {
    icon: '⭐',
    iconBg: 'bg-forest/10',
    title: 'Lender Performance Bonus',
    desc: 'When the loans you fund repay on time, your TrustScore gets a small bonus — rewarding members who invest in the community.',
  },
]

const exampleStats = [
  { label: 'Amount Funded', value: 'KES 20,000' },
  { label: 'Spread across', value: '4 loans × 7 days' },
  { label: 'Loan Duration', value: '3 – 14 days' },
  { label: 'Return', value: 'Transparent, risk-based' },
  { label: 'TrustScore Boost', value: 'Up to +10 pts' },
]

export default function P2PLending() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    cardRefs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="p2p" className="bg-cream-dark px-8 md:px-16 py-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-0.5 bg-gold" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gold">P2P Lending</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-16">
        <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight max-w-lg">
          Lend to <em className="not-italic text-gold">earn</em>. Borrow with dignity.
        </h2>
        <p className="text-muted text-[17px] leading-relaxed max-w-md">
          Your savings power your community. Fund short 3–14 day loans for fellow SACCO
          members and earn transparent, risk-based returns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-screen-xl mx-auto">
        {/* Feature cards */}
        <div className="flex flex-col gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className="reveal bg-white rounded-2xl p-6 border border-forest/7 shadow-md shadow-forest/5 flex gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0 ${f.iconBg}`}>
                {f.icon}
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-forest mb-1.5">{f.title}</h4>
                <p className="text-[13px] text-muted leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lending example card */}
        <div
          ref={(el) => { cardRefs.current[4] = el }}
          className="reveal"
          style={{ transitionDelay: '0.3s' }}
        >
          <div className="bg-forest rounded-3xl p-8 text-white">
            <h4 className="text-[15px] font-medium text-white/60 mb-6">
              Example — Lending KES 20,000
            </h4>
            <div className="flex flex-col">
              {exampleStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex justify-between items-center py-4 ${
                    i < exampleStats.length - 1 ? 'border-b border-white/8' : ''
                  }`}
                >
                  <span className="text-[14px] text-white/55">{s.label}</span>
                  <strong className="font-playfair text-[18px] text-gold-light">{s.value}</strong>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[12px] text-white/40 leading-relaxed text-center">
              Exact returns shown upfront before you fund. Diversifying across multiple
              borrowers reduces risk and increases your score bonus.
            </p>
          </div>

          {/* Pro tip */}
          <div className="mt-4 bg-gold/10 border border-gold/25 rounded-2xl p-5 flex gap-3 items-start">
            <span className="text-xl">💡</span>
            <div>
              <div className="text-[13px] font-bold text-forest mb-1">Pro Tip</div>
              <p className="text-[12px] text-muted leading-relaxed">
                Keep a healthy savings buffer, repay on time, and diversify small amounts if
                you lend. You'll unlock better terms faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
