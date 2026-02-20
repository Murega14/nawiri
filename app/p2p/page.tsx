'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
type MainView   = 'home' | 'borrow' | 'lend' | 'loans'
type BorrowStep = 'form' | 'lenders' | 'confirm' | 'done'
type LendStep   = 'form' | 'borrowers' | 'confirm' | 'done'
type LoanStatus = 'active' | 'repaid' | 'overdue'
type LoanRole   = 'borrower' | 'lender'

interface Lender {
  id: string; name: string; initials: string
  trustScore: number; loansGiven: number; successRate: number
  interestRatePerWeek: number
}
interface Borrower {
  id: string; name: string; initials: string
  trustScore: number; requestedAmount: number; tenor: number
  purpose: string; repaymentRate: number; memberSince: string
}
interface SavedLoan {
  id: string; role: LoanRole; counterparty: string
  counterpartyPhone?: string; amount: number; totalRepayable: number
  tenor: number; dueDate: string; interestAmount: number; status: LoanStatus
  createdAt: string
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const LENDERS: Lender[] = [
  { id: 'L-001', name: 'Peter Ndungu',    initials: 'PN', trustScore: 820, loansGiven: 24, successRate: 97,  interestRatePerWeek: 0.70 },
  { id: 'L-002', name: 'Mary Wanjiku',    initials: 'MW', trustScore: 795, loansGiven: 18, successRate: 100, interestRatePerWeek: 0.65 },
  { id: 'L-003', name: 'James Odhiambo', initials: 'JO', trustScore: 760, loansGiven: 31, successRate: 94,  interestRatePerWeek: 0.80 },
  { id: 'L-004', name: 'Fatuma Ali',      initials: 'FA', trustScore: 808, loansGiven: 9,  successRate: 100, interestRatePerWeek: 0.60 },
]
const BORROWERS: Borrower[] = [
  { id: 'B-001', name: 'Sarah Kamau',  initials: 'SK', trustScore: 780, requestedAmount: 20000, tenor: 7,  purpose: 'Stock restocking for shop', repaymentRate: 98, memberSince: 'Feb 2023' },
  { id: 'B-002', name: 'David Mwangi', initials: 'DM', trustScore: 720, requestedAmount: 12000, tenor: 10, purpose: 'School fees balance',         repaymentRate: 95, memberSince: 'Sep 2023' },
  { id: 'B-003', name: 'Grace Otieno', initials: 'GO', trustScore: 670, requestedAmount: 8000,  tenor: 5,  purpose: 'Medical emergency',            repaymentRate: 91, memberSince: 'Jan 2024' },
  { id: 'B-004', name: 'John Kariuki', initials: 'JK', trustScore: 580, requestedAmount: 5000,  tenor: 14, purpose: 'Transport deposit',            repaymentRate: 82, memberSince: 'Apr 2024' },
  { id: 'B-005', name: 'Aisha Hassan', initials: 'AH', trustScore: 810, requestedAmount: 15000, tenor: 7,  purpose: 'Trade finance — produce',      repaymentRate: 99, memberSince: 'Jun 2022' },
]
const SEED_LOANS: SavedLoan[] = [
  { id: 'seed-1', role: 'borrower', counterparty: 'Peter Ndungu', counterpartyPhone: '0722 *** 431', amount: 15000, totalRepayable: 16050, tenor: 7,  dueDate: 'Oct 22, 2025', interestAmount: 1050, status: 'active',  createdAt: 'Oct 15, 2025' },
  { id: 'seed-2', role: 'lender',   counterparty: 'Grace Otieno', amount: 5000,  totalRepayable: 5325,  tenor: 5,  dueDate: 'Oct 15, 2025', interestAmount: 325,  status: 'repaid',  createdAt: 'Oct 10, 2025' },
  { id: 'seed-3', role: 'lender',   counterparty: 'John Kariuki', amount: 3000,  totalRepayable: 3420,  tenor: 14, dueDate: 'Oct 15, 2025', interestAmount: 420,  status: 'overdue', createdAt: 'Oct 1, 2025'  },
]

const MY_TRUST_SCORE = 751
const MY_SAVINGS     = 148_500
const MY_BASE_RATE   = 0.70
const STORAGE_KEY    = 'p2p_demo_loans'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const riskPremium    = (s: number) => s >= 750 ? 0 : s >= 700 ? 0.20 : s >= 650 ? 0.40 : s >= 600 ? 0.70 : 1.20
const effectiveRate  = (base: number, score: number) => base + riskPremium(score)
const calcInterest   = (amt: number, rate: number, days: number) => (amt * rate / 100) * (days / 7)

function scoreMeta(score: number) {
  if (score >= 750) return { tier: 'A', label: 'Excellent', color: '#16a34a', light: '#22c55e', bg: 'rgba(34,197,94,0.10)', glow: 'rgba(34,197,94,0.25)' }
  if (score >= 700) return { tier: 'B', label: 'Good',      color: '#1d4ed8', light: '#3b82f6', bg: 'rgba(59,130,246,0.10)', glow: 'rgba(59,130,246,0.25)' }
  if (score >= 650) return { tier: 'C', label: 'Fair',      color: '#b45309', light: '#f59e0b', bg: 'rgba(245,158,11,0.10)', glow: 'rgba(245,158,11,0.25)' }
  return                    { tier: 'D', label: 'Building',  color: '#b91c1c', light: '#ef4444', bg: 'rgba(239,68,68,0.10)',  glow: 'rgba(239,68,68,0.25)'  }
}

function statusMeta(s: LoanStatus) {
  return {
    active:  { label: 'Active',  color: '#16a34a', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.2)'  },
    repaid:  { label: 'Repaid',  color: '#2d6349', bg: 'rgba(45,99,73,0.10)',   border: 'rgba(45,99,73,0.2)'   },
    overdue: { label: 'Overdue', color: '#b91c1c', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.2)'  },
  }[s]
}

function getDueDate(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function uid() { return `loan-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

function fmtKES(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Persistent state hook                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function useDemoLoans() {
  const [loans, setLoans]       = useState<SavedLoan[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setLoans(raw ? JSON.parse(raw) : SEED_LOANS)
    } catch { setLoans(SEED_LOANS) }
    setHydrated(true)
  }, [])

  function save(next: SavedLoan[]) {
    setLoans(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  function addLoan(loan: SavedLoan) { save([loan, ...loans]) }
  function resetLoans() { save(SEED_LOANS) }

  return { loans, addLoan, resetLoans, hydrated }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Global Styles                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

      @keyframes ringDraw {
        from { stroke-dashoffset: 440; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(-14px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes countUp {
        from { opacity: 0; transform: translateY(8px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.88); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33%       { transform: translateY(-8px) rotate(1deg); }
        66%       { transform: translateY(-4px) rotate(-1deg); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes pulse-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50%       { transform: scale(1.5); opacity: 0.6; }
      }
      @keyframes confetti {
        0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        100% { opacity: 0; transform: translateY(60px) rotate(400deg) scale(0.5); }
      }
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 0 0 var(--glow, rgba(45,99,73,0.3)); }
        50%       { box-shadow: 0 0 0 12px transparent; }
      }

      .anim-fadeUp   { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
      .anim-fadeIn   { animation: fadeIn 0.35s ease both; }
      .anim-slide    { animation: slideRight 0.38s cubic-bezier(0.22,1,0.36,1) both; }
      .anim-scale    { animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      .anim-count    { animation: countUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
      .ring-draw     { animation: ringDraw 1.4s cubic-bezier(0.4,0,0.2,1) forwards; }
      .float         { animation: float 4s ease-in-out infinite; }
      .shimmer-gold  {
        background: linear-gradient(90deg, #b45309 0%, #f59e0b 40%, #fbbf24 50%, #f59e0b 60%, #b45309 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3.5s linear infinite;
      }
      .shimmer-green {
        background: linear-gradient(90deg, #2d6349 0%, #16a34a 40%, #22c55e 50%, #16a34a 60%, #2d6349 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 3.5s linear infinite;
      }

      .card-lift {
        transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, border-color 0.18s ease;
      }
      .card-lift:hover {
        transform: translateY(-4px) scale(1.012);
        box-shadow: 0 16px 40px -8px rgba(45,99,73,0.18);
      }
      .card-lift:active { transform: scale(0.98); }

      .btn-primary {
        transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        position: relative;
        overflow: hidden;
      }
      .btn-primary::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        pointer-events: none;
      }
      .btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px -4px rgba(45,99,73,0.4); }
      .btn-primary:active { transform: scale(0.98); box-shadow: none; }

      .btn-gold {
        transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        position: relative; overflow: hidden;
      }
      .btn-gold::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        pointer-events: none;
      }
      .btn-gold:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px -4px rgba(180,83,9,0.4); }
      .btn-gold:active { transform: scale(0.98); }

      input[type=range] {
        -webkit-appearance: none; appearance: none;
        width: 100%; height: 6px; border-radius: 9999px; outline: none; cursor: pointer;
        background: linear-gradient(to right, #2d6349 var(--pct, 0%), rgba(45,99,73,0.15) var(--pct, 0%));
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 24px; height: 24px; border-radius: 9999px;
        background: #2d6349; border: 3px solid white;
        box-shadow: 0 2px 10px rgba(45,99,73,0.5), 0 0 0 0 rgba(45,99,73,0.3);
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      input[type=range]::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 4px 14px rgba(45,99,73,0.6), 0 0 0 6px rgba(45,99,73,0.12);
      }
      input[type=range]::-moz-range-thumb {
        width: 24px; height: 24px; border-radius: 9999px;
        background: #2d6349; border: 3px solid white;
        box-shadow: 0 2px 10px rgba(45,99,73,0.5);
        cursor: pointer;
      }

      .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

      .glass {
        backdrop-filter: blur(16px) saturate(1.6);
        -webkit-backdrop-filter: blur(16px) saturate(1.6);
      }

      .stagger-1 { animation-delay: 0.05s; }
      .stagger-2 { animation-delay: 0.10s; }
      .stagger-3 { animation-delay: 0.15s; }
      .stagger-4 { animation-delay: 0.20s; }
      .stagger-5 { animation-delay: 0.25s; }
      .stagger-6 { animation-delay: 0.30s; }

      .confetti-piece { animation: confetti 0.8s ease-out forwards; }
    `}</style>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Score Ring (SVG)                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const meta   = scoreMeta(score)
  const pct    = (score - 300) / 550
  const r      = 66
  const circ   = 2 * Math.PI * r  // ≈ 414.7
  const offset = circ * (1 - pct)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="80" cy="80" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? offset : circ}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${meta.glow})` }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={meta.color} />
            <stop offset="100%" stopColor={meta.light} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-playfair text-[38px] font-black text-white leading-none anim-count" style={{ animationDelay: '0.3s' }}>
          {score}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: meta.light }}>
          {meta.label}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Step Progress                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => {
        const done    = i < current
        const active  = i === current
        const last    = i === steps.length - 1
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-400"
                style={{
                  background: done ? '#2d6349' : active ? 'rgba(45,99,73,0.15)' : 'rgba(45,99,73,0.06)',
                  color:      done ? 'white'   : active ? '#2d6349' : 'rgba(45,99,73,0.4)',
                  border:     active ? '2px solid #2d6349' : done ? '2px solid #2d6349' : '2px solid rgba(45,99,73,0.15)',
                  boxShadow:  active ? '0 0 0 4px rgba(45,99,73,0.12)' : 'none',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className="text-[9px] font-semibold mt-1 text-center whitespace-nowrap"
                style={{ color: active ? '#2d6349' : done ? '#2d6349' : 'rgba(45,99,73,0.4)' }}>
                {label}
              </span>
            </div>
            {!last && (
              <div className="h-[2px] flex-1 mx-1 rounded-full overflow-hidden" style={{ background: 'rgba(45,99,73,0.10)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: done ? '100%' : '0%', background: '#2d6349' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Atoms                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function Avatar({ initials, score, size = 'md' }: { initials: string; score?: number; size?: 'sm'|'md'|'lg'|'xl' }) {
  const meta = score ? scoreMeta(score) : null
  const dim  = { sm: 'w-9 h-9 text-[11px]', md: 'w-12 h-12 text-[14px]', lg: 'w-16 h-16 text-[18px]', xl: 'w-20 h-20 text-[22px]' }[size]
  return (
    <div className={`${dim} rounded-2xl flex items-center justify-center font-black flex-shrink-0 relative select-none`}
      style={{
        background: meta ? `linear-gradient(135deg, ${meta.bg}, ${meta.bg.replace('0.10', '0.18')})` : 'rgba(45,99,73,0.10)',
        color: meta ? meta.color : '#2d6349',
        border: `1.5px solid ${meta ? meta.bg.replace('0.10', '0.25') : 'rgba(45,99,73,0.15)'}`,
        boxShadow: meta ? `0 2px 12px ${meta.glow}` : 'none',
      }}>
      {initials}
      {score && (
        <span className="absolute -bottom-1.5 -right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white leading-none shadow-md"
          style={{ background: `linear-gradient(135deg, ${meta!.color}, ${meta!.light})` }}>
          {meta!.tier}
        </span>
      )}
    </div>
  )
}

function ScoreBar({ score }: { score: number }) {
  const meta = scoreMeta(score)
  const pct  = ((score - 300) / 550) * 100
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(45,99,73,0.10)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}, ${meta.light})`, boxShadow: `0 0 6px ${meta.glow}` }} />
      </div>
      <span className="text-[12px] font-black tabular-nums" style={{ color: meta.color }}>{score}</span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
        {meta.tier}
      </span>
    </div>
  )
}

function BackBtn({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-forest transition-all mb-5 group">
      <span className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-translate-x-0.5"
        style={{ background: 'rgba(45,99,73,0.08)', color: '#2d6349' }}>
        ←
      </span>
      {label}
    </button>
  )
}

function DetailRow({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-forest/3 transition-colors">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={`font-bold ${mono ? 'font-mono tracking-wider' : ''} ${accent ? 'font-playfair text-[20px] text-forest' : 'text-[14px] text-forest'}`}>
        {value}
      </span>
    </div>
  )
}

function SummaryTable({ rows }: { rows: { label: string; value: string; accent?: boolean; mono?: boolean }[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.10)' }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ borderTop: i > 0 ? '1px solid rgba(45,99,73,0.07)' : 'none' }}>
          <DetailRow {...r} />
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color, icon, delay = '0s' }: {
  label: string; value: string; sub?: string; color?: string; icon?: string; delay?: string
}) {
  return (
    <div className="rounded-2xl p-5 anim-fadeUp" style={{
      background: 'white',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      animationDelay: delay,
    }}>
      {icon && <div className="text-xl mb-2">{icon}</div>}
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</p>
      <p className="font-playfair text-[28px] font-black mt-1.5 leading-none" style={{ color: color ?? '#2d6349' }}>{value}</p>
      {sub && <p className="text-[11px] text-muted mt-1.5">{sub}</p>}
    </div>
  )
}

function AmountField({ value, onChange, min, max, placeholder }: {
  value: string; onChange: (v: string) => void; min?: number; max?: number; placeholder?: string
}) {
  const num = parseFloat(value) || 0
  return (
    <div className="relative group">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted select-none z-10 transition-colors group-focus-within:text-forest">KES</span>
      <input
        type="number" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? '0'} min={min} max={max}
        className="w-full rounded-2xl pl-16 pr-5 py-5 text-[32px] font-black text-forest focus:outline-none transition-all bg-white"
        style={{
          border: '2px solid rgba(45,99,73,0.15)',
          boxShadow: 'inset 0 2px 4px rgba(45,99,73,0.04)',
        }}
        onFocus={e => { e.target.style.border = '2px solid rgba(45,99,73,0.5)'; e.target.style.boxShadow = '0 0 0 4px rgba(45,99,73,0.10), inset 0 2px 4px rgba(45,99,73,0.04)' }}
        onBlur={e =>  { e.target.style.border = '2px solid rgba(45,99,73,0.15)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(45,99,73,0.04)' }}
      />
      {num > 0 && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-muted">
          {fmtKES(num)}
        </div>
      )}
    </div>
  )
}

function Chips({ items, active, onSelect, fmt }: {
  items: number[]; active: number; onSelect: (v: number) => void; fmt?: (v: number) => string
}) {
  const label = fmt ?? (v => v >= 1000 ? `${v/1000}k` : `${v}`)
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(v => (
        <button key={v} onClick={() => onSelect(v)}
          className="px-4 py-2 text-[13px] font-bold rounded-xl transition-all"
          style={{
            background:   active === v ? '#2d6349' : 'rgba(45,99,73,0.06)',
            color:        active === v ? 'white'   : '#2d6349',
            border:       active === v ? '2px solid #2d6349' : '2px solid rgba(45,99,73,0.10)',
            transform:    active === v ? 'scale(1.04)' : 'scale(1)',
            boxShadow:    active === v ? '0 4px 12px rgba(45,99,73,0.25)' : 'none',
          }}>
          {label(v)}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: LoanStatus }) {
  const m = statusMeta(status)
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 pulse-dot" style={{ background: m.color }} />
      {m.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BORROW FLOW                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function BorrowFlow({ onBack, onDone }: { onBack: () => void; onDone: (loan: SavedLoan) => void }) {
  const [step, setStep]   = useState<BorrowStep>('form')
  const [amount, setAmount] = useState('')
  const [days, setDays]   = useState(7)
  const [lender, setLender] = useState<Lender | null>(null)

  const num       = parseFloat(amount) || 0
  const maxBorrow = MY_SAVINGS * 0.6
  const sliderPct = ((days - 5) / (20 - 5)) * 100

  const stepIndex = { form: 0, lenders: 1, confirm: 2, done: 3 }[step]

  /* ── DONE ── */
  if (step === 'done' && lender) {
    const rate     = effectiveRate(lender.interestRatePerWeek, MY_TRUST_SCORE)
    const interest = calcInterest(num, rate, days)
    const loan: SavedLoan = {
      id: uid(), role: 'borrower', counterparty: lender.name,
      counterpartyPhone: '0722 *** 431',
      amount: num, totalRepayable: num + interest, tenor: days,
      dueDate: getDueDate(days), interestAmount: parseFloat(interest.toFixed(0)),
      status: 'active', createdAt: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    return (
      <div className="space-y-6 anim-scale">
        {/* Success Hero */}
        <div className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a3d28 0%, #2d6349 50%, #143020 100%)' }}>
          {/* Decorative rings */}
          {[80, 130, 180].map((s, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6 pointer-events-none"
              style={{ width: s + 60, height: s + 60, animationDelay: `${i * 0.2}s` }} />
          ))}
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 float relative z-10"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            ✅
          </div>
          <h2 className="font-playfair text-[36px] font-black text-white mb-3 relative z-10">Request Sent!</h2>
          <p className="text-white/60 text-[14px] leading-relaxed max-w-sm mx-auto relative z-10">
            <span className="text-white font-semibold">{lender.name}</span> has been notified. Funds land in your account instantly on approval — usually within a few hours.
          </p>
        </div>

        <SummaryTable rows={[
          { label: 'Lender',          value: lender.name },
          { label: 'Amount',          value: `KES ${num.toLocaleString()}` },
          { label: 'Tenor',           value: `${days} days` },
          { label: 'Interest',        value: `KES ${interest.toFixed(0)}` },
          { label: 'Total to repay',  value: `KES ${(num + interest).toFixed(0)}`, accent: true },
          { label: 'Due date',        value: getDueDate(days) },
        ]} />

        <div className="rounded-2xl px-5 py-4 text-[12px] text-muted text-center"
          style={{ background: 'rgba(45,99,73,0.05)', border: '1px solid rgba(45,99,73,0.10)' }}>
          Repayment is auto-debited from your SACCO savings on the due date. You can also repay early from My Loans.
        </div>

        <button onClick={() => onDone(loan)} className="w-full py-4 text-white font-black text-[15px] rounded-2xl btn-primary"
          style={{ background: 'linear-gradient(135deg, #2d6349, #1a3d28)' }}>
          Go to My Loans →
        </button>
      </div>
    )
  }

  /* ── CONFIRM ── */
  if (step === 'confirm' && lender) {
    const rate     = effectiveRate(lender.interestRatePerWeek, MY_TRUST_SCORE)
    const interest = calcInterest(num, rate, days)
    const myMeta   = scoreMeta(MY_TRUST_SCORE)
    return (
      <div className="space-y-6 anim-fadeUp">
        <BackBtn onClick={() => setStep('lenders')} />
        <StepProgress steps={['Amount', 'Lender', 'Confirm']} current={2} />

        {/* Lender hero card */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(45,99,73,0.12)' }}>
          <div className="px-6 py-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2d6349 0%, #1a3d28 100%)' }}>
            <Avatar initials={lender.initials} size="lg" />
            <div className="flex-1">
              <h3 className="font-bold text-white text-[22px] leading-tight">{lender.name}</h3>
              <p className="text-white/60 text-[13px] mt-1">{lender.loansGiven} loans funded · {lender.successRate}% repaid on time</p>
              <div className="mt-3 w-52">
                <ScoreBar score={lender.trustScore} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Your rate', value: `${rate.toFixed(2)}%`, sub: 'per week · flat', color: '#b45309', big: true },
                { label: 'Interest',  value: `KES ${interest.toFixed(0)}`, sub: 'total cost', color: '#b91c1c', big: false },
                { label: 'Due date',  value: getDueDate(days), sub: `${days} days`, color: '#2d6349', big: false },
              ].map(d => (
                <div key={d.label} className="rounded-2xl p-4 text-center"
                  style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                  <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">{d.label}</p>
                  <p className={`font-playfair font-black leading-none mt-2 ${d.big ? 'text-[32px]' : 'text-[20px]'}`}
                    style={{ color: d.color }}>{d.value}</p>
                  <p className="text-[10px] text-muted mt-1.5">{d.sub}</p>
                </div>
              ))}
            </div>

            <SummaryTable rows={[
              { label: 'You receive',     value: `KES ${num.toLocaleString()}` },
              { label: 'Interest',        value: `KES ${interest.toFixed(0)}` },
              { label: 'Total repayable', value: `KES ${(num + interest).toFixed(0)}`, accent: true },
            ]} />

            {riskPremium(MY_TRUST_SCORE) === 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="text-lg">✦</span>
                <p className="text-[12px] font-semibold" style={{ color: '#16a34a' }}>
                  Tier {myMeta.tier} score — best available rate, zero risk premium.
                </p>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setStep('done')} className="w-full py-4 text-forest font-black text-[16px] rounded-2xl btn-gold"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          Confirm — Request KES {num.toLocaleString()} →
        </button>
        <p className="text-[11px] text-muted text-center">Lender has 24 hours to approve. Funds disbursed instantly on approval.</p>
      </div>
    )
  }

  /* ── LENDERS ── */
  if (step === 'lenders') {
    return (
      <div className="space-y-5 anim-fadeUp">
        <BackBtn onClick={() => setStep('form')} />
        <StepProgress steps={['Amount', 'Lender', 'Confirm']} current={1} />
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-playfair text-[28px] font-black text-forest leading-tight">Choose a Lender</h2>
            <p className="text-[13px] text-muted mt-1">
              For <span className="font-bold text-forest">KES {num.toLocaleString()}</span> over {days} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Your score</p>
            <p className="font-playfair text-[24px] font-black" style={{ color: scoreMeta(MY_TRUST_SCORE).color }}>{MY_TRUST_SCORE}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LENDERS.map((l, idx) => {
            const rate     = effectiveRate(l.interestRatePerWeek, MY_TRUST_SCORE)
            const interest = calcInterest(num, rate, days)
            const cheapest = idx === [...LENDERS].sort((a,b) => effectiveRate(a.interestRatePerWeek, MY_TRUST_SCORE) - effectiveRate(b.interestRatePerWeek, MY_TRUST_SCORE))[0].id.charCodeAt(0) - 'L'.charCodeAt(0)
            return (
              <button key={l.id} onClick={() => { setLender(l); setStep('confirm') }}
                className="text-left rounded-2xl p-5 card-lift anim-fadeUp"
                style={{
                  background: 'white',
                  border: '2px solid rgba(45,99,73,0.08)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  animationDelay: `${idx * 0.07}s`,
                }}>
                {l.successRate === 100 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold mb-3 px-2.5 py-1 rounded-full w-fit"
                    style={{ background: 'rgba(34,197,94,0.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                    100% repayment rate
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar initials={l.initials} size="md" />
                  <div className="flex-1">
                    <p className="font-bold text-forest text-[16px]">{l.name}</p>
                    <p className="text-[12px] text-muted">{l.loansGiven} loans funded</p>
                  </div>
                </div>
                <ScoreBar score={l.trustScore} />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                    <p className="text-[10px] text-muted font-semibold">Your rate</p>
                    <p className="font-playfair text-[24px] font-black mt-0.5 shimmer-gold">{rate.toFixed(2)}%</p>
                    <p className="text-[9px] text-muted">per week</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                    <p className="text-[10px] text-muted font-semibold">Total repay</p>
                    <p className="font-playfair text-[20px] font-black text-forest mt-0.5">{(num + interest).toFixed(0)}</p>
                    <p className="text-[9px] text-muted">KES</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 text-[12px] font-bold text-muted group-hover:text-forest transition-colors">
                  Select lender <span className="text-[16px]">→</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── FORM ── */
  const myMeta   = scoreMeta(MY_TRUST_SCORE)
  const hasAmount = num >= 2000
  return (
    <div className="space-y-8 anim-fadeUp">
      <BackBtn onClick={onBack} />
      <StepProgress steps={['Amount', 'Lender', 'Confirm']} current={0} />

      <div>
        <h2 className="font-playfair text-[34px] font-black text-forest leading-tight">Borrow Money</h2>
        <p className="text-[14px] text-muted mt-1">Short-term emergency loans from fellow SACCO members</p>
      </div>

      {/* Score tile */}
      <div className="flex items-center gap-4 rounded-2xl p-5"
        style={{ background: `linear-gradient(135deg, ${myMeta.bg}, rgba(45,99,73,0.05))`, border: `1px solid ${myMeta.bg.replace('0.10','0.2')}` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[20px] text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${myMeta.color}, ${myMeta.light})`, boxShadow: `0 4px 16px ${myMeta.glow}` }}>
          {myMeta.tier}
        </div>
        <div className="flex-1">
          <p className="font-bold text-forest text-[16px]">TrustScore {MY_TRUST_SCORE} — {myMeta.label}</p>
          <p className="text-[12px] text-muted mt-0.5">No risk premium · best available rates apply</p>
          <div className="mt-2.5"><ScoreBar score={MY_TRUST_SCORE} /></div>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block">How much do you need?</label>
        <AmountField value={amount} onChange={setAmount} min={2000} max={maxBorrow} placeholder="0" />
        <div className="flex justify-between text-[11px] text-muted px-1">
          <span>Min KES 2,000</span>
          <span>Max KES {maxBorrow.toLocaleString()} (60% of savings)</span>
        </div>
        <Chips items={[5000, 10000, 20000, 30000]} active={num} onSelect={v => setAmount(String(v))} />
      </div>

      {/* Tenor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-muted uppercase tracking-widest">Repayment period</label>
          <div className="flex items-baseline gap-1">
            <span className="font-playfair text-[36px] font-black text-forest leading-none">{days}</span>
            <span className="text-[16px] font-semibold text-muted">days</span>
          </div>
        </div>
        <input type="range" min={5} max={20} value={days}
          onChange={e => setDays(+e.target.value)}
          style={{ '--pct': `${sliderPct}%` } as React.CSSProperties}
        />
        <div className="flex justify-between text-[11px] text-muted px-0.5">
          <span>5 days</span><span>20 days</span>
        </div>
        <Chips items={[5, 7, 10, 14, 20]} active={days} onSelect={setDays} fmt={v => `${v}d`} />
      </div>

      {/* Estimate */}
      {hasAmount && (
        <div className="rounded-2xl p-5 space-y-4 anim-scale"
          style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.12)' }}>
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Repayment estimate</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'You receive',    value: `KES ${num.toLocaleString()}`, color: '#2d6349' },
              { label: 'Interest range', value: `${calcInterest(num,0.60,days).toFixed(0)}–${calcInterest(num,0.80+riskPremium(MY_TRUST_SCORE),days).toFixed(0)}`, color: '#b45309' },
              { label: 'Total repay',    value: `KES ${(num + calcInterest(num,0.65+riskPremium(MY_TRUST_SCORE),days)).toFixed(0)}`, color: '#2d6349' },
            ].map(d => (
              <div key={d.label} className="rounded-xl p-3.5 text-center bg-white"
                style={{ border: '1px solid rgba(45,99,73,0.08)' }}>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">{d.label}</p>
                <p className="font-bold text-[13px] mt-1.5" style={{ color: d.color }}>{d.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">Final rate depends on your chosen lender. All fees disclosed upfront.</p>
        </div>
      )}

      <button onClick={() => setStep('lenders')} disabled={num < 2000 || num > maxBorrow}
        className="w-full py-5 text-white font-black text-[16px] rounded-2xl btn-primary"
        style={{ background: num >= 2000 && num <= maxBorrow ? 'linear-gradient(135deg, #2d6349, #1a3d28)' : undefined,
                 opacity: num < 2000 || num > maxBorrow ? 0.45 : 1,
                 cursor: num < 2000 || num > maxBorrow ? 'not-allowed' : 'pointer' }}>
        See Available Lenders →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LEND FLOW                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function LendFlow({ onBack, onDone }: { onBack: () => void; onDone: (loan: SavedLoan) => void }) {
  const [step, setStep]       = useState<LendStep>('form')
  const [amount, setAmount]   = useState('')
  const [borrower, setBorrower] = useState<Borrower | null>(null)

  const num      = parseFloat(amount) || 0
  const eligible = BORROWERS.filter(b => b.requestedAmount <= num)

  /* ── DONE ── */
  if (step === 'done' && borrower) {
    const rate     = effectiveRate(MY_BASE_RATE, borrower.trustScore)
    const interest = calcInterest(borrower.requestedAmount, rate, borrower.tenor)
    const loan: SavedLoan = {
      id: uid(), role: 'lender', counterparty: borrower.name,
      amount: borrower.requestedAmount, totalRepayable: borrower.requestedAmount + interest,
      tenor: borrower.tenor, dueDate: getDueDate(borrower.tenor),
      interestAmount: parseFloat(interest.toFixed(0)),
      status: 'active', createdAt: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    return (
      <div className="space-y-6 anim-scale">
        <div className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a3d28 0%, #2d6349 50%, #143020 100%)' }}>
          {[80, 130, 180].map((s, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none"
              style={{ width: s + 60, height: s + 60 }} />
          ))}
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 float relative z-10"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}>
            🤝
          </div>
          <h2 className="font-playfair text-[36px] font-black text-white mb-3 relative z-10">Offer Sent!</h2>
          <p className="text-white/60 text-[14px] leading-relaxed max-w-sm mx-auto relative z-10">
            <span className="text-white font-semibold">{borrower.name}</span> has been notified.
            Funds are held in escrow until they confirm. Your interest arrives on the due date.
          </p>

          {/* Interest earned callout */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 relative z-10"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">You earn</p>
              <p className="font-playfair text-[28px] font-black shimmer-gold leading-none">KES {interest.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <SummaryTable rows={[
          { label: 'Borrower',         value: borrower.name },
          { label: 'Loan amount',      value: `KES ${borrower.requestedAmount.toLocaleString()}` },
          { label: 'Tenor',            value: `${borrower.tenor} days` },
          { label: 'Rate',             value: `${effectiveRate(MY_BASE_RATE, borrower.trustScore).toFixed(2)}% / week` },
          { label: 'Interest earned',  value: `KES ${interest.toFixed(0)}` },
          { label: 'You receive back', value: `KES ${(borrower.requestedAmount + interest).toFixed(0)}`, accent: true },
          { label: 'Due date',         value: getDueDate(borrower.tenor) },
        ]} />

        <p className="text-[12px] text-muted text-center">
          Borrower's SACCO savings serve as collateral. Repayment auto-debited at maturity.
        </p>
        <button onClick={() => onDone(loan)} className="w-full py-4 text-white font-black text-[15px] rounded-2xl btn-primary"
          style={{ background: 'linear-gradient(135deg, #2d6349, #1a3d28)' }}>
          Go to My Loans →
        </button>
      </div>
    )
  }

  /* ── CONFIRM ── */
  if (step === 'confirm' && borrower) {
    const rate     = effectiveRate(MY_BASE_RATE, borrower.trustScore)
    const interest = calcInterest(borrower.requestedAmount, rate, borrower.tenor)
    const meta     = scoreMeta(borrower.trustScore)
    return (
      <div className="space-y-6 anim-fadeUp">
        <BackBtn onClick={() => { setBorrower(null); setStep('borrowers') }} />
        <StepProgress steps={['Amount', 'Borrower', 'Confirm']} current={2} />

        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: '1px solid rgba(45,99,73,0.12)' }}>
          <div className="px-6 py-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2d6349 0%, #1a3d28 100%)' }}>
            <Avatar initials={borrower.initials} size="lg" score={borrower.trustScore} />
            <div className="flex-1">
              <h3 className="font-bold text-white text-[22px] leading-tight">{borrower.name}</h3>
              <p className="text-white/60 text-[13px] mt-1">Member since {borrower.memberSince} · {borrower.repaymentRate}% on-time</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] font-black px-3 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                  Tier {meta.tier} · {meta.label}
                </span>
                <span className="text-white/70 text-[13px] font-bold">{borrower.trustScore}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white space-y-5">
            <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
              style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
              <span className="text-xl mt-0.5">📋</span>
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Loan purpose</p>
                <p className="font-bold text-forest text-[15px] mt-0.5">{borrower.purpose}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Requesting', value: `KES ${(borrower.requestedAmount/1000).toFixed(0)}k` },
                { label: 'Tenor',      value: `${borrower.tenor} days` },
                { label: 'On-time',    value: `${borrower.repaymentRate}%` },
              ].map(d => (
                <div key={d.label} className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                  <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">{d.label}</p>
                  <p className="font-playfair text-[24px] font-black text-forest mt-1.5">{d.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2.5">Your Return</p>
              <SummaryTable rows={[
                { label: 'You lend',           value: `KES ${borrower.requestedAmount.toLocaleString()}` },
                { label: `Interest (${rate.toFixed(2)}%/wk)`, value: `+ KES ${interest.toFixed(0)}` },
                { label: 'You receive back',    value: `KES ${(borrower.requestedAmount + interest).toFixed(0)}`, accent: true },
              ]} />
            </div>

            {riskPremium(borrower.trustScore) > 0 && (
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span className="text-lg flex-shrink-0">⚡</span>
                <p className="text-[12px] font-medium" style={{ color: '#b45309' }}>
                  +{riskPremium(borrower.trustScore).toFixed(2)}% risk premium for Tier {meta.tier} — higher risk, higher return.
                </p>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setStep('done')} className="w-full py-4 text-forest font-black text-[16px] rounded-2xl btn-gold"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
          Approve — Lend KES {borrower.requestedAmount.toLocaleString()} →
        </button>
        <p className="text-[11px] text-muted text-center">SACCO savings held as collateral. Auto-debit at maturity date.</p>
      </div>
    )
  }

  /* ── BORROWERS ── */
  if (step === 'borrowers') {
    return (
      <div className="space-y-5 anim-fadeUp">
        <BackBtn onClick={() => setStep('form')} />
        <StepProgress steps={['Amount', 'Borrower', 'Confirm']} current={1} />
        <div>
          <h2 className="font-playfair text-[28px] font-black text-forest leading-tight">Borrower Requests</h2>
          <p className="text-[13px] text-muted mt-1">
            {eligible.length} requests within your <span className="font-bold text-forest">KES {num.toLocaleString()}</span> budget
          </p>
        </div>

        {eligible.length === 0 && (
          <div className="rounded-3xl p-12 text-center space-y-3"
            style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.10)' }}>
            <p className="text-4xl">🔍</p>
            <p className="font-playfair font-black text-forest text-[22px]">No matching requests</p>
            <p className="text-[13px] text-muted">Increase your lending amount to see more borrowers.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eligible.sort((a,b) => b.trustScore - a.trustScore).map((b, idx) => {
            const rate     = effectiveRate(MY_BASE_RATE, b.trustScore)
            const interest = calcInterest(b.requestedAmount, rate, b.tenor)
            const meta     = scoreMeta(b.trustScore)
            return (
              <button key={b.id} onClick={() => { setBorrower(b); setStep('confirm') }}
                className="text-left rounded-2xl p-5 card-lift anim-fadeUp"
                style={{
                  background: 'white',
                  border: '2px solid rgba(45,99,73,0.08)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  animationDelay: `${idx * 0.07}s`,
                }}>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar initials={b.initials} size="md" score={b.trustScore} />
                  <div className="flex-1">
                    <p className="font-bold text-forest text-[16px]">{b.name}</p>
                    <p className="text-[12px] text-muted">Since {b.memberSince} · {b.repaymentRate}% on-time</p>
                  </div>
                  <div className="text-right">
                    <p className="font-playfair text-[24px] font-black text-forest leading-none">{(b.requestedAmount/1000).toFixed(0)}k</p>
                    <p className="text-[10px] text-muted">KES requested</p>
                  </div>
                </div>
                <ScoreBar score={b.trustScore} />
                <div className="mt-3 rounded-xl px-3 py-2 flex items-center gap-2"
                  style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                  <span className="text-base">📋</span>
                  <p className="text-[12px] text-muted">{b.purpose}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[12px] text-muted">{b.tenor} days tenor</span>
                  <span className="text-[13px] font-black" style={{ color: meta.color }}>
                    Earn KES {interest.toFixed(0)} →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  /* ── FORM ── */
  return (
    <div className="space-y-8 anim-fadeUp">
      <BackBtn onClick={onBack} />
      <StepProgress steps={['Amount', 'Borrower', 'Confirm']} current={0} />

      <div>
        <h2 className="font-playfair text-[34px] font-black text-forest leading-tight">Lend Money</h2>
        <p className="text-[14px] text-muted mt-1">Earn interest on idle savings by funding SACCO members</p>
      </div>

      {/* Steps overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '💰', num: '1', label: 'Set amount',    desc: 'How much you can lend' },
          { icon: '👤', num: '2', label: 'Pick borrower', desc: 'Review their full profile' },
          { icon: '✦',  num: '3', label: 'Earn interest', desc: 'Paid back at maturity' },
        ].map((s, i) => (
          <div key={s.num} className="rounded-2xl p-4 text-center anim-fadeUp"
            style={{ background: 'white', border: '1px solid rgba(45,99,73,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animationDelay: `${i * 0.08}s` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
              style={{ background: 'rgba(45,99,73,0.08)' }}>{s.icon}</div>
            <p className="font-bold text-forest text-[13px]">{s.label}</p>
            <p className="text-[11px] text-muted mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <label className="text-[11px] font-bold text-muted uppercase tracking-widest block">Amount you want to lend</label>
        <AmountField value={amount} onChange={setAmount} min={1000} placeholder="0" />
        <Chips items={[5000, 10000, 25000, 50000]} active={num} onSelect={v => setAmount(String(v))} />
      </div>

      {num >= 1000 && (
        <div className="rounded-2xl p-5 space-y-4 anim-scale"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}>
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">
            Potential earnings on KES {num.toLocaleString()}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[5, 7, 10, 14].map(d => (
              <div key={d} className="rounded-xl p-3.5 text-center bg-white"
                style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-[10px] text-muted font-semibold">{d} days</p>
                <p className="font-playfair font-black text-[22px] shimmer-gold mt-1">+{calcInterest(num, MY_BASE_RATE, d).toFixed(0)}</p>
                <p className="text-[10px] text-muted">KES</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">
            Base rate {MY_BASE_RATE}%/wk. Riskier borrowers earn you more.
          </p>
        </div>
      )}

      <button onClick={() => setStep('borrowers')} disabled={num < 1000}
        className="w-full py-5 text-white font-black text-[16px] rounded-2xl btn-primary"
        style={{ background: num >= 1000 ? 'linear-gradient(135deg, #2d6349, #1a3d28)' : undefined,
                 opacity: num < 1000 ? 0.4 : 1, cursor: num < 1000 ? 'not-allowed' : 'pointer' }}>
        See Borrower Requests →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MY LOANS VIEW                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function MyLoansView({ loans, onBack, onReset }: { loans: SavedLoan[]; onBack: () => void; onReset: () => void }) {
  const borrowerLoans = loans.filter(l => l.role === 'borrower')
  const lenderLoans   = loans.filter(l => l.role === 'lender')
  const totalLent     = lenderLoans.reduce((s,l) => s + l.amount, 0)
  const totalInterest = lenderLoans.reduce((s,l) => s + l.interestAmount, 0)
  const totalOwed     = borrowerLoans.filter(l => l.status === 'active').reduce((s,l) => s + l.totalRepayable, 0)

  function LoanCard({ loan, idx }: { loan: SavedLoan; idx: number }) {
    const sm         = statusMeta(loan.status)
    const isBorrower = loan.role === 'borrower'

    return (
      <div className="rounded-2xl overflow-hidden anim-fadeUp"
        style={{
          background: 'white',
          border: '1px solid rgba(45,99,73,0.08)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          animationDelay: `${idx * 0.06}s`,
        }}>
        {/* Role stripe */}
        <div className="h-1" style={{
          background: isBorrower
            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
            : 'linear-gradient(90deg, #2d6349, #22c55e)',
        }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: isBorrower ? 'rgba(245,158,11,0.10)' : 'rgba(34,197,94,0.10)',
                border: isBorrower ? '1.5px solid rgba(245,158,11,0.2)' : '1.5px solid rgba(34,197,94,0.2)',
              }}>
              {isBorrower ? '💸' : '💰'}
            </div>
            <div>
              <p className="font-bold text-forest text-[16px]">{loan.counterparty}</p>
              <p className="text-[12px] text-muted capitalize">{loan.role} · {loan.tenor} days · {loan.createdAt}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-playfair text-[24px] font-black text-forest leading-none">KES {loan.amount.toLocaleString()}</p>
            <StatusBadge status={loan.status} />
          </div>
        </div>

        {/* Borrower active block */}
        {isBorrower && loan.status === 'active' && (
          <div className="mx-5 mb-5 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="px-5 py-3 flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <span className="text-base">⏰</span>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#b45309' }}>What you need to repay</p>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.03)' }}>
              {[
                { label: 'Total repayable', value: `KES ${loan.totalRepayable.toLocaleString()}`, accent: true },
                { label: 'Due date',        value: loan.dueDate },
                { label: 'Send to',         value: loan.counterparty },
                ...(loan.counterpartyPhone ? [{ label: 'M-Pesa number', value: loan.counterpartyPhone, mono: true }] : []),
              ].map((r, i) => (
                <div key={r.label} style={{ borderTop: i > 0 ? '1px solid rgba(245,158,11,0.10)' : 'none' }}>
                  <DetailRow {...r} />
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-2" style={{ background: 'rgba(245,158,11,0.03)' }}>
              <p className="text-[11px] text-muted">Auto-debit will run from your SACCO savings on the due date.</p>
            </div>
          </div>
        )}

        {/* Lender stats */}
        {!isBorrower && (
          <div className="mx-5 mb-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Lent',      value: `KES ${loan.amount.toLocaleString()}`,  highlight: false },
              { label: 'Interest',  value: `KES ${loan.interestAmount}`,            highlight: true  },
              { label: 'Due back',  value: loan.dueDate,                            highlight: false },
            ].map(d => (
              <div key={d.label} className="rounded-xl p-3.5 text-center"
                style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">{d.label}</p>
                <p className="text-[14px] font-bold mt-1.5" style={{ color: d.highlight ? '#b45309' : '#2d6349' }}>{d.value}</p>
              </div>
            ))}
          </div>
        )}

        {loan.status === 'overdue' && (
          <div className="mx-5 mb-5 rounded-xl px-4 py-3 text-[12px] font-medium"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#b91c1c' }}>
            ⚠️ Overdue — recovery from borrower savings in progress. Score bonus frozen pending resolution.
          </div>
        )}

        {isBorrower && loan.status === 'active' && (
          <div className="border-t px-5 py-4" style={{ borderColor: 'rgba(45,99,73,0.08)' }}>
            <button className="w-full py-3 text-white text-[13px] font-bold rounded-xl btn-primary"
              style={{ background: 'linear-gradient(135deg, #2d6349, #1a3d28)' }}>
              Repay Early →
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <BackBtn onClick={onBack} />
          <h2 className="font-playfair text-[34px] font-black text-forest leading-tight">My Loans</h2>
          <p className="text-[14px] text-muted mt-1">Your borrowing and lending activity</p>
        </div>
        <button onClick={onReset}
          className="mt-10 text-[11px] font-semibold text-muted hover:text-terra transition-all px-3 py-1.5 rounded-xl"
          style={{ border: '1px solid rgba(45,99,73,0.15)' }}>
          ↺ Reset demo
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Lent"   value={`KES ${fmtKES(totalLent)}`}  sub={`${lenderLoans.length} loans`}  icon="💰" color="#2d6349" delay="0.05s" />
        <StatCard label="Interest Due" value={`KES ${totalInterest}`}        sub="Across all lender loans"        icon="📈" color="#b45309" delay="0.10s" />
        <StatCard label="You Owe"      value={totalOwed ? `KES ${fmtKES(totalOwed)}` : '—'} sub="Active borrower loans" icon="💳" color="#b91c1c" delay="0.15s" />
      </div>

      {borrowerLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-forest text-[16px] flex items-center gap-2.5 anim-slide">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>💸</span>
            Loans I've Taken ({borrowerLoans.length})
          </h3>
          {borrowerLoans.map((l, i) => <LoanCard key={l.id} loan={l} idx={i} />)}
        </div>
      )}

      {lenderLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-forest text-[16px] flex items-center gap-2.5 anim-slide">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'rgba(45,99,73,0.10)', border: '1px solid rgba(45,99,73,0.15)' }}>💰</span>
            Loans I've Given ({lenderLoans.length})
          </h3>
          {lenderLoans.map((l, i) => <LoanCard key={l.id} loan={l} idx={i} />)}
        </div>
      )}

      {loans.length === 0 && (
        <div className="rounded-3xl p-16 text-center space-y-3"
          style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)' }}>
          <p className="text-5xl">📭</p>
          <p className="font-playfair font-black text-forest text-[24px]">No loan activity yet</p>
          <p className="text-[13px] text-muted">Go borrow or lend to get started.</p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HOME VIEW                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function HomeView({ loans, onBorrow, onLend, onLoans }: {
  loans: SavedLoan[]; onBorrow: () => void; onLend: () => void; onLoans: () => void
}) {
  const meta    = scoreMeta(MY_TRUST_SCORE)
  const active  = loans.filter(l => l.status === 'active').length
  const overdue = loans.filter(l => l.status === 'overdue').length
  const totalInterestEarned = loans.filter(l => l.role === 'lender' && l.status === 'repaid').reduce((s,l) => s + l.interestAmount, 0)

  return (
    <div className="space-y-6">
      {/* ── Hero Card ── */}
      <div className="rounded-3xl p-8 relative overflow-hidden anim-fadeUp"
        style={{ background: 'linear-gradient(135deg, #1a3d28 0%, #2d6349 50%, #143020 100%)', minHeight: 200 }}>
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
        <div className="absolute right-12 -bottom-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
        <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

        <div className="flex items-start justify-between gap-6 relative">
          {/* Score ring + tier */}
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={MY_TRUST_SCORE} size={140} />
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: meta.bg, color: meta.light }}>
                Tier {meta.tier} · {meta.label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex flex-col gap-4 text-right">
            {[
              { label: 'Savings balance',  value: `KES ${(MY_SAVINGS/1000).toFixed(0)}k` },
              { label: 'On-time rate',     value: '100%' },
              { label: 'Interest earned',  value: totalInterestEarned > 0 ? `KES ${totalInterestEarned}` : '—' },
            ].map((s, i) => (
              <div key={s.label} className="anim-fadeUp" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                <p className="font-bold text-[18px] mt-0.5" style={{ color: 'rgba(255,255,255,0.95)' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 mt-6 relative">
          {['✓ Savings anchor', '✓ No active P2P debt', '✓ KYC verified', '✓ Best rates apply'].map((t, i) => (
            <span key={t} className="text-[11px] font-semibold px-3 py-1.5 rounded-full anim-fadeUp"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.10)',
                animationDelay: `${0.3 + i * 0.06}s`,
              }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main action cards ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Borrow */}
        <button onClick={onBorrow}
          className="text-left rounded-3xl p-7 card-lift anim-fadeUp"
          style={{
            background: 'white',
            border: '2px solid rgba(45,99,73,0.08)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
            animationDelay: '0.1s',
          }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1.5px solid rgba(245,158,11,0.2)' }}>
            💸
          </div>
          <p className="font-playfair font-black text-forest text-[26px] leading-none">Borrow</p>
          <p className="text-[13px] text-muted mt-2 leading-relaxed">Emergency funds from fellow members — instantly</p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[11px] text-muted font-semibold"
              style={{ background: 'rgba(45,99,73,0.06)', padding: '4px 10px', borderRadius: 8 }}>
              5 – 20 days
            </span>
            <span className="text-[18px] font-bold text-muted transition-colors group-hover:text-forest">→</span>
          </div>
        </button>

        {/* Lend */}
        <button onClick={onLend}
          className="text-left rounded-3xl p-7 card-lift relative overflow-hidden anim-fadeUp"
          style={{
            background: 'linear-gradient(135deg, #2d6349 0%, #1a3d28 100%)',
            boxShadow: '0 4px 24px rgba(45,99,73,0.35)',
            animationDelay: '0.16s',
          }}>
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.18)' }}>
            💰
          </div>
          <p className="font-playfair font-black text-white text-[26px] leading-none">Lend</p>
          <p className="text-[13px] leading-relaxed mt-2" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Earn interest on your idle savings
          </p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[12px] font-bold shimmer-gold">0.6 – 0.8% / week</span>
            <span className="text-[18px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>→</span>
          </div>
        </button>
      </div>

      {/* ── My Loans shortcut ── */}
      <button onClick={onLoans}
        className="w-full rounded-2xl p-5 flex items-center gap-4 group anim-fadeUp"
        style={{
          background: 'white',
          border: '1px solid rgba(45,99,73,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          animationDelay: '0.22s',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(45,99,73,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(45,99,73,0.06)', border: '1.5px solid rgba(45,99,73,0.10)' }}>
          📋
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-forest text-[16px]">My Loans</p>
          <p className="text-[13px] text-muted mt-0.5">
            {active > 0 && <span>{active} active</span>}
            {overdue > 0 && <span className="font-bold ml-1" style={{ color: '#b91c1c' }}>· {overdue} overdue</span>}
            {active === 0 && overdue === 0 && <span>No active loans</span>}
          </p>
        </div>
        {overdue > 0 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
            style={{ background: '#ef4444' }}>{overdue}</div>
        )}
        <span className="text-[24px] font-light text-muted transition-transform group-hover:translate-x-1">›</span>
      </button>

      {/* ── Info footer ── */}
      <div className="rounded-2xl p-5 space-y-3 anim-fadeUp"
        style={{ background: 'rgba(45,99,73,0.04)', border: '1px solid rgba(45,99,73,0.08)', animationDelay: '0.28s' }}>
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4">How P2P Lending Works</p>
        {[
          { icon: '🔒', title: 'Savings-secured',   desc: 'Loans capped at 60% of your SACCO savings. Auto-debit runs on due date.' },
          { icon: '📊', title: 'Risk-based pricing', desc: 'Lower TrustScore = higher interest. Improve yours by saving and repaying on time.' },
          { icon: '⚡', title: 'No stacking',        desc: 'One active P2P loan at a time. New requests blocked until current loan closes.' },
        ].map(({ icon, title, desc }, i) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(45,99,73,0.08)' }}>{icon}</span>
            <p className="text-[12px] text-muted leading-relaxed">
              <span className="font-bold text-forest">{title} — </span>{desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ROOT PAGE                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function P2PLendingPage() {
  const [view, setView] = useState<MainView>('home')
  const { loans, addLoan, resetLoans, hydrated } = useDemoLoans()

  function handleDone(loan: SavedLoan) {
    addLoan(loan)
    setView('loans')
  }

  if (!hydrated) {
    return (
      <DashboardShell>
        <GlobalStyles />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] animate-spin"
            style={{ borderColor: 'rgba(45,99,73,0.15)', borderTopColor: '#2d6349' }} />
          <p className="text-[13px] text-muted font-semibold">Loading your account…</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <GlobalStyles />
      <div className="w-full space-y-1">
        {view === 'home' && (
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #22c55e, #2d6349)' }} />
              <h1 className="font-playfair text-[38px] font-black text-forest leading-tight">P2P Lending</h1>
            </div>
            <p className="text-[14px] text-muted mt-1 pl-5">Member-to-member short-term loans · 5 to 20 days</p>
          </div>
        )}

        {view === 'home'   && <HomeView loans={loans} onBorrow={() => setView('borrow')} onLend={() => setView('lend')} onLoans={() => setView('loans')} />}
        {view === 'borrow' && <BorrowFlow onBack={() => setView('home')} onDone={handleDone} />}
        {view === 'lend'   && <LendFlow   onBack={() => setView('home')} onDone={handleDone} />}
        {view === 'loans'  && <MyLoansView loans={loans} onBack={() => setView('home')} onReset={resetLoans} />}
      </div>
    </DashboardShell>
  )
}