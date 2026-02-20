'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sparkline                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function Sparkline({
  data,
  color = '#2d8c4e',
  fillColor,
  height = 40,
}: {
  data: number[]
  color?: string
  fillColor?: string
  height?: number
}) {
  const max = Math.max(...data), min = Math.min(...data)
  const w = 88, h = height
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - 4 - ((v - min) / (max - min || 1)) * (h - 8)
    return [x, y] as [number, number]
  })
  const polyPts = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const areaPath = `M${pts[0][0]},${h} ${pts.map(([x, y]) => `L${x},${y}`).join(' ')} L${pts[pts.length-1][0]},${h} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-22" style={{ height, width: w }}>
      {fillColor && (
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={fillColor} stopOpacity="0"/>
          </linearGradient>
        </defs>
      )}
      {fillColor && (
        <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`}/>
      )}
      <polyline
        points={polyPts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Score ring                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38, circ = 2 * Math.PI * r
  const pct = (score - 300) / 550
  const tierColor = score >= 750 ? '#e8b84b' : score >= 650 ? '#e8b84b' : '#e8b84b'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={tierColor} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ filter: 'drop-shadow(0 0 4px rgba(232,184,75,0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-black text-white leading-none" style={{ fontSize: size * 0.24 }}>
          {score}
        </span>
        <span className="text-white/35 font-medium leading-none" style={{ fontSize: size * 0.1 }}>
          / 850
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Accordion                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function Accordion({
  title,
  icon,
  children,
  open: defaultOpen = false,
}: {
  title: string
  icon: string
  children: React.ReactNode
  open?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-forest/[0.07] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-3.5 px-5 text-left hover:bg-forest/[0.025] transition-colors"
      >
        <span className="text-[15px] flex-shrink-0">{icon}</span>
        <span className="flex-1 text-[12px] font-semibold text-forest leading-snug">{title}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform text-muted/50 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 text-[11.5px] text-muted leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const SAVINGS_TREND = [62000, 74000, 81000, 88000, 101000, 112000, 124000, 136000, 148500]
const POOL_TREND    = [180000, 210000, 248000, 271000, 295000, 320000, 341000, 351000, 341550]
const SCORE_TREND   = [580, 610, 624, 651, 672, 699, 718, 724, 742]

const TRANSACTIONS = [
  { type: 'deposit',  label: 'Monthly Deposit',       date: '1 Oct 2025',  amount: 8000,  positive: true },
  { type: 'p2p',      label: 'P2P Loan Funded',        date: '28 Sep 2025', amount: 15000, positive: false },
  { type: 'deposit',  label: 'Monthly Deposit',        date: '1 Sep 2025',  amount: 8000,  positive: true },
  { type: 'repay',    label: 'Loan Repayment',         date: '15 Aug 2025', amount: 22000, positive: false },
  { type: 'deposit',  label: 'Monthly Deposit',        date: '1 Aug 2025',  amount: 8000,  positive: true },
  { type: 'interest', label: 'P2P Interest Received',  date: '24 Jul 2025', amount: 1200,  positive: true },
]

const TX_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  deposit:  { bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]', icon: '↑', label: 'Deposit'   },
  p2p:      { bg: 'bg-gold/12',      text: 'text-gold',       icon: '🤝', label: 'P2P Lent'  },
  repay:    { bg: 'bg-terra/10',     text: 'text-terra',      icon: '↓', label: 'Repayment' },
  interest: { bg: 'bg-forest/8',    text: 'text-forest',     icon: '✦', label: 'Interest'  },
}

const SCORE_FACTORS = [
  { label: 'SACCO Savings & Conduct',    pct: 45, desc: 'Real-time balance, recent deposits, on-time SACCO repayments.', color: 'bg-forest' },
  { label: 'P2P Repayment Behaviour',   pct: 30, desc: 'Early/on-time repayment, no loan stacking, no disputes.',        color: 'bg-gold' },
  { label: 'Recent Cash-Flow Signals',  pct: 15, desc: 'Stable inflows (last 30–90 days), demonstrated repay capacity.', color: 'bg-[#2d8c4e]' },
  { label: 'Identity & Contactability', pct: 10, desc: 'KYC level, active phone/email, consistent member details.',      color: 'bg-muted' },
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TrustScore right panel                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function TrustPanel({ score, tier }: { score: number; tier: string }) {
  const pct = ((score - 300) / 550) * 100
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-forest/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0">
            <span className="text-gold text-sm">⭐</span>
          </div>
          <div>
            <p className="font-bold text-forest text-[13px] leading-none">TrustScore Guide</p>
            <p className="text-[10px] text-muted mt-0.5">Nawiri's credit scoring system</p>
          </div>
        </div>

        {/* Score gradient bar */}
        <div className="mb-1">
          <div className="flex justify-between text-[10px] mb-1.5 font-semibold">
            <span className="text-terra">Low · 300</span>
            <span className="text-gold">Your score</span>
            <span className="text-[#2d8c4e]">850</span>
          </div>
          <div className="relative h-2.5 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(to right, #f87171 0%, #fbbf24 50%, #2d8c4e 100%)' }}
          >
            <div
              className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-forest shadow-md"
              style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="font-mono text-[11px] font-bold text-forest bg-forest/8 px-2 py-0.5 rounded-full">
              {score} · Tier {tier}
            </span>
          </div>
        </div>
      </div>

      {/* Accordion content */}
      <div className="flex-1 overflow-y-auto">
        <Accordion title="What factors make up your score" icon="📊" open>
          <div className="space-y-4 mt-1">
            {SCORE_FACTORS.map(f => (
              <div key={f.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11.5px] font-semibold text-forest">{f.label}</span>
                  <span className="text-[11px] font-bold text-forest/60">{f.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mb-1.5">
                  <div className={`h-full ${f.color} rounded-full`} style={{ width: `${f.pct * 2}%` }} />
                </div>
                <p className="text-[10.5px] text-muted/80">{f.desc}</p>
              </div>
            ))}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11.5px] font-semibold text-forest">Lender Performance Bonus</span>
                <span className="text-[11px] font-bold text-[#2d8c4e]">+10</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mb-1.5">
                <div className="h-full bg-[#2d8c4e]/40 rounded-full" style={{ width: '10%' }} />
              </div>
              <p className="text-[10.5px] text-muted/80">Awarded when loans you fund repay on time.</p>
            </div>
          </div>
        </Accordion>

        <Accordion title="How to improve your score" icon="📈">
          <div className="space-y-2.5 mb-4 mt-1">
            {[
              ['Repay on or before the due date',        'Biggest impact'],
              ['Keep a healthy savings buffer',          'High impact'],
              ['Maintain a 30–90 day deposit streak',    'High impact'],
              ['Diversify small P2P loans',              'Score bonus'],
            ].map(([t, i]) => (
              <div key={t} className="flex gap-2">
                <span className="text-[#2d8c4e] flex-shrink-0 font-bold text-sm">✓</span>
                <div>
                  <p className="text-[11px] text-forest font-medium">{t}</p>
                  <span className="text-[10px] font-bold text-[#2d8c4e]">{i}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10.5px] font-bold text-terra uppercase tracking-wide mb-2 mt-3">What hurts your score</p>
          {[
            'Late or missed payments',
            'Borrowing too close to savings balance',
            'Multiple active loans (stacking)',
            'Unresolved disputes',
          ].map(h => (
            <div key={h} className="flex gap-1.5 text-[11px] text-muted mb-1.5">
              <span className="text-terra flex-shrink-0">✕</span>
              {h}
            </div>
          ))}
        </Accordion>

        <Accordion title="Lend to earn — and grow your score" icon="💰">
          <p className="mb-3 mt-1">Fund fellow member loans for 3–14 days. Earn transparent returns and a Lender Performance Bonus.</p>
          <div className="bg-cream rounded-xl p-3 space-y-2 border border-forest/8">
            {[
              ['You fund', 'KES 20,000'],
              ['Spread across', '4 loans × 7 days'],
              ['Return', 'Transparent, risk-based'],
              ['Score boost', 'Up to +10 pts'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[11px]">
                <span className="text-muted">{l}</span>
                <span className="font-bold text-forest">{v}</span>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Tier limits & pricing" icon="📊">
          <div className="space-y-2.5 mt-1">
            {[
              { t: 'Tier A · 750–850', p: 'Up to 2× savings · 8.5% p.a.',  c: 'bg-[#2d8c4e] text-white' },
              { t: 'Tier B · 650–749', p: 'Up to 1.5× savings · 10.5% p.a.', c: 'bg-gold text-white' },
              { t: 'Tier C · 550–649', p: 'Up to 1× savings · 13.0% p.a.',  c: 'bg-terra text-white' },
              { t: 'Tier D · <550',    p: 'Limited access · 15%+ p.a.',     c: 'bg-muted text-white' },
            ].map(x => (
              <div key={x.t} className="flex items-start gap-2.5">
                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg flex-shrink-0 leading-none mt-0.5 ${x.c}`}>
                  {x.t.split('·')[0].trim()}
                </span>
                <div>
                  <p className="text-[10.5px] font-semibold text-forest">{x.t.split('·').slice(1).join('·').trim()}</p>
                  <p className="text-[10px] text-muted">{x.p}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted italic">All fees shown upfront — no hidden charges.</p>
        </Accordion>
      </div>

      {/* Footer tip */}
      <div className="px-5 py-3.5 border-t border-forest/[0.07] bg-gold/[0.04] flex-shrink-0">
        <p className="text-[10.5px] text-forest/70 font-medium leading-relaxed">
          💡 Keep a healthy savings buffer, repay on time, and diversify if you lend — you'll unlock better terms faster.
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Dashboard page                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ede8de' }}>
        <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
      </div>
    )
  }

  /* Derived values */
  const tierMeta: Record<string, { label: string; borrowPct: number; rateLabel: string }> = {
    A: { label: 'Best Terms',  borrowPct: 0.70, rateLabel: '8.5%' },
    B: { label: 'Good Terms',  borrowPct: 0.50, rateLabel: '10.5%' },
    C: { label: 'Standard',    borrowPct: 0.30, rateLabel: '13.0%' },
    D: { label: 'Strict',      borrowPct: 0.10, rateLabel: '15.0%' },
  }
  const tier        = tierMeta[user.tier] ?? tierMeta.D
  const borrowMax   = Math.round(user.savings * tier.borrowPct)
  const poolTotal   = Math.round(user.savings * 2.3)
  const outstanding = Math.round(user.savings * 0.185)

  /* Greeting */
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const KPI_CARDS = [
    {
      label: 'Total Savings',
      value: `KES ${user.savings.toLocaleString()}`,
      sub: '+KES 8,000 this month',
      delta: '+5.7%',
      deltaPos: true,
      trend: SAVINGS_TREND,
      trendColor: '#2d8c4e',
      fillColor: '#2d8c4e',
      icon: '💰',
      href: '/savings',
    },
    {
      label: 'SACCO Pool',
      value: `KES ${poolTotal.toLocaleString()}`,
      sub: '5 active members',
      delta: '+3.1%',
      deltaPos: true,
      trend: POOL_TREND,
      trendColor: '#c8992a',
      fillColor: '#c8992a',
      icon: '🏦',
      href: '/sacco',
    },
    {
      label: 'Available to Borrow',
      value: `KES ${borrowMax.toLocaleString()}`,
      sub: `${Math.round(tier.borrowPct * 100)}% of savings · Tier ${user.tier}`,
      delta: tier.rateLabel,
      deltaPos: true,
      trend: null,
      trendColor: '#1a3a2a',
      fillColor: null,
      icon: '🏷️',
      href: '/loans',
    },
    {
      label: 'TrustScore',
      value: String(user.trustScore),
      sub: `Tier ${user.tier} · ${tier.label}`,
      delta: '+16 pts',
      deltaPos: true,
      trend: SCORE_TREND,
      trendColor: '#e8b84b',
      fillColor: '#e8b84b',
      icon: '⭐',
      href: '/profile',
    },
  ]

  return (
    <DashboardShell rightPanel={<TrustPanel score={user.trustScore} tier={user.tier} />}>
      <div className="space-y-5 w-full">

        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #1a3c2b 0%, #1e4530 50%, #162f22 100%)' }}
        >
          {/* Decorative */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-[0.04]"
              style={{ background: 'radial-gradient(circle, #e8b84b 0%, transparent 70%)' }} />
            <div className="absolute -bottom-16 right-40 w-52 h-52 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.015]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,1) 39px, rgba(255,255,255,1) 40px)' }}
            />
          </div>

          <div className="relative px-6 py-6 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Score ring */}
              <div className="relative">
                <ScoreRing score={user.trustScore} size={80} />
                {/* Glow */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: '0 0 32px rgba(232,184,75,0.08)' }} />
              </div>

              {/* Identity */}
              <div className="flex-1">
                <p className="text-white/40 text-[12px] font-medium mb-0.5">{greeting} 👋</p>
                <h2 className="font-playfair text-[22px] sm:text-[26px] font-black text-white leading-none">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gold/20 text-gold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Tier {user.tier} · {tier.label}
                  </span>
                  <span className="text-[11px] text-white/35">{user.sacco}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-[11px] text-white/35">Since {user.memberSince}</span>
                  {user.depositStreak > 0 && (
                    <span className="text-[11px] font-semibold bg-white/10 text-white/65 px-2.5 py-1 rounded-full">
                      🔥 {user.depositStreak}-month streak
                    </span>
                  )}
                </div>
              </div>

              {/* Total savings — desktop only */}
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-white/35 text-[10px] uppercase tracking-widest mb-1 font-medium">Total Savings</p>
                <p className="font-playfair text-[32px] font-black text-white leading-none">
                  KES {user.savings.toLocaleString()}
                </p>
                <p className="text-[#2d8c4e] text-[11px] mt-1.5 font-semibold">
                  ↑ +KES 8,000 this month
                </p>
              </div>
            </div>

            {/* Progress to next tier */}
            {user.tier !== 'A' && (
              <div className="mt-5 pt-4 border-t border-white/[0.08]">
                <div className="flex justify-between text-[10px] mb-2">
                  <span className="text-white/40 font-medium">Progress to Tier {user.tier === 'B' ? 'A' : 'B'}</span>
                  <span className="text-white/60 font-bold">
                    {user.trustScore} / {user.tier === 'B' ? '750' : '650'}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        user.tier === 'B'
                          ? ((user.trustScore - 650) / 100) * 100
                          : ((user.trustScore - 550) / 100) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {KPI_CARDS.map((card) => {
            const inner = (
              <div
                className="bg-white rounded-2xl p-4 border border-black/[0.05] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-forest/[0.05] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  {card.trend ? (
                    <Sparkline data={card.trend} color={card.trendColor} fillColor={card.fillColor ?? undefined} height={32} />
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.deltaPos ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-terra/10 text-terra'
                    }`}>
                      {card.delta}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wide mb-1">{card.label}</p>
                <p className="font-playfair text-[18px] sm:text-[20px] font-black text-forest leading-tight">
                  {card.value}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10.5px] text-muted">{card.sub}</p>
                  {card.trend && (
                    <span className={`text-[10px] font-bold ${card.deltaPos ? 'text-[#2d8c4e]' : 'text-terra'}`}>
                      {card.delta}
                    </span>
                  )}
                </div>
              </div>
            )
            return card.href ? (
              <a key={card.label} href={card.href}>{inner}</a>
            ) : (
              <div key={card.label}>{inner}</div>
            )
          })}
        </div>

        {/* ── Middle row: Chama + Loan eligibility ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Chama card */}
          <div
            className="lg:col-span-2 rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #2d7a4e 0%, #2d8c4e 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.05] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/[0.03] -translate-x-8 translate-y-8 pointer-events-none" />

            <div className="relative">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-white/45 text-[10px] uppercase tracking-widest font-medium mb-0.5">Your Chama</p>
                  <h3 className="font-playfair text-[18px] font-black text-white leading-tight">{user.sacco}</h3>
                </div>
                <div className="bg-white/15 rounded-xl p-2 backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" className="w-4 h-4">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl px-3 py-2.5">
                  <p className="text-white/45 text-[9px] uppercase tracking-wider mb-1 font-medium">Total Pool</p>
                  <p className="font-playfair text-[18px] font-black leading-none">KES {(poolTotal/1000).toFixed(0)}k</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2.5">
                  <p className="text-white/45 text-[9px] uppercase tracking-wider mb-1 font-medium">Members</p>
                  <p className="font-playfair text-[18px] font-black leading-none">5 active</p>
                </div>
              </div>

              <div className="pt-3.5 border-t border-white/15">
                <div className="flex justify-between text-[11px] mb-2">
                  <span className="text-white/50 font-medium">Group Health</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden mb-1.5">
                  <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
                </div>
                <p className="text-white/35 text-[10px]">Repayment rate — Excellent standing</p>
              </div>
            </div>
          </div>

          {/* Loan eligibility card */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-black/[0.05] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-muted font-medium uppercase tracking-wide mb-0.5">Loan Eligibility</p>
                <h3 className="font-bold text-forest text-[15px]">Business &amp; Personal Loans</h3>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                user.tier === 'A' ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' :
                user.tier === 'B' ? 'bg-gold/15 text-gold' :
                'bg-terra/10 text-terra'
              }`}>
                Tier {user.tier} rates
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Max Loan',    value: `KES ${(borrowMax/1000).toFixed(0)}k` },
                { label: 'Interest',   value: tier.rateLabel + ' p.a.' },
                { label: 'Multiplier', value: user.tier === 'A' ? '2× savings' : user.tier === 'B' ? '1.5× savings' : '1× savings' },
              ].map(s => (
                <div key={s.label} className="bg-cream/80 rounded-xl p-3.5 text-center border border-forest/[0.05]">
                  <p className="text-[10px] text-muted mb-1.5 font-medium">{s.label}</p>
                  <p className="font-playfair text-[15px] font-black text-forest">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-3.5 border-t border-b border-forest/[0.06] mb-5">
              <div>
                <p className="text-[10px] text-muted font-medium mb-0.5">Outstanding</p>
                <p className="font-playfair text-[17px] font-black text-terra">KES {outstanding.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-forest/10" />
              <div className="text-right">
                <p className="text-[10px] text-muted font-medium mb-0.5">Next Payment</p>
                <p className="font-bold text-forest text-[13px]">15 Oct · KES 1,354</p>
              </div>
              <div className="w-px h-8 bg-forest/10" />
              <div className="text-right">
                <p className="text-[10px] text-muted font-medium mb-0.5">Active Loans</p>
                <p className="font-bold text-forest text-[13px]">1 of 3 slots</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a href="/loans">
                <button className="w-full bg-forest text-white text-[12px] font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-forest/90 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                  Apply for Loan
                </button>
              </a>
              <a href="/loans">
                <button className="w-full bg-cream border border-forest/15 text-forest text-[12px] font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 hover:border-forest/30 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20z"/>
                  </svg>
                  Loan Wallet
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* ── Action tiles ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: '↑',
              label: 'Contribute',
              sub: 'Add to your pool',
              bg: 'bg-white',
              iconBg: 'bg-[#2d8c4e]/10 text-[#2d8c4e]',
              text: 'text-forest',
              sub2: 'text-muted',
              href: '/savings',
            },
            {
              icon: '🤝',
              label: 'Lend via P2P',
              sub: 'Earn competitive returns',
              bg: 'bg-white',
              iconBg: 'bg-gold/12 text-gold',
              text: 'text-forest',
              sub2: 'text-muted',
              href: '/p2p',
            },
            {
              icon: '💼',
              label: 'Business Loan',
              sub: 'Based on your TrustScore',
              bg: 'bg-terra',
              iconBg: 'bg-white/20 text-white',
              text: 'text-white',
              sub2: 'text-white/60',
              href: '/loans',
            },
            {
              icon: '⚡',
              label: 'Quick Loan',
              sub: 'For personal needs',
              bg: 'bg-gold',
              iconBg: 'bg-white/20 text-white',
              text: 'text-white',
              sub2: 'text-white/60',
              href: '/loans',
            },
          ].map(t => (
            <a key={t.label} href={t.href}>
              <button
                className={`w-full ${t.bg} rounded-2xl p-4 text-left border border-black/[0.05] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group`}
              >
                <div className={`w-10 h-10 rounded-xl ${t.iconBg} flex items-center justify-center text-lg mb-3 font-bold group-hover:scale-110 transition-transform`}>
                  {t.icon}
                </div>
                <p className={`text-[13px] font-bold ${t.text}`}>{t.label}</p>
                <p className={`text-[11px] ${t.sub2} mt-0.5 leading-snug`}>{t.sub}</p>
              </button>
            </a>
          ))}
        </div>

        {/* ── Transactions ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-forest/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-forest text-[14px]">Recent Activity</h3>
              <p className="text-[11px] text-muted mt-0.5">Your transactions and score events</p>
            </div>
            <a
              href="/profile"
              className="text-[11px] font-semibold text-gold hover:text-gold/70 transition-colors flex items-center gap-1"
            >
              View full history
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>

          <div className="divide-y divide-forest/[0.05]">
            {TRANSACTIONS.map((tx, i) => {
              const meta = TX_META[tx.type]
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center text-sm flex-shrink-0 font-bold`}>
                    {meta.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-forest">{tx.label}</p>
                    <p className="text-[10px] text-muted">
                      {tx.date}
                    </p>
                  </div>

                  {/* Amount + badge */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[13px] font-bold font-mono ${tx.positive ? 'text-[#2d8c4e]' : 'text-forest'}`}>
                      {tx.positive ? '+' : '−'}KES {tx.amount.toLocaleString()}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${meta.bg} ${meta.text}`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Score improvement tips ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-bold text-forest text-[14px]">Improve Your TrustScore</h3>
              <p className="text-[11px] text-muted mt-0.5">
                Personalised tips for {user.name.split(' ')[0]}
              </p>
            </div>
            <div className="text-right">
              <p className="font-playfair text-[26px] font-black text-gold leading-none">{user.trustScore}</p>
              <p className="text-[10px] text-muted">/ 850</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: '📅',
                title: 'Keep your streak',
                desc: "You're on a 7-month streak. One more month bumps your score significantly.",
                impact: 'High',
                impactBg: 'bg-[#2d8c4e]/10',
                impactText: 'text-[#2d8c4e]',
              },
              {
                icon: '💵',
                title: 'Maintain savings buffer',
                desc: "Your borrow-to-savings ratio is healthy. Stay under 50% of your balance.",
                impact: 'High',
                impactBg: 'bg-[#2d8c4e]/10',
                impactText: 'text-[#2d8c4e]',
              },
              {
                icon: '🤝',
                title: 'Lend small amounts',
                desc: 'Funding 2–3 P2P loans across different members adds a lender bonus to your score.',
                impact: 'Bonus',
                impactBg: 'bg-gold/12',
                impactText: 'text-gold',
              },
            ].map(tip => (
              <div key={tip.title} className="bg-cream/70 rounded-xl p-4 border border-forest/[0.05] hover:border-forest/15 transition-colors">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xl">{tip.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tip.impactBg} ${tip.impactText}`}>
                    {tip.impact} impact
                  </span>
                </div>
                <p className="text-[12px] font-bold text-forest mb-1.5">{tip.title}</p>
                <p className="text-[11px] text-muted leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}