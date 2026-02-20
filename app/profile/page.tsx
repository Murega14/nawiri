'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Bar Chart                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((v, i) => {
        const isHov = hovered === i
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`w-full rounded-t-lg transition-all duration-300 relative ${
                isHov ? 'bg-forest' : 'bg-forest/15'
              }`}
              style={{ height: `${(v / max) * 104}px` }}
            >
              {isHov && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-forest text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-md">
                  KES {(v / 1000).toFixed(0)}k
                </div>
              )}
            </div>
            <span className={`text-[9px] font-semibold transition-colors ${isHov ? 'text-forest' : 'text-muted'}`}>
              {labels[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Score Ring                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScoreRingLarge({ score }: { score: number }) {
  const size = 128, r = 50, circ = 2 * Math.PI * r
  const pct = (score - 300) / 550
  const tierColor  = score >= 750 ? '#2d6349' : score >= 650 ? '#c8992a' : score >= 550 ? '#b05530' : '#5a7265'
  const tierLabel  = score >= 750 ? 'Tier A · Best Terms' : score >= 650 ? 'Tier B · Good Terms' : score >= 550 ? 'Tier C · Standard' : 'Tier D · Strict'
  const tierBadge  = score >= 750 ? 'bg-[#2d6349]/10 text-[#2d6349]' : score >= 650 ? 'bg-gold/15 text-gold' : score >= 550 ? 'bg-terra/10 text-terra' : 'bg-muted/15 text-muted'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle glow */}
        <div className="absolute inset-4 rounded-full" style={{ boxShadow: `0 0 24px ${tierColor}22` }} />
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0e8d5" strokeWidth="8" />
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={tierColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ filter: `drop-shadow(0 0 4px ${tierColor}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[32px] font-black text-forest leading-none">{score}</span>
          <span className="text-[10px] text-muted font-semibold mt-0.5">/ 850</span>
        </div>
      </div>
      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${tierBadge}`}>
        {tierLabel}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static Data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const MONTHLY_SAVINGS = {
  labels: ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],
  data:   [62000, 78000, 88000, 96000, 112000, 124000, 132000, 140500, 148500],
}

const SCORE_HISTORY = [
  { month: 'Feb 2025', score: 580 },
  { month: 'Mar 2025', score: 610 },
  { month: 'Apr 2025', score: 624 },
  { month: 'May 2025', score: 651 },
  { month: 'Jun 2025', score: 672 },
  { month: 'Jul 2025', score: 699 },
  { month: 'Aug 2025', score: 718 },
  { month: 'Sep 2025', score: 724 },
  { month: 'Oct 2025', score: 742 },
]

const OUTSTANDING_LOANS = [
  {
    id: 'LN-2025-0041',
    type: 'Business Loan',
    disbursed: 'Sep 10, 2025',
    principal: 27550,
    outstanding: 27550,
    interest: 2893,
    nextPayment: 'Oct 15, 2025',
    nextAmount: 1354,
    status: 'Active',
    payments: 0,
    totalPayments: 24,
  },
]

const P2P_LENT = [
  { id: 'P2P-1832', borrower: 'J. Mwangi', amount: 5000,  term: '7 days',  disbursed: 'Sep 28, 2025', due: 'Oct 5, 2025',  return: 175, status: 'Active',  onTime: true },
  { id: 'P2P-1796', borrower: 'A. Otieno', amount: 4000,  term: '7 days',  disbursed: 'Sep 28, 2025', due: 'Oct 5, 2025',  return: 140, status: 'Active',  onTime: true },
  { id: 'P2P-1743', borrower: 'M. Njeri',  amount: 6000,  term: '14 days', disbursed: 'Sep 25, 2025', due: 'Oct 9, 2025',  return: 420, status: 'Active',  onTime: true },
  { id: 'P2P-1601', borrower: 'D. Kamau',  amount: 3000,  term: '7 days',  disbursed: 'Sep 10, 2025', due: 'Sep 17, 2025', return: 105, status: 'Repaid', onTime: true },
  { id: 'P2P-1540', borrower: 'F. Wambua', amount: 5000,  term: '14 days', disbursed: 'Aug 28, 2025', due: 'Sep 11, 2025', return: 350, status: 'Repaid', onTime: true },
]

const ALL_TRANSACTIONS = [
  { type: 'deposit',  label: 'Monthly Deposit',        date: 'Oct 1, 2025',  amount: 8000,  positive: true  },
  { type: 'p2p_out',  label: 'P2P Loan Funded (×3)',   date: 'Sep 28, 2025', amount: 15000, positive: false },
  { type: 'deposit',  label: 'Monthly Deposit',         date: 'Sep 1, 2025',  amount: 8000,  positive: true  },
  { type: 'loan_in',  label: 'Business Loan Disbursed', date: 'Sep 10, 2025', amount: 27550, positive: true  },
  { type: 'repay',    label: 'Loan Repayment',          date: 'Aug 15, 2025', amount: 1354,  positive: false },
  { type: 'deposit',  label: 'Monthly Deposit',         date: 'Aug 1, 2025',  amount: 8000,  positive: true  },
  { type: 'interest', label: 'P2P Interest Earned',     date: 'Jul 24, 2025', amount: 1200,  positive: true  },
  { type: 'repay',    label: 'Loan Repayment',          date: 'Jul 15, 2025', amount: 1354,  positive: false },
  { type: 'deposit',  label: 'Monthly Deposit',         date: 'Jul 1, 2025',  amount: 8000,  positive: true  },
  { type: 'deposit',  label: 'Monthly Deposit',         date: 'Jun 1, 2025',  amount: 8000,  positive: true  },
]

const TYPE_META: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  deposit:  { label: 'Deposit',   bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]', icon: '↑'  },
  p2p_out:  { label: 'P2P Lent', bg: 'bg-gold/12',       text: 'text-gold',      icon: '🤝' },
  loan_in:  { label: 'Loan',     bg: 'bg-forest/8',      text: 'text-forest',    icon: '💳' },
  repay:    { label: 'Repayment',bg: 'bg-terra/10',       text: 'text-terra',     icon: '↓'  },
  interest: { label: 'Interest', bg: 'bg-[#2d8c4e]/10',  text: 'text-[#2d8c4e]', icon: '✦' },
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'loans' | 'p2p'>('overview')

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ede8de]">
        <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
      </div>
    )
  }

  const p2pActive      = P2P_LENT.filter(p => p.status === 'Active')
  const p2pRepaid      = P2P_LENT.filter(p => p.status === 'Repaid')
  const totalLent      = P2P_LENT.reduce((s, p) => s + p.amount, 0)
  const totalEarned    = p2pRepaid.reduce((s, p) => s + p.return, 0)
  const pendingReturns = p2pActive.reduce((s, p) => s + p.return, 0)

  const TABS = [
    { id: 'overview', label: 'Overview'   },
    { id: 'history',  label: 'History'    },
    { id: 'loans',    label: `Loans${OUTSTANDING_LOANS.length > 0 ? ` (${OUTSTANDING_LOANS.length})` : ''}` },
    { id: 'p2p',      label: `P2P (${p2pActive.length})` },
  ]

  return (
    <DashboardShell>
      <div className="w-full space-y-5">

        {/* ── Profile Hero ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">

          {/* Cover banner */}
          <div className="h-32 sm:h-36 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #1a3c2b 0%, #1e4530 50%, #162f22 100%)',
          }}>
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(200,153,42,0.22) 0%, transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)',
            }} />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-white/[0.03] translate-x-20 translate-y-16 pointer-events-none" />
            <div className="absolute top-0 right-48 w-32 h-32 rounded-full border border-white/[0.05] -translate-y-10 pointer-events-none" />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,1) 23px, rgba(255,255,255,1) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,1) 23px, rgba(255,255,255,1) 24px)',
            }} />
          </div>

          <div className="px-5 sm:px-7 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-10 mb-5">
              <div className="relative">
                <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl ring-2 ring-forest/10">
                  {user.avatar}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#2d8c4e] border-2 border-white" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-1">
                <button className="text-[11px] sm:text-[12px] font-semibold bg-cream border border-forest/15 text-forest px-3 sm:px-4 py-2 rounded-xl hover:border-forest/30 transition-colors">
                  Edit Profile
                </button>
                <button className="text-[11px] sm:text-[12px] font-semibold bg-forest text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-forest/90 transition-colors">
                  Share
                </button>
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
              <div className="flex-1">
                <h2 className="font-playfair text-[22px] sm:text-[26px] font-black text-forest leading-tight">{user.name}</h2>
                <p className="text-muted text-[12px] sm:text-[13px] mt-0.5">{user.sacco} · Member since {user.memberSince}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#2d8c4e]/8 text-[#2d8c4e] px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d8c4e]" />
                    KYC {user.kycLevel}
                  </span>
                  {user.depositStreak > 0 && (
                    <span className="text-[11px] font-semibold bg-gold/12 text-gold px-2.5 py-1 rounded-full">
                      🔥 {user.depositStreak}-month streak
                    </span>
                  )}
                  <span className="text-[11px] font-semibold bg-forest/8 text-forest px-2.5 py-1 rounded-full">
                    Tier {user.tier} Member
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1.5 lg:text-right">
                {[
                  {
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                    text: user.email,
                  },
                  {
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                    text: user.phone,
                  },
                  {
                    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    text: 'Nairobi, Kenya',
                  },
                ].map((c, i) => (
                  <div key={i} className="flex lg:justify-end items-center gap-2 text-[12px] text-muted">
                    <span className="text-muted/50">{c.icon}</span>
                    {c.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-black/[0.05] shadow-sm overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex-1 min-w-max py-2 px-3 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-muted hover:text-forest'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW ═══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            {/* Score + stats grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Score card */}
              <div className="bg-white rounded-2xl p-6 border border-black/[0.05] shadow-sm flex flex-col items-center gap-5">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest self-start">TrustScore</p>
                <ScoreRingLarge score={user.trustScore} />

                {/* Factor breakdown */}
                <div className="w-full pt-4 border-t border-forest/[0.06] space-y-2.5">
                  {[
                    { label: 'SACCO Conduct', pct: 45, fill: 'bg-forest'    },
                    { label: 'P2P Behaviour', pct: 30, fill: 'bg-gold'      },
                    { label: 'Cash-Flow',     pct: 15, fill: 'bg-terra'     },
                    { label: 'Identity',      pct: 10, fill: 'bg-muted'     },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted w-[88px] flex-shrink-0">{f.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div className={`h-full rounded-full ${f.fill}`} style={{ width: `${f.pct * 2}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-forest/60 w-6 text-right">{f.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary grid */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Total Savings',    value: `KES ${user.savings.toLocaleString()}`,         sub: 'SACCO balance',          icon: '💰', accent: 'text-forest' },
                  { label: 'Total Lent (P2P)', value: `KES ${totalLent.toLocaleString()}`,            sub: `${p2pActive.length} active loans`, icon: '🤝', accent: 'text-gold' },
                  { label: 'Outstanding Debt', value: `KES ${OUTSTANDING_LOANS[0]?.outstanding.toLocaleString() || '0'}`, sub: 'Business loan', icon: '📋', accent: 'text-terra' },
                  { label: 'Interest Earned',  value: `KES ${totalEarned.toLocaleString()}`,          sub: 'From P2P lending',       icon: '✦', accent: 'text-[#2d8c4e]' },
                  { label: 'Deposit Streak',   value: `${user.depositStreak} months`,                 sub: 'Consecutive deposits',   icon: '🔥', accent: 'text-gold' },
                  {
                    label: 'Net Position',
                    value: `KES ${(user.savings - (OUTSTANDING_LOANS[0]?.outstanding || 0) + totalLent).toLocaleString()}`,
                    sub: 'Savings + lent − debt',
                    icon: '📊',
                    accent: 'text-forest',
                  },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-[9px] text-muted font-medium uppercase tracking-wide">{s.label}</span>
                    </div>
                    <p className={`font-playfair text-[16px] sm:text-[18px] font-black leading-tight ${s.accent}`}>{s.value}</p>
                    <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TrustScore Journey */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.05] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-forest text-[14px]">TrustScore Journey</h4>
                  <p className="text-[11px] text-muted mt-0.5">Feb – Oct 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-playfair text-[20px] font-black text-[#2d8c4e] leading-none">+{SCORE_HISTORY[SCORE_HISTORY.length-1].score - SCORE_HISTORY[0].score} pts</p>
                  <p className="text-[10px] text-muted">over 9 months</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Connecting line behind dots */}
                <div className="absolute top-[5px] left-0 right-0 h-0.5 bg-forest/10" />
                <div className="flex items-start">
                  {SCORE_HISTORY.map((s, i) => {
                    const isLast  = i === SCORE_HISTORY.length - 1
                    const isFirst = i === 0
                    return (
                      <div key={s.month} className="flex-1 flex flex-col items-center group relative cursor-default">
                        {/* Dot */}
                        <div className={`relative z-10 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 group-hover:scale-150 ${
                          isLast ? 'border-forest bg-forest' : 'border-forest/40 bg-white'
                        }`} />

                        {/* Tooltip */}
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1a3c2b] text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                          {s.month}: {s.score}
                        </div>

                        {/* Score */}
                        <span className={`font-mono text-[10px] font-bold mt-2 ${isLast ? 'text-forest' : 'text-muted/60'}`}>
                          {s.score}
                        </span>

                        {/* Month label — hide middle ones on mobile */}
                        <span className={`text-[8px] text-muted leading-none mt-0.5 ${(!isFirst && !isLast && i % 2 !== 0) ? 'hidden sm:block' : ''}`}>
                          {s.month.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* KYC Verification */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.05] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-forest text-[14px]">Verification Status</h4>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                  user.kycLevel === 'Full' ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-gold/15 text-gold'
                }`}>
                  {user.kycLevel} KYC
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'National ID',        done: user.kycLevel !== 'Pending', icon: '🪪' },
                  { label: 'Phone Number',        done: true,                        icon: '📱' },
                  { label: 'Email Address',       done: true,                        icon: '✉️' },
                  { label: 'Face Verification',   done: user.kycLevel === 'Full',    icon: '📷' },
                ].map(v => (
                  <div key={v.label} className={`rounded-xl p-3.5 border flex items-center gap-3 ${
                    v.done ? 'bg-[#2d8c4e]/[0.05] border-[#2d8c4e]/20' : 'bg-cream/60 border-forest/10'
                  }`}>
                    <span className="text-xl">{v.icon}</span>
                    <div>
                      <p className="text-[11px] font-semibold text-forest">{v.label}</p>
                      <p className={`text-[10px] font-bold ${v.done ? 'text-[#2d8c4e]' : 'text-muted'}`}>
                        {v.done ? '✓ Verified' : '⏳ Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ════ FINANCIAL HISTORY ══════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-5">

            {/* Savings growth chart */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.05] shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="font-bold text-forest text-[14px]">Savings Growth</h4>
                  <p className="text-[11px] text-muted">February – October 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-playfair text-[20px] font-black text-forest leading-none">KES {user.savings.toLocaleString()}</p>
                  <p className="text-[11px] text-[#2d8c4e] font-semibold mt-0.5">
                    +KES {(user.savings - MONTHLY_SAVINGS.data[0]).toLocaleString()} since Feb
                  </p>
                </div>
              </div>
              <BarChart data={MONTHLY_SAVINGS.data} labels={MONTHLY_SAVINGS.labels} />
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Deposited', value: 'KES 72,000', sub: 'Last 9 months', icon: '📥', color: 'text-[#2d8c4e]' },
                { label: 'Total Repaid',    value: 'KES 13,540', sub: 'Loan payments',  icon: '📤', color: 'text-terra'    },
                { label: 'Interest Earned', value: 'KES 1,200',  sub: 'P2P returns',    icon: '💹', color: 'text-gold'     },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[16px] sm:text-[18px] font-black mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-muted">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Transaction table */}
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-forest/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-forest text-[14px]">All Transactions</h4>
                  <p className="text-[11px] text-muted mt-0.5">{ALL_TRANSACTIONS.length} entries</p>
                </div>
                <button className="text-[11px] font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/5 transition-colors">
                  Export CSV
                </button>
              </div>

              {/* Mobile: card list */}
              <div className="sm:hidden divide-y divide-forest/[0.05]">
                {ALL_TRANSACTIONS.map((tx, i) => {
                  const meta = TYPE_META[tx.type]
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream/40 transition-colors">
                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center text-sm flex-shrink-0 font-bold`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-forest truncate">{tx.label}</p>
                        <p className="text-[10px] text-muted">{tx.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-[13px] font-bold font-mono ${tx.positive ? 'text-[#2d8c4e]' : 'text-forest'}`}>
                          {tx.positive ? '+' : '−'}KES {tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[9px] font-bold ${meta.text}`}>{meta.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-cream/60">
                      {['Type', 'Description', 'Date', 'Amount'].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/[0.05]">
                    {ALL_TRANSACTIONS.map((tx, i) => {
                      const meta = TYPE_META[tx.type]
                      return (
                        <tr key={i} className="hover:bg-cream/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-forest">{tx.label}</td>
                          <td className="px-5 py-3.5 text-muted">{tx.date}</td>
                          <td className={`px-5 py-3.5 text-right font-bold font-mono ${tx.positive ? 'text-[#2d8c4e]' : 'text-forest'}`}>
                            {tx.positive ? '+' : '−'}KES {tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════ LOANS ══════════════════════════════════════════════════════ */}
        {activeTab === 'loans' && (
          <div className="space-y-5">

            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Outstanding',  value: `KES ${OUTSTANDING_LOANS[0]?.outstanding.toLocaleString() || '0'}`, color: 'text-terra',     icon: '⚠️' },
                { label: 'Total Interest', value: `KES ${OUTSTANDING_LOANS[0]?.interest.toLocaleString() || '0'}`,  color: 'text-gold',      icon: '📊' },
                { label: 'Next Payment', value: `KES ${OUTSTANDING_LOANS[0]?.nextAmount.toLocaleString() || '0'}`,  color: 'text-forest',    icon: '📅' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[16px] sm:text-[18px] font-black mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Loan cards */}
            {OUTSTANDING_LOANS.length > 0 ? OUTSTANDING_LOANS.map(loan => (
              <div key={loan.id} className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">

                {/* Card header */}
                <div className="px-5 py-4 border-b border-forest/[0.06] bg-cream/30 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-forest text-[14px]">{loan.type}</h4>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#2d8c4e]/10 text-[#2d8c4e] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d8c4e] animate-pulse" />{loan.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">Ref: {loan.id} · Disbursed {loan.disbursed}</p>
                  </div>
                  <button className="text-[12px] font-semibold bg-forest text-white px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-colors self-start sm:self-auto">
                    Make Payment
                  </button>
                </div>

                {/* Metrics */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Principal',         value: `KES ${loan.principal.toLocaleString()}` },
                    { label: 'Outstanding',        value: `KES ${loan.outstanding.toLocaleString()}` },
                    { label: 'Interest (total)',   value: `KES ${loan.interest.toLocaleString()}` },
                    { label: 'Next Payment Due',   value: loan.nextPayment },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-[10px] text-muted font-medium mb-0.5">{d.label}</p>
                      <p className="text-[13px] font-bold text-forest">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="px-5 pb-5">
                  <div className="flex justify-between text-[10px] text-muted mb-1.5">
                    <span>Repayment progress</span>
                    <span>{loan.payments} / {loan.totalPayments} payments</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2d8c4e] transition-all duration-700"
                      style={{ width: `${(loan.payments / loan.totalPayments) * 100 || 2}%` }}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-2xl p-12 border border-black/[0.05] shadow-sm text-center">
                <span className="text-5xl">🎉</span>
                <p className="font-bold text-forest text-[16px] mt-4">No outstanding loans</p>
                <p className="text-[12px] text-muted mt-1">You're debt-free! Apply for a loan when you need it.</p>
              </div>
            )}

            {/* Loan eligibility banner */}
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a3c2b 0%, #1e4530 100%)' }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(200,153,42,0.15) 0%, transparent 60%)' }} />
              <div className="relative">
                <h4 className="font-bold text-white text-[14px] mb-4 flex items-center gap-2">
                  <span className="text-gold">✦</span> Your Loan Eligibility
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Max Amount',    value: `KES ${Math.round(user.savings * (user.tier === 'A' ? 2 : user.tier === 'B' ? 1.5 : 1)).toLocaleString()}` },
                    { label: 'Interest Rate', value: `${user.tier === 'A' ? 8.5 : user.tier === 'B' ? 10.5 : 13.0}% p.a.` },
                    { label: 'Multiplier',    value: `${user.tier === 'A' ? '2×' : user.tier === 'B' ? '1.5×' : '1×'} savings` },
                    { label: 'Your Tier',     value: `Tier ${user.tier}` },
                  ].map(d => (
                    <div key={d.label} className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
                      <p className="text-white/45 text-[10px] mb-1 font-medium">{d.label}</p>
                      <p className="font-playfair text-[15px] font-black text-white">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ P2P LENDING ════════════════════════════════════════════════ */}
        {activeTab === 'p2p' && (
          <div className="space-y-5">

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Lent Out',   value: `KES ${totalLent.toLocaleString()}`,        color: 'text-forest',      icon: '📤' },
                { label: 'Active Loans',     value: `${p2pActive.length} loans`,                color: 'text-gold',        icon: '🔄' },
                { label: 'Pending Returns',  value: `KES ${pendingReturns.toLocaleString()}`,   color: 'text-[#2d8c4e]',   icon: '⏳' },
                { label: 'Total Earned',     value: `KES ${totalEarned.toLocaleString()}`,      color: 'text-[#2d8c4e]',   icon: '💹' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[17px] sm:text-[18px] font-black mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active P2P loans */}
            {p2pActive.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-forest/[0.06] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2d8c4e] animate-pulse" />
                  <h4 className="font-bold text-forest text-[14px]">Active P2P Loans</h4>
                  <span className="text-[10px] font-bold bg-[#2d8c4e]/10 text-[#2d8c4e] px-2 py-0.5 rounded-full ml-1">
                    {p2pActive.length} active
                  </span>
                </div>

                {/* Mobile: stacked cards */}
                <div className="sm:hidden divide-y divide-forest/[0.05]">
                  {p2pActive.map(loan => (
                    <div key={loan.id} className="px-4 py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-forest text-[13px]">{loan.borrower}</p>
                          <p className="text-[10px] text-muted font-mono">{loan.id}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-[#2d8c4e]/10 text-[#2d8c4e] px-2.5 py-1 rounded-full">{loan.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-[9px] text-muted font-medium">Amount</p>
                          <p className="text-[12px] font-bold text-forest">KES {loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted font-medium">Due</p>
                          <p className="text-[12px] font-bold text-forest">{loan.due}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted font-medium">Return</p>
                          <p className="text-[12px] font-bold text-[#2d8c4e]">+KES {loan.return}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-cream/60">
                        {['Ref', 'Borrower', 'Amount', 'Term', 'Due Date', 'Expected Return', 'Status'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/[0.04]">
                      {p2pActive.map(loan => (
                        <tr key={loan.id} className="hover:bg-cream/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-muted">{loan.id}</td>
                          <td className="px-4 py-3.5 font-semibold text-forest">{loan.borrower}</td>
                          <td className="px-4 py-3.5 font-bold text-forest">KES {loan.amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-muted">{loan.term}</td>
                          <td className="px-4 py-3.5 text-muted">{loan.due}</td>
                          <td className="px-4 py-3.5 font-bold text-[#2d8c4e]">+KES {loan.return.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-bold bg-[#2d8c4e]/10 text-[#2d8c4e] px-2.5 py-1 rounded-full">{loan.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Repaid loans */}
            {p2pRepaid.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-forest/[0.06] flex items-center justify-between">
                  <h4 className="font-bold text-forest text-[14px]">Repaid Loans</h4>
                  <span className="text-[10px] font-bold bg-forest/8 text-forest px-2 py-0.5 rounded-full">
                    {p2pRepaid.length} completed
                  </span>
                </div>

                {/* Mobile: stacked cards */}
                <div className="sm:hidden divide-y divide-forest/[0.05]">
                  {p2pRepaid.map(loan => (
                    <div key={loan.id} className="px-4 py-4 opacity-80">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-forest text-[13px]">{loan.borrower}</p>
                          <p className="text-[10px] text-muted font-mono">{loan.id}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${loan.onTime ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-terra/10 text-terra'}`}>
                          {loan.onTime ? '✓ On time' : '⚠ Late'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-[9px] text-muted font-medium">Amount</p>
                          <p className="text-[12px] font-bold text-forest">KES {loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted font-medium">Repaid</p>
                          <p className="text-[12px] font-bold text-forest">{loan.due}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted font-medium">Earned</p>
                          <p className="text-[12px] font-bold text-[#2d8c4e]">+KES {loan.return}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-cream/60">
                        {['Ref', 'Borrower', 'Amount', 'Term', 'Repaid On', 'Return', 'On Time'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/[0.04]">
                      {p2pRepaid.map(loan => (
                        <tr key={loan.id} className="hover:bg-cream/40 transition-colors opacity-80">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-muted">{loan.id}</td>
                          <td className="px-4 py-3.5 font-semibold text-forest">{loan.borrower}</td>
                          <td className="px-4 py-3.5 font-bold text-forest">KES {loan.amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-muted">{loan.term}</td>
                          <td className="px-4 py-3.5 text-muted">{loan.due}</td>
                          <td className="px-4 py-3.5 font-bold text-[#2d8c4e]">+KES {loan.return.toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${loan.onTime ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-terra/10 text-terra'}`}>
                              {loan.onTime ? '✓ On time' : '⚠ Late'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lender performance banner */}
            <div className="bg-gold/[0.07] border border-gold/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0 text-xl">
                💡
              </div>
              <div className="flex-1">
                <p className="font-bold text-forest text-[14px] mb-1">Your Lender Performance</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  All {p2pRepaid.length} of your completed P2P loans were repaid on time — you've earned a{' '}
                  <span className="font-bold text-gold">Lender Performance Bonus</span> on your TrustScore.
                  Keep diversifying across borrowers to maximise your bonus.
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-playfair text-[22px] font-black text-gold leading-none">+10</p>
                <p className="text-[10px] text-muted">score pts</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </DashboardShell>
  )
}