'use client'
import { useState, useEffect } from 'react'
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
const riskPremium = (s: number) => s >= 750 ? 0 : s >= 700 ? 0.20 : s >= 650 ? 0.40 : s >= 600 ? 0.70 : 1.20
const effectiveRate  = (base: number, score: number) => base + riskPremium(score)
const calcInterest   = (amt: number, rate: number, days: number) => (amt * rate / 100) * (days / 7)

function scoreMeta(score: number) {
  if (score >= 750) return { tier: 'A', label: 'Excellent', color: '#16a34a', light: '#22c55e', bg: 'rgba(34,197,94,0.10)' }
  if (score >= 700) return { tier: 'B', label: 'Good',      color: '#1d4ed8', light: '#3b82f6', bg: 'rgba(59,130,246,0.10)' }
  if (score >= 650) return { tier: 'C', label: 'Fair',      color: '#b45309', light: '#f59e0b', bg: 'rgba(245,158,11,0.10)' }
  return                    { tier: 'D', label: 'Building',  color: '#b91c1c', light: '#ef4444', bg: 'rgba(239,68,68,0.10)'  }
}

function statusMeta(s: LoanStatus) {
  return {
    active:  { label: 'Active',  color: '#16a34a', bg: 'rgba(34,197,94,0.10)'  },
    repaid:  { label: 'Repaid',  color: '#2d6349', bg: 'rgba(45,99,73,0.10)'   },
    overdue: { label: 'Overdue', color: '#b91c1c', bg: 'rgba(239,68,68,0.10)'  },
  }[s]
}

function getDueDate(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function uid() { return `loan-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Persistent state hook                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function useDemoLoans() {
  const [loans, setLoans] = useState<SavedLoan[]>([])
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
/*  Atoms                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function Avatar({ initials, score, size = 'md' }: { initials: string; score?: number; size?: 'sm'|'md'|'lg'|'xl' }) {
  const meta = score ? scoreMeta(score) : null
  const dim  = { sm: 'w-9 h-9 text-[11px]', md: 'w-12 h-12 text-[14px]', lg: 'w-16 h-16 text-[18px]', xl: 'w-20 h-20 text-[22px]' }[size]
  return (
    <div className={`${dim} rounded-2xl flex items-center justify-center font-black flex-shrink-0 relative select-none`}
      style={{ background: meta ? meta.bg : 'rgba(45,99,73,0.10)', color: meta ? meta.color : '#2d6349' }}>
      {initials}
      {score && (
        <span className="absolute -bottom-1.5 -right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white leading-none shadow-sm"
          style={{ background: meta!.light }}>
          {meta!.tier}
        </span>
      )}
    </div>
  )
}

function ScoreStrip({ score }: { score: number }) {
  const meta = scoreMeta(score)
  const pct  = ((score - 300) / 550) * 100
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full bg-black/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta.light }} />
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
      className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-forest transition-colors mb-4 group">
      <span className="w-7 h-7 rounded-xl bg-cream flex items-center justify-center text-[14px] group-hover:bg-forest/10 transition-colors">←</span>
      {label}
    </button>
  )
}

function DetailRow({ label, value, accent, mono }: { label: string; value: string; accent?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={`font-bold ${mono ? 'font-mono' : ''} ${accent ? 'font-playfair text-[20px] text-forest' : 'text-[14px] text-forest'}`}>
        {value}
      </span>
    </div>
  )
}

function SummaryTable({ rows }: { rows: { label: string; value: string; accent?: boolean; mono?: boolean }[] }) {
  return (
    <div className="bg-cream rounded-2xl divide-y divide-forest/8 overflow-hidden">
      {rows.map(r => <DetailRow key={r.label} {...r} />)}
    </div>
  )
}

function StatTile({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
      <p className="font-playfair text-[28px] font-black mt-1.5 leading-none" style={{ color: color ?? '#2d6349' }}>{value}</p>
      {sub && <p className="text-[11px] text-muted mt-1">{sub}</p>}
    </div>
  )
}

function AmountField({ value, onChange, min, max, placeholder }: {
  value: string; onChange: (v: string) => void; min?: number; max?: number; placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-muted select-none">KES</span>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? '0'} min={min} max={max}
        className="w-full border-2 border-forest/15 rounded-2xl pl-16 pr-5 py-5 text-[28px] font-black text-forest focus:outline-none focus:border-forest/50 transition-colors bg-white"
      />
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
          className={`px-4 py-2 text-[13px] font-bold rounded-xl border-2 transition-all ${
            active === v ? 'bg-forest text-white border-forest' : 'bg-white text-muted border-forest/12 hover:border-forest/30 hover:text-forest'
          }`}>
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
      style={{ background: m.bg, color: m.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
      {m.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BORROW FLOW                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function BorrowFlow({ onBack, onDone }: { onBack: () => void; onDone: (loan: SavedLoan) => void }) {
  const [step, setStep] = useState<BorrowStep>('form')
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState(7)
  const [lender, setLender] = useState<Lender | null>(null)

  const num     = parseFloat(amount) || 0
  const maxBorrow = MY_SAVINGS * 0.6

  /* DONE */
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
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-forest to-[#163320] rounded-3xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-5xl mx-auto mb-6">✅</div>
          <h2 className="font-playfair text-[32px] font-black text-white mb-2">Request Sent!</h2>
          <p className="text-white/60 text-[14px] leading-relaxed max-w-sm mx-auto">
            {lender.name} has been notified. Funds land in your account instantly on approval — usually within a few hours.
          </p>
        </div>
        <SummaryTable rows={[
          { label: 'Lender',          value: lender.name },
          { label: 'Amount',          value: `KES ${num.toLocaleString()}` },
          { label: 'Tenor',           value: `${days} days` },
          { label: 'Interest',        value: `KES ${interest.toFixed(0)}` },
          { label: 'Total to repay',  value: `KES ${(num+interest).toFixed(0)}`, accent: true },
          { label: 'Due date',        value: getDueDate(days) },
        ]} />
        <p className="text-[12px] text-muted text-center">
          Repayment is auto-debited from your SACCO savings on the due date. You can also repay early from My Loans.
        </p>
        <button onClick={() => onDone(loan)}
          className="w-full py-4 bg-forest text-white font-black text-[15px] rounded-2xl hover:bg-forest/90 transition-colors shadow-sm">
          Go to My Loans →
        </button>
      </div>
    )
  }

  /* CONFIRM */
  if (step === 'confirm' && lender) {
    const rate     = effectiveRate(lender.interestRatePerWeek, MY_TRUST_SCORE)
    const interest = calcInterest(num, rate, days)
    const myMeta   = scoreMeta(MY_TRUST_SCORE)
    return (
      <div className="space-y-6">
        <BackBtn onClick={() => setStep('lenders')} />
        {/* Lender hero */}
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-forest to-[#1a4228] px-6 py-5 flex items-center gap-4">
            <Avatar initials={lender.initials} size="lg" />
            <div className="flex-1">
              <h3 className="font-bold text-white text-[20px]">{lender.name}</h3>
              <p className="text-white/60 text-[13px] mt-0.5">{lender.loansGiven} loans funded · {lender.successRate}% repaid on time</p>
              <div className="mt-2 w-48"><ScoreStrip score={lender.trustScore} /></div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="bg-cream rounded-2xl p-4 text-center">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Your rate</p>
              <p className="font-playfair text-[36px] font-black leading-none mt-1.5" style={{ color: '#b45309' }}>{rate.toFixed(2)}%</p>
              <p className="text-[11px] text-muted mt-1">per week · flat</p>
            </div>
            <div className="bg-cream rounded-2xl p-4 text-center">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Interest</p>
              <p className="font-playfair text-[36px] font-black leading-none mt-1.5 text-terra">{interest.toFixed(0)}</p>
              <p className="text-[11px] text-muted mt-1">KES total</p>
            </div>
            <div className="bg-cream rounded-2xl p-4 text-center">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold">Due date</p>
              <p className="font-bold text-forest text-[16px] leading-tight mt-2">{getDueDate(days)}</p>
              <p className="text-[11px] text-muted mt-1">{days} days</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <SummaryTable rows={[
              { label: 'You receive',    value: `KES ${num.toLocaleString()}` },
              { label: 'Interest',       value: `KES ${interest.toFixed(0)}` },
              { label: 'Total repayable', value: `KES ${(num+interest).toFixed(0)}`, accent: true },
            ]} />
            {riskPremium(MY_TRUST_SCORE) === 0 && (
              <div className="mt-4 flex items-center gap-2.5 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-2xl px-4 py-3">
                <span className="text-lg">✦</span>
                <p className="text-[12px] font-semibold text-[#16a34a]">Tier {myMeta.tier} score — you're getting the best available rate with no risk premium</p>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setStep('done')}
          className="w-full py-4 bg-gold text-forest font-black text-[16px] rounded-2xl hover:bg-gold/90 transition-all active:scale-[0.99] shadow-sm">
          Confirm — Request KES {num.toLocaleString()} →
        </button>
        <p className="text-[11px] text-muted text-center">Lender has 24 hours to approve. Funds disbursed instantly on approval.</p>
      </div>
    )
  }

  /* LENDER LIST */
  if (step === 'lenders') {
    return (
      <div className="space-y-5">
        <BackBtn onClick={() => setStep('form')} />
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-playfair text-[28px] font-black text-forest">Choose a Lender</h2>
            <p className="text-[13px] text-muted mt-1">
              Showing lenders for <span className="font-bold text-forest">KES {num.toLocaleString()}</span> · {days} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted">Your TrustScore</p>
            <p className="font-playfair text-[22px] font-black" style={{ color: scoreMeta(MY_TRUST_SCORE).color }}>{MY_TRUST_SCORE}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {LENDERS.map(l => {
            const rate     = effectiveRate(l.interestRatePerWeek, MY_TRUST_SCORE)
            const interest = calcInterest(num, rate, days)
            return (
              <button key={l.id} onClick={() => { setLender(l); setStep('confirm') }}
                className="text-left bg-white rounded-2xl border-2 border-forest/8 shadow-sm hover:border-forest/30 hover:shadow-md transition-all p-5 group active:scale-[0.99]">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar initials={l.initials} size="md" />
                  <div className="flex-1">
                    <p className="font-bold text-forest text-[16px]">{l.name}</p>
                    <p className="text-[12px] text-muted">{l.loansGiven} loans · {l.successRate}% repaid</p>
                  </div>
                </div>
                <ScoreStrip score={l.trustScore} />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-cream rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted">Your rate</p>
                    <p className="font-playfair text-[22px] font-black text-gold mt-0.5">{rate.toFixed(2)}%</p>
                    <p className="text-[9px] text-muted">per week</p>
                  </div>
                  <div className="bg-cream rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted">Total repay</p>
                    <p className="font-playfair text-[18px] font-black text-forest mt-0.5">
                      {(num + interest).toFixed(0)}
                    </p>
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

  /* FORM */
  const myMeta = scoreMeta(MY_TRUST_SCORE)
  return (
    <div className="space-y-8">
      <BackBtn onClick={onBack} />
      <div>
        <h2 className="font-playfair text-[32px] font-black text-forest leading-tight">Borrow Money</h2>
        <p className="text-[14px] text-muted mt-1">Short-term emergency loans from fellow SACCO members</p>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-black/5 shadow-sm p-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-[18px] text-white flex-shrink-0"
          style={{ background: myMeta.light }}>
          {myMeta.tier}
        </div>
        <div className="flex-1">
          <p className="font-bold text-forest text-[16px]">TrustScore {MY_TRUST_SCORE} — {myMeta.label}</p>
          <p className="text-[12px] text-muted mt-0.5">No risk premium · best available rates apply</p>
          <div className="mt-2.5"><ScoreStrip score={MY_TRUST_SCORE} /></div>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <label className="text-[12px] font-bold text-muted uppercase tracking-widest block">How much do you need?</label>
        <AmountField value={amount} onChange={setAmount} min={2000} max={maxBorrow} placeholder="e.g. 10000" />
        <div className="flex justify-between text-[11px] text-muted px-1">
          <span>Minimum KES 2,000</span>
          <span>Maximum KES {maxBorrow.toLocaleString()} (60% of savings)</span>
        </div>
        <Chips items={[5000,10000,20000,30000]} active={num} onSelect={v => setAmount(String(v))} />
      </div>

      {/* Tenor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold text-muted uppercase tracking-widest">Repayment period</label>
          <span className="font-playfair text-[28px] font-black text-forest leading-none">{days} <span className="text-[16px]">days</span></span>
        </div>
        <div className="relative py-1">
          <input type="range" min={5} max={20} value={days} onChange={e => setDays(+e.target.value)}
            className="w-full h-2 rounded-full cursor-pointer" style={{ accentColor: '#2d6349' }} />
          <div className="flex justify-between text-[11px] text-muted mt-2 px-0.5">
            <span>5 days</span><span>20 days</span>
          </div>
        </div>
        <Chips items={[5,7,10,14,20]} active={days} onSelect={setDays} fmt={v => `${v}d`} />
      </div>

      {/* Estimate */}
      {num >= 2000 && (
        <div className="bg-forest/5 border border-forest/12 rounded-2xl p-5 space-y-3">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Repayment estimate</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'You receive', value: `KES ${num.toLocaleString()}` },
              { label: 'Interest range', value: `KES ${calcInterest(num,0.60,days).toFixed(0)}–${calcInterest(num,0.80+riskPremium(MY_TRUST_SCORE),days).toFixed(0)}` },
              { label: 'Total repay', value: `KES ${(num+calcInterest(num,0.65+riskPremium(MY_TRUST_SCORE),days)).toFixed(0)}` },
            ].map(d => (
              <div key={d.label} className="bg-white rounded-xl p-3.5 text-center border border-forest/8">
                <p className="text-[10px] text-muted uppercase tracking-wider">{d.label}</p>
                <p className="font-bold text-forest text-[14px] mt-1">{d.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">Final rate depends on which lender you choose. All fees disclosed upfront.</p>
        </div>
      )}

      <button onClick={() => setStep('lenders')} disabled={num < 2000 || num > maxBorrow}
        className="w-full py-5 bg-forest text-white font-black text-[16px] rounded-2xl hover:bg-forest/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] shadow-md">
        See Available Lenders →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LEND FLOW                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function LendFlow({ onBack, onDone }: { onBack: () => void; onDone: (loan: SavedLoan) => void }) {
  const [step, setStep] = useState<LendStep>('form')
  const [amount, setAmount] = useState('')
  const [borrower, setBorrower] = useState<Borrower | null>(null)

  const num      = parseFloat(amount) || 0
  const eligible = BORROWERS.filter(b => b.requestedAmount <= num)

  /* DONE */
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
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-forest to-[#163320] rounded-3xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-5xl mx-auto mb-6">🤝</div>
          <h2 className="font-playfair text-[32px] font-black text-white mb-2">Offer Sent!</h2>
          <p className="text-white/60 text-[14px] leading-relaxed max-w-sm mx-auto">
            {borrower.name} has been notified. Funds are held in escrow until they confirm. Your interest arrives on the due date.
          </p>
        </div>
        <SummaryTable rows={[
          { label: 'Borrower',         value: borrower.name },
          { label: 'Loan amount',      value: `KES ${borrower.requestedAmount.toLocaleString()}` },
          { label: 'Tenor',            value: `${borrower.tenor} days` },
          { label: 'Rate',             value: `${effectiveRate(MY_BASE_RATE, borrower.trustScore).toFixed(2)}% / week` },
          { label: 'Interest earned',  value: `KES ${interest.toFixed(0)}` },
          { label: 'You receive back', value: `KES ${(borrower.requestedAmount+interest).toFixed(0)}`, accent: true },
          { label: 'Due date',         value: getDueDate(borrower.tenor) },
        ]} />
        <p className="text-[12px] text-muted text-center">Borrower's SACCO savings serve as collateral. Repayment auto-debited at maturity.</p>
        <button onClick={() => onDone(loan)}
          className="w-full py-4 bg-forest text-white font-black text-[15px] rounded-2xl hover:bg-forest/90 transition-colors shadow-sm">
          Go to My Loans →
        </button>
      </div>
    )
  }

  /* CONFIRM */
  if (step === 'confirm' && borrower) {
    const rate     = effectiveRate(MY_BASE_RATE, borrower.trustScore)
    const interest = calcInterest(borrower.requestedAmount, rate, borrower.tenor)
    const meta     = scoreMeta(borrower.trustScore)
    return (
      <div className="space-y-6">
        <BackBtn onClick={() => { setBorrower(null); setStep('borrowers') }} />
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-forest to-[#1a4228] px-6 py-5 flex items-center gap-4">
            <Avatar initials={borrower.initials} size="lg" score={borrower.trustScore} />
            <div className="flex-1">
              <h3 className="font-bold text-white text-[20px]">{borrower.name}</h3>
              <p className="text-white/60 text-[13px] mt-0.5">Member since {borrower.memberSince} · {borrower.repaymentRate}% on-time</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[12px] font-black px-3 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                  Tier {meta.tier} · {meta.label}
                </span>
                <span className="text-white/70 text-[13px] font-bold">{borrower.trustScore}</span>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="bg-cream rounded-2xl px-5 py-4 flex items-start gap-3">
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
                <div key={d.label} className="bg-cream rounded-xl p-4 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wider">{d.label}</p>
                  <p className="font-playfair text-[22px] font-black text-forest mt-1">{d.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2.5">Your Return</p>
              <SummaryTable rows={[
                { label: 'You lend',          value: `KES ${borrower.requestedAmount.toLocaleString()}` },
                { label: `Interest (${rate.toFixed(2)}%/wk)`, value: `+ KES ${interest.toFixed(0)}` },
                { label: 'You receive back',   value: `KES ${(borrower.requestedAmount+interest).toFixed(0)}`, accent: true },
              ]} />
            </div>
            {riskPremium(borrower.trustScore) > 0 && (
              <div className="flex items-center gap-3 bg-gold/8 border border-gold/20 rounded-2xl px-4 py-3">
                <span className="text-lg flex-shrink-0">⚡</span>
                <p className="text-[12px] text-gold font-medium">
                  +{riskPremium(borrower.trustScore).toFixed(2)}% risk premium for Tier {meta.tier} — higher risk, higher return
                </p>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setStep('done')}
          className="w-full py-4 bg-gold text-forest font-black text-[16px] rounded-2xl hover:bg-gold/90 transition-all active:scale-[0.99] shadow-sm">
          Approve — Lend KES {borrower.requestedAmount.toLocaleString()} →
        </button>
        <p className="text-[11px] text-muted text-center">SACCO savings held as collateral. Auto-debit at maturity date.</p>
      </div>
    )
  }

  /* BORROWER LIST */
  if (step === 'borrowers') {
    return (
      <div className="space-y-5">
        <BackBtn onClick={() => setStep('form')} />
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-playfair text-[28px] font-black text-forest">Borrower Requests</h2>
            <p className="text-[13px] text-muted mt-1">
              {eligible.length} requests within your <span className="font-bold text-forest">KES {num.toLocaleString()}</span> budget
            </p>
          </div>
        </div>

        {eligible.length === 0 && (
          <div className="bg-cream rounded-3xl p-12 text-center space-y-3">
            <p className="text-4xl">🔍</p>
            <p className="font-playfair font-black text-forest text-[20px]">No matching requests</p>
            <p className="text-[13px] text-muted">Increase your lending amount to see more borrowers.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eligible.sort((a,b) => b.trustScore - a.trustScore).map(b => {
            const rate     = effectiveRate(MY_BASE_RATE, b.trustScore)
            const interest = calcInterest(b.requestedAmount, rate, b.tenor)
            const meta     = scoreMeta(b.trustScore)
            return (
              <button key={b.id} onClick={() => { setBorrower(b); setStep('confirm') }}
                className="text-left bg-white rounded-2xl border-2 border-forest/8 shadow-sm hover:border-forest/30 hover:shadow-md transition-all p-5 group active:scale-[0.99]">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar initials={b.initials} size="md" score={b.trustScore} />
                  <div className="flex-1">
                    <p className="font-bold text-forest text-[16px]">{b.name}</p>
                    <p className="text-[12px] text-muted">Since {b.memberSince} · {b.repaymentRate}% on-time</p>
                  </div>
                  <div className="text-right">
                    <p className="font-playfair text-[22px] font-black text-forest leading-none">{(b.requestedAmount/1000).toFixed(0)}k</p>
                    <p className="text-[10px] text-muted">KES</p>
                  </div>
                </div>
                <ScoreStrip score={b.trustScore} />
                <p className="text-[12px] text-muted mt-3 bg-cream rounded-xl px-3 py-2">📋 {b.purpose}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[12px] text-muted">{b.tenor} days</span>
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

  /* FORM */
  return (
    <div className="space-y-8">
      <BackBtn onClick={onBack} />
      <div>
        <h2 className="font-playfair text-[32px] font-black text-forest leading-tight">Lend Money</h2>
        <p className="text-[14px] text-muted mt-1">Earn interest on idle savings by funding SACCO members</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '💰', step: '1', label: 'Set amount',    desc: 'How much you can lend' },
          { icon: '👤', step: '2', label: 'Pick borrower', desc: 'Review their full profile' },
          { icon: '✦',  step: '3', label: 'Earn interest', desc: 'Paid back at maturity' },
        ].map(s => (
          <div key={s.step} className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-forest/8 flex items-center justify-center text-xl mx-auto mb-3">{s.icon}</div>
            <p className="font-bold text-forest text-[13px]">{s.label}</p>
            <p className="text-[11px] text-muted mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <label className="text-[12px] font-bold text-muted uppercase tracking-widest block">Amount you want to lend</label>
        <AmountField value={amount} onChange={setAmount} min={1000} placeholder="e.g. 20000" />
        <Chips items={[5000,10000,25000,50000]} active={num} onSelect={v => setAmount(String(v))} />
      </div>

      {num >= 1000 && (
        <div className="bg-gold/6 border border-gold/20 rounded-2xl p-5 space-y-4">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Potential earnings on KES {num.toLocaleString()}</p>
          <div className="grid grid-cols-4 gap-3">
            {[5, 7, 10, 14].map(d => (
              <div key={d} className="bg-white rounded-xl p-3.5 text-center border border-gold/10">
                <p className="text-[10px] text-muted">{d} days</p>
                <p className="font-playfair font-black text-[22px] text-gold mt-1">+{calcInterest(num, MY_BASE_RATE, d).toFixed(0)}</p>
                <p className="text-[10px] text-muted">KES</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted">Base rate {MY_BASE_RATE}%/wk. Riskier borrowers (lower TrustScore) earn you more.</p>
        </div>
      )}

      <button onClick={() => setStep('borrowers')} disabled={num < 1000}
        className="w-full py-5 bg-forest text-white font-black text-[16px] rounded-2xl hover:bg-forest/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] shadow-md">
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

  function LoanCard({ loan }: { loan: SavedLoan }) {
    const sm = statusMeta(loan.status)
    const isBorrower = loan.role === 'borrower'
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: isBorrower ? 'rgba(245,158,11,0.10)' : 'rgba(34,197,94,0.10)' }}>
              {isBorrower ? '💸' : '💰'}
            </div>
            <div>
              <p className="font-bold text-forest text-[16px]">{loan.counterparty}</p>
              <p className="text-[12px] text-muted capitalize">{loan.role} · {loan.tenor} days · {loan.createdAt}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-playfair text-[22px] font-black text-forest leading-none">KES {loan.amount.toLocaleString()}</p>
            <StatusBadge status={loan.status} />
          </div>
        </div>

        {/* Borrower detail block */}
        {isBorrower && loan.status === 'active' && (
          <div className="mx-5 mb-5 rounded-2xl overflow-hidden border border-gold/20">
            <div className="bg-gold/8 px-5 py-3 flex items-center gap-2">
              <span className="text-base">⏰</span>
              <p className="text-[11px] font-bold text-gold uppercase tracking-wider">What you need to repay</p>
            </div>
            <div className="divide-y divide-forest/6 bg-cream/40">
              <DetailRow label="Total repayable"   value={`KES ${loan.totalRepayable.toLocaleString()}`} accent />
              <DetailRow label="Due date"           value={loan.dueDate} />
              <DetailRow label="Send to"            value={loan.counterparty} />
              {loan.counterpartyPhone && <DetailRow label="M-Pesa number" value={loan.counterpartyPhone} mono />}
            </div>
            <div className="px-5 pb-4 pt-3 bg-cream/40">
              <p className="text-[11px] text-muted">Auto-debit will run from your SACCO savings on the due date.</p>
            </div>
          </div>
        )}

        {/* Lender detail block */}
        {!isBorrower && (
          <div className="mx-5 mb-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Lent',         value: `KES ${loan.amount.toLocaleString()}` },
              { label: 'Interest',     value: `KES ${loan.interestAmount}`, gold: true },
              { label: 'Due back',     value: loan.dueDate },
            ].map(d => (
              <div key={d.label} className="bg-cream rounded-xl p-3.5 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wider">{d.label}</p>
                <p className={`text-[14px] font-bold mt-1 ${(d as any).gold ? 'text-gold' : 'text-forest'}`}>{d.value}</p>
              </div>
            ))}
          </div>
        )}

        {loan.status === 'overdue' && (
          <div className="mx-5 mb-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[12px] text-red-600 font-medium">
            ⚠️ Overdue — recovery from borrower savings in progress. Score bonus frozen pending resolution.
          </div>
        )}

        {isBorrower && loan.status === 'active' && (
          <div className="border-t border-forest/6 px-5 py-4">
            <button className="w-full py-3 bg-forest text-white text-[13px] font-bold rounded-xl hover:bg-forest/90 transition-colors">
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
          <h2 className="font-playfair text-[32px] font-black text-forest leading-tight">My Loans</h2>
          <p className="text-[14px] text-muted">Your borrowing and lending activity</p>
        </div>
        <button onClick={onReset}
          className="mt-8 text-[11px] font-semibold text-muted hover:text-terra transition-colors border border-muted/20 hover:border-terra/30 px-3 py-1.5 rounded-lg">
          ↺ Reset demo
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Total Lent"   value={`KES ${(totalLent/1000).toFixed(0)}k`}  sub={`${lenderLoans.length} loans`}           color="#2d6349" />
        <StatTile label="Interest Due" value={`KES ${totalInterest}`}                   sub="Across all lender loans"                  color="#b45309" />
        <StatTile label="You Owe"      value={totalOwed ? `KES ${(totalOwed/1000).toFixed(1)}k` : '—'} sub="Active borrower loans"   color="#b91c1c" />
      </div>

      {borrowerLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-forest text-[16px] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gold/12 flex items-center justify-center text-base">💸</span>
            Loans I've Taken ({borrowerLoans.length})
          </h3>
          {borrowerLoans.map(l => <LoanCard key={l.id} loan={l} />)}
        </div>
      )}

      {lenderLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-forest text-[16px] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#2d6349]/10 flex items-center justify-center text-base">💰</span>
            Loans I've Given ({lenderLoans.length})
          </h3>
          {lenderLoans.map(l => <LoanCard key={l.id} loan={l} />)}
        </div>
      )}

      {loans.length === 0 && (
        <div className="bg-cream rounded-3xl p-16 text-center space-y-3">
          <p className="text-5xl">📭</p>
          <p className="font-playfair font-black text-forest text-[22px]">No loan activity yet</p>
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
  const meta  = scoreMeta(MY_TRUST_SCORE)
  const pct   = ((MY_TRUST_SCORE - 300) / 550) * 100
  const active  = loans.filter(l => l.status === 'active').length
  const overdue = loans.filter(l => l.status === 'overdue').length
  const totalInterestEarned = loans.filter(l => l.role === 'lender' && l.status === 'repaid').reduce((s,l) => s + l.interestAmount, 0)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-forest via-[#20482e] to-[#143020] rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute right-8 -bottom-8 w-32 h-32 rounded-full border border-white/8 pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-r from-transparent to-white/2 pointer-events-none" />

        <div className="flex items-start justify-between gap-8 relative">
          <div>
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">Your TrustScore</p>
            <p className="font-playfair text-[64px] font-black text-white leading-none">{MY_TRUST_SCORE}</p>
            <div className="flex items-center gap-2.5 mt-3">
              <span className="text-[13px] font-black px-3 py-1.5 rounded-full" style={{ background: meta.bg, color: meta.light }}>
                Tier {meta.tier} · {meta.label}
              </span>
            </div>
            <div className="mt-4 w-64">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: meta.light }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
                <span>300</span><span>550</span><span>850</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-3 text-right">
            {[
              { label: 'Savings balance', value: `KES ${(MY_SAVINGS/1000).toFixed(0)}k` },
              { label: 'On-time rate',    value: '100%' },
              { label: 'Interest earned', value: totalInterestEarned > 0 ? `KES ${totalInterestEarned}` : '—' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{s.label}</p>
                <p className="text-white font-bold text-[16px] mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {['✓ Savings anchor', '✓ No active P2P debt', '✓ KYC verified', '✓ Best rates apply'].map(t => (
            <span key={t} className="text-[11px] font-semibold bg-white/8 text-white/70 px-3 py-1.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Main actions */}
      <div className="grid grid-cols-2 gap-5">
        <button onClick={onBorrow}
          className="bg-white border-2 border-forest/10 rounded-3xl p-7 text-left hover:border-forest/25 hover:shadow-xl transition-all active:scale-[0.98] group shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl mb-5">💸</div>
          <p className="font-playfair font-black text-forest text-[24px] leading-none">Borrow</p>
          <p className="text-[13px] text-muted mt-2 leading-relaxed">Get emergency funds from a fellow member instantly</p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[12px] text-muted">5 – 20 days</span>
            <span className="text-[14px] font-bold text-muted group-hover:text-forest transition-colors">→</span>
          </div>
        </button>
        <button onClick={onLend}
          className="bg-forest rounded-3xl p-7 text-left hover:bg-forest/92 transition-all active:scale-[0.98] group shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-5">💰</div>
          <p className="font-playfair font-black text-white text-[24px] leading-none">Lend</p>
          <p className="text-[13px] text-white/60 mt-2 leading-relaxed">Earn interest on your idle savings</p>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gold">0.6 – 0.8% / week</span>
            <span className="text-[14px] font-bold text-white/50 group-hover:text-white transition-colors">→</span>
          </div>
        </button>
      </div>

      {/* My loans shortcut */}
      <button onClick={onLoans}
        className="w-full bg-white border border-black/5 shadow-sm rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all group">
        <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">📋</div>
        <div className="flex-1 text-left">
          <p className="font-bold text-forest text-[16px]">My Loans</p>
          <p className="text-[13px] text-muted mt-0.5">
            {active} active
            {overdue > 0 && <span className="text-red-600 font-bold"> · {overdue} overdue</span>}
            {active === 0 && overdue === 0 && <span> · no active loans</span>}
          </p>
        </div>
        <span className="text-[24px] text-muted group-hover:text-forest transition-colors">›</span>
      </button>

      {/* Info footer */}
      <div className="bg-cream rounded-2xl p-5 space-y-2.5">
        <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">How P2P Lending Works</p>
        {[
          ['Savings-secured', 'Loans are capped at 60% of your SACCO savings. Auto-debit runs on due date.'],
          ['Risk-based pricing', 'Lower TrustScore = higher interest rate. Improve yours by saving and repaying on time.'],
          ['No stacking', 'One active P2P loan permitted at a time. New requests are blocked until current loan closes.'],
        ].map(([title, desc]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center text-forest text-[11px] font-black flex-shrink-0 mt-0.5">✦</span>
            <p className="text-[12px] text-muted"><span className="font-bold text-forest">{title} — </span>{desc}</p>
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
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="w-full space-y-1">
        {/* Page title — only on home */}
        {view === 'home' && (
          <div className="mb-7">
            <h1 className="font-playfair text-[36px] font-black text-forest leading-tight">P2P Lending</h1>
            <p className="text-[14px] text-muted mt-1">Member-to-member short-term loans · 5 to 20 days</p>
          </div>
        )}

        {view === 'home'   && <HomeView    loans={loans} onBorrow={() => setView('borrow')} onLend={() => setView('lend')} onLoans={() => setView('loans')} />}
        {view === 'borrow' && <BorrowFlow  onBack={() => setView('home')} onDone={handleDone} />}
        {view === 'lend'   && <LendFlow    onBack={() => setView('home')} onDone={handleDone} />}
        {view === 'loans'  && <MyLoansView loans={loans} onBack={() => setView('home')} onReset={resetLoans} />}
      </div>
    </DashboardShell>
  )
}