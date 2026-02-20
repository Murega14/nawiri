'use client'
import { useEffect, useRef } from 'react'

function TrustRing({ score = 742 }: { score?: number }) {
  const r = 26
  const circ = 2 * Math.PI * r // ≈ 163.4
  const pct = (score - 300) / (850 - 300)
  const offset = circ * (1 - pct)

  return (
    <div className="relative w-[60px] h-[60px] flex-shrink-0">
      <svg viewBox="0 0 60 60" width="60" height="60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <circle
          cx="30" cy="30" r={r}
          fill="none"
          stroke="#e8b84b"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-medium text-white">
        {score}
      </div>
    </div>
  )
}

export default function DashboardCard() {
  return (
    <div className="relative flex flex-col gap-4">
      {/* Floating badge */}
      <div className="absolute -right-8 top-14 bg-gold text-white rounded-2xl px-4 py-3 shadow-xl shadow-gold/35 text-center animate-float-bob z-10 whitespace-nowrap">
        <strong className="block text-xl font-bold">+18 pts</strong>
        <small className="text-[11px] opacity-85 font-medium">Score boost this month</small>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-forest/10 border border-forest/8 overflow-hidden">
        {/* Dark header */}
        <div className="bg-forest px-7 py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[13px] text-white/60 font-medium">Amina Waweru</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gold-light bg-gold/20 px-3 py-1 rounded-full">
              Fahari SACCO
            </div>
          </div>
          <div className="text-[12px] text-white/50 mb-1">Total Savings</div>
          <div className="font-playfair text-[38px] font-bold text-white leading-tight tracking-tight mb-5">
            <span className="text-[20px] opacity-70 font-normal mr-0.5">KES</span>148,500
          </div>
          <div className="flex items-center gap-4">
            <TrustRing score={742} />
            <div>
              <div className="text-[13px] font-bold text-gold-light">Tier B · Good Terms</div>
              <div className="text-[12px] text-white/50 mt-0.5">TrustScore — up 18 pts this month</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-forest/8">
          <div className="px-6 py-5">
            <div className="text-[11px] text-muted uppercase tracking-wider font-semibold mb-1.5">Available to Borrow</div>
            <div className="font-playfair text-[22px] font-bold text-forest">KES 74,250</div>
            <div className="text-[11px] text-muted mt-0.5">50% of savings · Tier B</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] text-muted uppercase tracking-wider font-semibold mb-1.5">Deposit Streak</div>
            <div className="font-playfair text-[22px] font-bold text-forest">7 months</div>
            <div className="text-[11px] text-muted mt-0.5">Keep it going!</div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl shadow-xl shadow-forest/8 border border-forest/8 divide-y divide-forest/6">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-lg flex-shrink-0">💰</div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-forest">Monthly Deposit</div>
            <div className="text-[12px] text-muted">Received · 2 days ago</div>
          </div>
          <div className="text-right ml-2">
            <div className="text-[15px] font-bold text-forest">+KES 8,000</div>
            <span className="text-[10px] font-semibold bg-forest/10 text-forest-light px-2 py-0.5 rounded-full">On track</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-gold/12 flex items-center justify-center text-lg flex-shrink-0">🤝</div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-forest">P2P Loan Funded</div>
            <div className="text-[12px] text-muted">You lent to 3 members</div>
          </div>
          <div className="text-right ml-2">
            <div className="text-[15px] font-bold text-forest">KES 15,000</div>
            <span className="text-[10px] font-semibold bg-gold/15 text-gold px-2 py-0.5 rounded-full">7 days</span>
          </div>
        </div>
      </div>
    </div>
  )
}
