'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
type Goal = {
  id: string
  name: string
  icon: string
  target: number
  saved: number
  deadline: string
  color: string
  accentText: string
}

type SavingsPlan = {
  id: string
  name: string
  type: 'fixed' | 'flexible' | 'locked'
  interestRate: number
  balance: number
  monthlyContribution: number
  maturityDate?: string
  startDate: string
  status: 'Active' | 'Paused' | 'Matured'
  icon: string
}

type Transaction = {
  id: string
  type: 'deposit' | 'withdrawal' | 'interest' | 'transfer'
  label: string
  date: string
  amount: number
  positive: boolean
  plan?: string
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const SAVINGS_PLANS: SavingsPlan[] = [
  {
    id: 'SP-001',
    name: 'Regular SACCO Savings',
    type: 'fixed',
    interestRate: 6.5,
    balance: 148500,
    monthlyContribution: 8000,
    startDate: 'Feb 2025',
    status: 'Active',
    icon: '🏦',
  },
  {
    id: 'SP-002',
    name: 'Emergency Fund',
    type: 'flexible',
    interestRate: 4.0,
    balance: 32000,
    monthlyContribution: 2000,
    startDate: 'Mar 2025',
    status: 'Active',
    icon: '🛡️',
  },
  {
    id: 'SP-003',
    name: '1-Year Fixed Deposit',
    type: 'locked',
    interestRate: 9.5,
    balance: 50000,
    monthlyContribution: 0,
    maturityDate: 'Jan 15, 2026',
    startDate: 'Jan 15, 2025',
    status: 'Active',
    icon: '🔒',
  },
]

const GOALS: Goal[] = [
  {
    id: 'G-001',
    name: 'Land Purchase',
    icon: '🏡',
    target: 500000,
    saved: 148500,
    deadline: 'Dec 2027',
    color: 'bg-forest/10',
    accentText: 'text-forest',
  },
  {
    id: 'G-002',
    name: 'School Fees',
    icon: '🎓',
    target: 80000,
    saved: 32000,
    deadline: 'Jan 2026',
    color: 'bg-gold/10',
    accentText: 'text-gold',
  },
  {
    id: 'G-003',
    name: 'Business Capital',
    icon: '📈',
    target: 200000,
    saved: 50000,
    deadline: 'Jun 2026',
    color: 'bg-[#2d8c4e]/10',
    accentText: 'text-[#2d8c4e]',
  },
]

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 'T-001', type: 'deposit', label: 'Monthly Contribution', date: 'Oct 1, 2025', amount: 8000, positive: true, plan: 'Regular SACCO Savings' },
  { id: 'T-002', type: 'interest', label: 'Monthly Interest Credit', date: 'Sep 30, 2025', amount: 805, positive: true, plan: 'Regular SACCO Savings' },
  { id: 'T-003', type: 'deposit', label: 'Monthly Contribution', date: 'Sep 1, 2025', amount: 8000, positive: true, plan: 'Regular SACCO Savings' },
  { id: 'T-004', type: 'deposit', label: 'Emergency Top-Up', date: 'Aug 20, 2025', amount: 5000, positive: true, plan: 'Emergency Fund' },
  { id: 'T-005', type: 'interest', label: 'Quarterly Interest', date: 'Aug 15, 2025', amount: 320, positive: true, plan: 'Emergency Fund' },
  { id: 'T-006', type: 'deposit', label: 'Monthly Contribution', date: 'Aug 1, 2025', amount: 8000, positive: true, plan: 'Regular SACCO Savings' },
  { id: 'T-007', type: 'withdrawal', label: 'Partial Withdrawal', date: 'Jul 22, 2025', amount: 3000, positive: false, plan: 'Emergency Fund' },
  { id: 'T-008', type: 'transfer', label: 'Goal Transfer — School Fees', date: 'Jul 10, 2025', amount: 10000, positive: false, plan: 'Regular SACCO Savings' },
]

const MONTHLY_DATA = {
  labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  deposits: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
  balance:  [62000, 78000, 88000, 96000, 112000, 124000, 132000, 140500, 148500],
  interest: [340, 390, 440, 480, 560, 620, 660, 703, 805],
}

const TX_META: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  deposit:    { bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]', icon: '↑', label: 'Deposit' },
  interest:   { bg: 'bg-gold/12',      text: 'text-gold',       icon: '✦', label: 'Interest' },
  withdrawal: { bg: 'bg-terra/10',     text: 'text-terra',      icon: '↓', label: 'Withdrawal' },
  transfer:   { bg: 'bg-forest/8',     text: 'text-forest',     icon: '⇄', label: 'Transfer' },
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Animated area/bar chart */
function SavingsChart({ data, labels }: { data: number[]; labels: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data)
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-28 group">
        {data.map((v, i) => {
          const isHov = hovered === i
          const pct = (v / max) * 104
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
                style={{ height: `${pct}px` }}
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
    </div>
  )
}

/** Circular progress ring for goals */
function GoalRing({ pct, color }: { pct: number; color: string }) {
  const size = 56, r = 22, circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0e8d5" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        className="transition-all duration-700"
      />
    </svg>
  )
}

/** Plan type badge */
function PlanBadge({ type }: { type: SavingsPlan['type'] }) {
  const map = {
    fixed:    { label: 'Fixed Monthly', bg: 'bg-forest/8',    text: 'text-forest' },
    flexible: { label: 'Flexible',      bg: 'bg-gold/12',     text: 'text-gold' },
    locked:   { label: 'Locked Term',   bg: 'bg-terra/10',    text: 'text-terra' },
  }
  const m = map[type]
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  )
}

/** Interest rate pill */
function RatePill({ rate }: { rate: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2d8c4e] bg-[#2d8c4e]/10 px-2 py-0.5 rounded-full">
      <span className="text-[8px]">✦</span>{rate}% p.a.
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function SavingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'goals' | 'history'>('overview')
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositPlan, setDepositPlan] = useState(SAVINGS_PLANS[0].id)

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

  /* Derived values */
  const totalSavings = SAVINGS_PLANS.reduce((s, p) => s + p.balance, 0)
  const totalInterestThisYear = MONTHLY_DATA.interest.reduce((a, b) => a + b, 0)
  const monthlyContribution = SAVINGS_PLANS.reduce((s, p) => s + p.monthlyContribution, 0)
  const growthPct = ((totalSavings - MONTHLY_DATA.balance[0]) / MONTHLY_DATA.balance[0]) * 100

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'plans',    label: `Plans (${SAVINGS_PLANS.length})` },
    { id: 'goals',    label: `Goals (${GOALS.length})` },
    { id: 'history',  label: 'History' },
  ] as const

  /* ── Deposit modal ─────────────────────────────────────────────────────── */
  const DepositModal = () => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setDepositModalOpen(false)}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-playfair text-xl font-black text-forest">Make a Deposit</h3>
          <button
            onClick={() => setDepositModalOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cream text-muted hover:bg-cream-dark transition-colors"
          >✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
              Select Plan
            </label>
            <div className="space-y-2">
              {SAVINGS_PLANS.filter(p => p.type !== 'locked').map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setDepositPlan(plan.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    depositPlan === plan.id
                      ? 'border-forest bg-forest/5'
                      : 'border-forest/10 hover:border-forest/25'
                  }`}
                >
                  <span className="text-xl">{plan.icon}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-forest">{plan.name}</p>
                    <p className="text-[11px] text-muted">
                      Balance: KES {plan.balance.toLocaleString()} · {plan.interestRate}% p.a.
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    depositPlan === plan.id ? 'border-forest bg-forest' : 'border-muted/40'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
              Amount (KES)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted text-[13px]">KES</span>
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-14 pr-4 py-3.5 rounded-xl border-2 border-forest/15 focus:border-forest outline-none font-mono font-bold text-forest text-[16px] bg-cream transition-colors"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 2000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className="flex-1 py-1.5 text-[11px] font-bold text-forest bg-forest/8 rounded-lg hover:bg-forest/15 transition-colors"
                >
                  +{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setDepositModalOpen(false)}
            className="w-full py-4 bg-forest text-white font-bold text-[14px] rounded-xl hover:bg-forest/90 transition-colors mt-2"
          >
            Confirm Deposit →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <DashboardShell>
      {depositModalOpen && <DepositModal />}

      <div className="w-full space-y-5">

        {/* ── Hero banner ─────────────────────────────────────────────────── */}
        <div className="bg-forest rounded-2xl overflow-hidden relative">
          {/* Decorative background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 15% 50%, rgba(200,153,42,0.18) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)',
            }}
          />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/3 translate-x-20 translate-y-16 pointer-events-none" />
          <div className="absolute top-0 right-24 w-32 h-32 rounded-full bg-gold/8 -translate-y-8 pointer-events-none" />

          <div className="relative px-6 py-7 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

              {/* Left: balances */}
              <div>
                <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-1">
                  Total Portfolio Value
                </p>
                <h1 className="font-playfair text-[36px] sm:text-[42px] font-black text-white leading-none">
                  KES {totalSavings.toLocaleString()}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2d8c4e] bg-[#2d8c4e]/20 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d8c4e]" />
                    ↑ {growthPct.toFixed(1)}% growth
                  </span>
                  <span className="text-white/50 text-[12px]">
                    +KES {totalInterestThisYear.toLocaleString()} interest YTD
                  </span>
                </div>
              </div>

              {/* Right: action + mini-stats */}
              <div className="flex flex-col items-start sm:items-end gap-4">
                <button
                  onClick={() => setDepositModalOpen(true)}
                  className="flex items-center gap-2 bg-gold text-forest font-bold text-[13px] px-5 py-3 rounded-xl hover:bg-gold/90 transition-all hover:scale-105 shadow-lg shadow-gold/25"
                >
                  <span className="text-[16px]">＋</span>
                  Make a Deposit
                </button>
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">Monthly</p>
                    <p className="text-white font-bold text-[14px]">KES {monthlyContribution.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">Active Plans</p>
                    <p className="text-white font-bold text-[14px]">{SAVINGS_PLANS.filter(p => p.status === 'Active').length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">Streak</p>
                    <p className="text-white font-bold text-[14px]">🔥 {user.depositStreak}m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-black/5 shadow-sm overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
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

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Savings',     value: `KES ${totalSavings.toLocaleString()}`,            icon: '💰', accent: 'text-forest' },
                { label: 'Interest Earned',   value: `KES ${totalInterestThisYear.toLocaleString()}`,   icon: '✦',  accent: 'text-[#2d8c4e]' },
                { label: 'Monthly Target',    value: `KES ${monthlyContribution.toLocaleString()}`,     icon: '📅', accent: 'text-gold' },
                { label: 'Avg. Rate',         value: `${(SAVINGS_PLANS.reduce((a, p) => a + p.interestRate, 0) / SAVINGS_PLANS.length).toFixed(1)}% p.a.`, icon: '📊', accent: 'text-terra' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[17px] sm:text-[19px] font-black mt-2 leading-tight ${s.accent}`}>{s.value}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Savings growth chart */}
            <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h4 className="font-bold text-forest text-[14px]">Balance Growth</h4>
                  <p className="text-[11px] text-muted">Feb – Oct 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-playfair text-xl font-black text-forest">KES {totalSavings.toLocaleString()}</p>
                  <p className="text-[11px] text-[#2d8c4e] font-semibold">
                    +KES {(totalSavings - MONTHLY_DATA.balance[0]).toLocaleString()} since Feb
                  </p>
                </div>
              </div>
              <SavingsChart data={MONTHLY_DATA.balance} labels={MONTHLY_DATA.labels} />
            </div>

            {/* Plans snapshot */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-forest/6 flex items-center justify-between">
                <h4 className="font-bold text-forest text-[14px]">Your Plans</h4>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="text-[11px] font-semibold text-gold hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-forest/4">
                {SAVINGS_PLANS.map(plan => (
                  <div key={plan.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/40 transition-colors">
                    <span className="text-2xl">{plan.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-bold text-forest truncate">{plan.name}</p>
                        <PlanBadge type={plan.type} />
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Since {plan.startDate}
                        {plan.maturityDate ? ` · Matures ${plan.maturityDate}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-playfair text-[16px] font-black text-forest">
                        KES {plan.balance.toLocaleString()}
                      </p>
                      <RatePill rate={plan.interestRate} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals snapshot */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-forest/6 flex items-center justify-between">
                <h4 className="font-bold text-forest text-[14px]">Savings Goals</h4>
                <button
                  onClick={() => setActiveTab('goals')}
                  className="text-[11px] font-semibold text-gold hover:underline"
                >
                  Manage →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-forest/6">
                {GOALS.map(goal => {
                  const pct = goal.saved / goal.target
                  const ringColor = goal.accentText === 'text-forest' ? '#2d6349' : goal.accentText === 'text-gold' ? '#c8992a' : '#2d8c4e'
                  return (
                    <div key={goal.id} className="p-5 flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <GoalRing pct={pct} color={ringColor} />
                        <span className="absolute inset-0 flex items-center justify-center text-[18px]">
                          {goal.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-forest">{goal.name}</p>
                        <p className={`text-[13px] font-black font-playfair ${goal.accentText}`}>
                          {(pct * 100).toFixed(0)}%
                        </p>
                        <p className="text-[10px] text-muted">
                          KES {goal.saved.toLocaleString()} / {goal.target.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted">By {goal.deadline}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Interest projection banner */}
            <div className="bg-gold/8 border border-gold/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-3xl">📈</span>
              <div className="flex-1">
                <p className="font-bold text-forest text-[14px] mb-1">Projected Interest for Next 12 Months</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  At your current contribution rate, you'll earn approximately{' '}
                  <span className="font-bold text-gold">KES {Math.round(totalSavings * 0.065).toLocaleString()}</span>{' '}
                  in interest over the next year across all plans.
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-playfair text-[22px] font-black text-forest">
                  KES {Math.round(totalSavings * 0.065).toLocaleString()}
                </p>
                <p className="text-[10px] text-muted">projected earnings</p>
              </div>
            </div>
          </div>
        )}

        {/* ════ PLANS ══════════════════════════════════════════════════════ */}
        {activeTab === 'plans' && (
          <div className="space-y-5">

            {/* Plan cards */}
            {SAVINGS_PLANS.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-forest/6 bg-cream/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-forest text-[14px]">{plan.name}</h4>
                        <PlanBadge type={plan.type} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.status === 'Active' ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-terra/10 text-terra'
                        }`}>{plan.status}</span>
                      </div>
                      <p className="text-[11px] text-muted">Ref: {plan.id} · Started {plan.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.type !== 'locked' && (
                      <button
                        onClick={() => { setDepositPlan(plan.id); setDepositModalOpen(true) }}
                        className="text-[12px] font-semibold bg-forest text-white px-4 py-2 rounded-xl hover:bg-forest/90 transition-colors"
                      >
                        Deposit
                      </button>
                    )}
                    <button className="text-[12px] font-semibold bg-cream border border-forest/15 text-forest px-4 py-2 rounded-xl hover:border-forest/30 transition-colors">
                      Details
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Balance',          value: `KES ${plan.balance.toLocaleString()}` },
                    { label: 'Interest Rate',    value: `${plan.interestRate}% p.a.` },
                    { label: 'Monthly Deposit',  value: plan.monthlyContribution > 0 ? `KES ${plan.monthlyContribution.toLocaleString()}` : '—' },
                    { label: plan.maturityDate ? 'Matures On' : 'Member Since', value: plan.maturityDate || plan.startDate },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-[10px] text-muted font-medium mb-0.5">{d.label}</p>
                      <p className="text-[14px] font-bold text-forest">{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Locked plan countdown */}
                {plan.type === 'locked' && plan.maturityDate && (
                  <div className="px-5 pb-5">
                    <div className="bg-terra/8 border border-terra/20 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-xl">🔒</span>
                      <div>
                        <p className="text-[11px] font-bold text-terra">Funds locked until {plan.maturityDate}</p>
                        <p className="text-[10px] text-muted mt-0.5">
                          Early withdrawal attracts a 2% penalty. At maturity you'll receive KES{' '}
                          {Math.round(plan.balance * (1 + plan.interestRate / 100)).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Open new plan CTA */}
            <div className="bg-forest rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-[14px] mb-1 flex items-center gap-2">
                  <span className="text-gold">✦</span> Open a New Savings Plan
                </h4>
                <p className="text-white/60 text-[12px]">
                  Fixed deposits from 6 months · Flexible accounts · Goal-linked pots
                </p>
              </div>
              <button className="flex-shrink-0 bg-gold text-forest font-bold text-[12px] px-5 py-3 rounded-xl hover:bg-gold/90 transition-colors">
                Explore Plans →
              </button>
            </div>
          </div>
        )}

        {/* ════ GOALS ══════════════════════════════════════════════════════ */}
        {activeTab === 'goals' && (
          <div className="space-y-5">

            {/* Goal cards */}
            {GOALS.map(goal => {
              const pct = goal.saved / goal.target
              const ringColor = goal.accentText === 'text-forest' ? '#2d6349' : goal.accentText === 'text-gold' ? '#c8992a' : '#2d8c4e'
              const remaining = goal.target - goal.saved
              return (
                <div key={goal.id} className={`bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden`}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Ring */}
                      <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl ${goal.color} flex items-center justify-center`}>
                        <span className="text-2xl">{goal.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h4 className="font-bold text-forest text-[15px]">{goal.name}</h4>
                            <p className="text-[11px] text-muted">Target by {goal.deadline}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-playfair text-[20px] font-black leading-tight ${goal.accentText}`}>
                              {(pct * 100).toFixed(1)}%
                            </p>
                            <p className="text-[10px] text-muted">complete</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-[10px] text-muted mb-1.5">
                            <span>KES {goal.saved.toLocaleString()} saved</span>
                            <span>KES {goal.target.toLocaleString()} target</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-cream-dark overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                goal.accentText === 'text-forest' ? 'bg-forest' :
                                goal.accentText === 'text-gold' ? 'bg-gold' : 'bg-[#2d8c4e]'
                              }`}
                              style={{ width: `${Math.min(pct * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-forest/6">
                          {[
                            { label: 'Saved',     value: `KES ${goal.saved.toLocaleString()}` },
                            { label: 'Remaining', value: `KES ${remaining.toLocaleString()}` },
                            { label: 'Deadline',  value: goal.deadline },
                          ].map(d => (
                            <div key={d.label}>
                              <p className="text-[10px] text-muted">{d.label}</p>
                              <p className="text-[12px] font-bold text-forest">{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action footer */}
                  <div className="px-5 pb-5 flex gap-2">
                    <button className="flex-1 py-2.5 text-[12px] font-bold bg-forest text-white rounded-xl hover:bg-forest/90 transition-colors">
                      Contribute
                    </button>
                    <button className="px-4 py-2.5 text-[12px] font-semibold bg-cream border border-forest/15 text-forest rounded-xl hover:border-forest/30 transition-colors">
                      Edit Goal
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add goal CTA */}
            <button className="w-full py-5 border-2 border-dashed border-forest/20 rounded-2xl text-[13px] font-semibold text-muted hover:border-forest/40 hover:text-forest transition-all group">
              <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">＋</span>
              Create a new savings goal
            </button>
          </div>
        )}

        {/* ════ HISTORY ════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-5">

            {/* Interest summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Total Deposited',  value: 'KES 72,000', sub: 'Last 9 months', icon: '📥', color: 'text-[#2d8c4e]' },
                { label: 'Interest Earned',  value: `KES ${totalInterestThisYear.toLocaleString()}`, sub: 'All plans YTD', icon: '✦', color: 'text-gold' },
                { label: 'Withdrawals',      value: 'KES 3,000',  sub: 'Since account opening', icon: '📤', color: 'text-terra' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[18px] font-black mt-2 ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-muted">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Monthly interest chart */}
            <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h4 className="font-bold text-forest text-[14px]">Monthly Interest Credits</h4>
                  <p className="text-[11px] text-muted">Across all savings plans</p>
                </div>
                <RatePill rate={6.5} />
              </div>
              <SavingsChart data={MONTHLY_DATA.interest} labels={MONTHLY_DATA.labels} />
            </div>

            {/* Transaction list */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-forest/6 flex items-center justify-between">
                <h4 className="font-bold text-forest text-[14px]">Recent Transactions</h4>
                <button className="text-[11px] font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/5 transition-colors">
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-cream/70">
                      {['Type', 'Description', 'Plan', 'Date', 'Amount'].map(h => (
                        <th key={h} className={`px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/4">
                    {RECENT_TRANSACTIONS.map(tx => {
                      const meta = TX_META[tx.type]
                      return (
                        <tr key={tx.id} className="hover:bg-cream/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-forest">{tx.label}</td>
                          <td className="px-5 py-3.5 text-muted text-[11px]">{tx.plan || '—'}</td>
                          <td className="px-5 py-3.5 text-muted">{tx.date}</td>
                          <td className={`px-5 py-3.5 text-right font-bold font-mono ${tx.positive ? 'text-[#2d8c4e]' : 'text-forest'}`}>
                            {tx.positive ? '+' : '-'}KES {tx.amount.toLocaleString()}
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

      </div>
    </DashboardShell>
  )
}