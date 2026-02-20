'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
type LoanStatus = 'Active' | 'Completed' | 'Overdue' | 'Pending'

type Loan = {
  id: string
  type: string
  icon: string
  principal: number
  outstanding: number
  interest: number
  interestRate: number
  term: string
  disbursed: string
  nextPayment: string
  nextAmount: number
  payments: number
  totalPayments: number
  status: LoanStatus
  purpose: string
}

type LoanProduct = {
  id: string
  name: string
  icon: string
  minAmount: number
  maxAmount: number
  interestRate: number
  maxTerm: string
  purpose: string
  tier: 'A' | 'B' | 'C' | 'all'
  highlight?: boolean
}

type RepaymentScheduleRow = {
  no: number
  date: string
  principal: number
  interest: number
  total: number
  balance: number
  status: 'Paid' | 'Upcoming' | 'Next'
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const ACTIVE_LOANS: Loan[] = [
  {
    id: 'LN-2025-0041',
    type: 'Business Development Loan',
    icon: '💼',
    principal: 27550,
    outstanding: 27550,
    interest: 2893,
    interestRate: 10.5,
    term: '24 months',
    disbursed: 'Sep 10, 2025',
    nextPayment: 'Oct 15, 2025',
    nextAmount: 1354,
    payments: 0,
    totalPayments: 24,
    status: 'Active',
    purpose: 'Stock purchase & business expansion',
  },
]

const LOAN_HISTORY: Loan[] = [
  {
    id: 'LN-2024-0018',
    type: 'Emergency Loan',
    icon: '🏥',
    principal: 15000,
    outstanding: 0,
    interest: 900,
    interestRate: 6.0,
    term: '6 months',
    disbursed: 'Jan 5, 2024',
    nextPayment: '—',
    nextAmount: 0,
    payments: 6,
    totalPayments: 6,
    status: 'Completed',
    purpose: 'Medical expenses',
  },
  {
    id: 'LN-2023-0072',
    type: 'School Fees Loan',
    icon: '🎓',
    principal: 30000,
    outstanding: 0,
    interest: 2700,
    interestRate: 9.0,
    term: '12 months',
    disbursed: 'Feb 20, 2023',
    nextPayment: '—',
    nextAmount: 0,
    payments: 12,
    totalPayments: 12,
    status: 'Completed',
    purpose: 'University tuition & fees',
  },
]

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'LP-001',
    name: 'Emergency Loan',
    icon: '🚨',
    minAmount: 5000,
    maxAmount: 50000,
    interestRate: 6.0,
    maxTerm: '6 months',
    purpose: 'Medical, urgent repairs, bereavement',
    tier: 'all',
  },
  {
    id: 'LP-002',
    name: 'School Fees Loan',
    icon: '🎓',
    minAmount: 10000,
    maxAmount: 100000,
    interestRate: 9.0,
    maxTerm: '12 months',
    purpose: 'Tuition, boarding, stationery',
    tier: 'all',
  },
  {
    id: 'LP-003',
    name: 'Business Development',
    icon: '💼',
    minAmount: 20000,
    maxAmount: 300000,
    interestRate: 10.5,
    maxTerm: '36 months',
    purpose: 'Stock, equipment, business capital',
    tier: 'B',
    highlight: true,
  },
  {
    id: 'LP-004',
    name: 'Asset Finance',
    icon: '🚗',
    minAmount: 50000,
    maxAmount: 500000,
    interestRate: 12.0,
    maxTerm: '60 months',
    purpose: 'Vehicle, machinery, land purchase',
    tier: 'A',
  },
  {
    id: 'LP-005',
    name: 'Development Loan',
    icon: '🏗️',
    minAmount: 100000,
    maxAmount: 1000000,
    interestRate: 8.5,
    maxTerm: '84 months',
    purpose: 'Construction, renovation, real estate',
    tier: 'A',
  },
  {
    id: 'LP-006',
    name: 'Normal/Salary Loan',
    icon: '💳',
    minAmount: 5000,
    maxAmount: 150000,
    interestRate: 10.0,
    maxTerm: '24 months',
    purpose: 'General personal use, top-ups',
    tier: 'all',
  },
]

const SCHEDULE: RepaymentScheduleRow[] = [
  { no: 1,  date: 'Oct 15, 2025', principal: 966,  interest: 241, total: 1354, balance: 26584, status: 'Next' },
  { no: 2,  date: 'Nov 15, 2025', principal: 975,  interest: 233, total: 1354, balance: 25609, status: 'Upcoming' },
  { no: 3,  date: 'Dec 15, 2025', principal: 983,  interest: 225, total: 1354, balance: 24626, status: 'Upcoming' },
  { no: 4,  date: 'Jan 15, 2026', principal: 992,  interest: 216, total: 1354, balance: 23634, status: 'Upcoming' },
  { no: 5,  date: 'Feb 15, 2026', principal: 1000, interest: 207, total: 1354, balance: 22634, status: 'Upcoming' },
  { no: 6,  date: 'Mar 15, 2026', principal: 1009, interest: 198, total: 1354, balance: 21625, status: 'Upcoming' },
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: LoanStatus }) {
  const map: Record<LoanStatus, { bg: string; text: string; dot?: string }> = {
    Active:    { bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]', dot: 'bg-[#2d8c4e]' },
    Completed: { bg: 'bg-forest/8',     text: 'text-forest' },
    Overdue:   { bg: 'bg-terra/10',     text: 'text-terra',     dot: 'bg-terra' },
    Pending:   { bg: 'bg-gold/12',      text: 'text-gold',      dot: 'bg-gold' },
  }
  const m = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      {m.dot && <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${status === 'Active' ? 'animate-pulse' : ''}`} />}
      {status}
    </span>
  )
}

function ProgressBar({ pct, color = 'bg-[#2d8c4e]' }: { pct: number; color?: string }) {
  return (
    <div className="h-2 rounded-full bg-cream-dark overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.max(pct, 2)}%` }}
      />
    </div>
  )
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    A:   { bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]' },
    B:   { bg: 'bg-gold/12',      text: 'text-gold' },
    C:   { bg: 'bg-terra/10',     text: 'text-terra' },
    all: { bg: 'bg-forest/8',     text: 'text-forest' },
  }
  const m = map[tier] ?? map.all
  const label = tier === 'all' ? 'All Tiers' : `Tier ${tier}+`
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>
      {label}
    </span>
  )
}

/** Loan application multi-step modal */
function ApplyModal({
  product,
  user,
  onClose,
}: {
  product: LoanProduct | null
  user: { savings: number; tier: string; name: string }
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [term, setTerm] = useState('12')
  const [purpose, setPurpose] = useState('')

  if (!product) return null

  const maxMultiplier = user.tier === 'A' ? 2 : user.tier === 'B' ? 1.5 : 1
  const eligibleMax = Math.min(user.savings * maxMultiplier, product.maxAmount)
  const amountNum = parseFloat(amount) || 0
  const termNum = parseInt(term)
  const monthlyRate = product.interestRate / 100 / 12
  const monthly = amountNum > 0 && termNum > 0
    ? (amountNum * monthlyRate * Math.pow(1 + monthlyRate, termNum)) /
      (Math.pow(1 + monthlyRate, termNum) - 1)
    : 0
  const totalRepay = monthly * termNum
  const totalInterest = totalRepay - amountNum

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-forest px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{product.icon}</span>
            <div>
              <h3 className="font-playfair text-[18px] font-black text-white">{product.name}</h3>
              <p className="text-white/50 text-[11px]">{product.interestRate}% p.a. · up to {product.maxTerm}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
          >✕</button>
        </div>

        {/* Step indicator */}
        <div className="flex">
          {['Amount', 'Details', 'Review'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
                step === i + 1
                  ? 'border-forest text-forest'
                  : step > i + 1
                  ? 'border-[#2d8c4e] text-[#2d8c4e]'
                  : 'border-transparent text-muted'
              }`}
            >
              {step > i + 1 ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Amount & Term */}
          {step === 1 && (
            <>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Loan Amount (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted text-[13px]">KES</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min={product.minAmount}
                    max={eligibleMax}
                    className="w-full pl-14 pr-4 py-3.5 rounded-xl border-2 border-forest/15 focus:border-forest outline-none font-mono font-bold text-forest text-[16px] bg-cream transition-colors"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-1.5">
                  <span>Min: KES {product.minAmount.toLocaleString()}</span>
                  <span>Your max: KES {eligibleMax.toLocaleString()}</span>
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[20000, 50000, 100000, 200000]
                    .filter(a => a <= eligibleMax && a >= product.minAmount)
                    .map(amt => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt.toString())}
                        className="px-3 py-1.5 text-[11px] font-bold text-forest bg-forest/8 rounded-lg hover:bg-forest/15 transition-colors"
                      >
                        {amt >= 1000 ? `${(amt / 1000).toFixed(0)}k` : amt}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Repayment Term
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['6', '12', '18', '24', '36'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                        term === t
                          ? 'border-forest bg-forest text-white'
                          : 'border-forest/15 text-forest hover:border-forest/30'
                      }`}
                    >
                      {t} months
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator preview */}
              {amountNum > 0 && (
                <div className="bg-cream rounded-xl p-4 border border-forest/8 space-y-2">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Loan Summary</p>
                  {[
                    { label: 'Monthly Repayment', value: `KES ${Math.round(monthly).toLocaleString()}`, accent: true },
                    { label: 'Total Repayment',   value: `KES ${Math.round(totalRepay).toLocaleString()}` },
                    { label: 'Total Interest',    value: `KES ${Math.round(totalInterest).toLocaleString()}` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-[12px] text-muted">{r.label}</span>
                      <span className={`text-[13px] font-bold ${r.accent ? 'text-forest' : 'text-muted'}`}>
                        {r.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: Purpose & details */}
          {step === 2 && (
            <>
              <div>
                <label className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Loan Purpose
                </label>
                <textarea
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder={`e.g. ${product.purpose}`}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-forest/15 focus:border-forest outline-none text-forest text-[13px] bg-cream transition-colors resize-none"
                />
              </div>
              <div className="bg-gold/8 border border-gold/20 rounded-xl p-4 flex gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-[12px] text-muted leading-relaxed">
                  Clear, specific loan purposes improve your approval speed. Attach supporting documents
                  (quotes, invoices) after submission via your member portal.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Required Documents</p>
                {['National ID / Passport', 'Latest 3 payslips or bank statements', 'Guarantor form (for amounts over KES 50,000)'].map(doc => (
                  <div key={doc} className="flex items-center gap-3 bg-cream/60 rounded-xl px-4 py-3 border border-forest/8">
                    <span className="text-sm">📄</span>
                    <span className="text-[12px] text-forest font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <>
              <div className="bg-cream rounded-xl p-4 border border-forest/8 space-y-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Application Summary</p>
                {[
                  { label: 'Loan Type',          value: product.name },
                  { label: 'Amount',             value: `KES ${amountNum.toLocaleString()}` },
                  { label: 'Term',               value: `${term} months` },
                  { label: 'Interest Rate',      value: `${product.interestRate}% p.a.` },
                  { label: 'Monthly Repayment',  value: `KES ${Math.round(monthly).toLocaleString()}` },
                  { label: 'Total Repayment',    value: `KES ${Math.round(totalRepay).toLocaleString()}` },
                  { label: 'Purpose',            value: purpose || '—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between gap-4">
                    <span className="text-[11px] text-muted">{r.label}</span>
                    <span className="text-[12px] font-bold text-forest text-right">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2.5 bg-[#2d8c4e]/6 border border-[#2d8c4e]/20 rounded-xl p-4">
                <span className="text-[16px] flex-shrink-0">✅</span>
                <p className="text-[11px] text-[#2d6349] leading-relaxed">
                  By submitting, you agree to the SACCO loan terms and authorise automatic monthly deductions from your savings account on the due date.
                </p>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-1">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3.5 border-2 border-forest/20 text-forest font-bold text-[13px] rounded-xl hover:border-forest/40 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : onClose()}
              disabled={step === 1 && amountNum < product.minAmount}
              className="flex-1 py-3.5 bg-forest text-white font-bold text-[13px] rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 3 ? '🚀 Submit Application' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Page                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function LoansPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'products' | 'history'>('overview')
  const [applyProduct, setApplyProduct] = useState<LoanProduct | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)

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

  /* Derived */
  const totalOutstanding = ACTIVE_LOANS.reduce((s, l) => s + l.outstanding, 0)
  const totalInterestDue = ACTIVE_LOANS.reduce((s, l) => s + l.interest, 0)
  const nextPaymentAmount = ACTIVE_LOANS[0]?.nextAmount ?? 0
  const nextPaymentDate   = ACTIVE_LOANS[0]?.nextPayment ?? '—'
  const maxEligible       = Math.round(user.savings * (user.tier === 'A' ? 2 : user.tier === 'B' ? 1.5 : 1))
  const totalBorrowed     = [...ACTIVE_LOANS, ...LOAN_HISTORY].reduce((s, l) => s + l.principal, 0)

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'active',    label: `Active (${ACTIVE_LOANS.length})` },
    { id: 'products',  label: 'Loan Products' },
    { id: 'history',   label: 'History' },
  ] as const

  return (
    <DashboardShell>
      {applyProduct && (
        <ApplyModal
          product={applyProduct}
          user={{ savings: user.savings, tier: user.tier, name: user.name }}
          onClose={() => setApplyProduct(null)}
        />
      )}

      <div className="w-full space-y-5">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden relative bg-[#1a3c2b]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 75% 30%, rgba(200,153,42,0.15) 0%, transparent 55%), radial-gradient(circle at 10% 80%, rgba(45,140,78,0.12) 0%, transparent 50%)',
            }}
          />
          {/* Geometric accent */}
          <div className="absolute top-0 right-0 w-72 h-72 border border-white/5 rounded-full translate-x-24 -translate-y-20 pointer-events-none" />
          <div className="absolute bottom-0 left-48 w-40 h-40 border border-gold/10 rounded-full translate-y-12 pointer-events-none" />

          <div className="relative px-6 py-7 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SACCO Loans</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-[#2d8c4e] uppercase tracking-widest">
                    Tier {user.tier} Member
                  </span>
                </div>
                <h1 className="font-playfair text-[34px] sm:text-[40px] font-black text-white leading-none">
                  KES {totalOutstanding.toLocaleString()}
                </h1>
                <p className="text-white/40 text-[12px] mt-1">Total outstanding balance</p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {ACTIVE_LOANS.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-terra bg-terra/20 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-terra animate-pulse" />
                      {ACTIVE_LOANS.length} active loan{ACTIVE_LOANS.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2d8c4e] bg-[#2d8c4e]/20 px-3 py-1 rounded-full">
                      ✓ Debt-free
                    </span>
                  )}
                  <span className="text-white/30 text-[12px]">
                    KES {nextPaymentAmount.toLocaleString()} due {nextPaymentDate}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-4">
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-2 bg-gold text-forest font-bold text-[13px] px-5 py-3 rounded-xl hover:bg-gold/90 transition-all hover:scale-105 shadow-lg shadow-gold/20"
                >
                  Apply for a Loan →
                </button>

                <div className="flex gap-5">
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">Eligibility</p>
                    <p className="text-white font-bold text-[14px]">KES {maxEligible.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">TrustScore</p>
                    <p className="text-white font-bold text-[14px]">{user.trustScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-medium">Loans Taken</p>
                    <p className="text-white font-bold text-[14px]">{ACTIVE_LOANS.length + LOAN_HISTORY.length}</p>
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

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Outstanding',    value: `KES ${totalOutstanding.toLocaleString()}`,    icon: '📋', accent: 'text-terra' },
                { label: 'Interest Due',   value: `KES ${totalInterestDue.toLocaleString()}`,    icon: '📊', accent: 'text-gold' },
                { label: 'Next Payment',   value: `KES ${nextPaymentAmount.toLocaleString()}`,   icon: '📅', accent: 'text-forest' },
                { label: 'Total Borrowed', value: `KES ${totalBorrowed.toLocaleString()}`,       icon: '🏦', accent: 'text-muted' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[17px] sm:text-[19px] font-black mt-2 leading-tight ${s.accent}`}>{s.value}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Active loan snapshot */}
            {ACTIVE_LOANS.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-forest/6 flex items-center justify-between">
                  <h4 className="font-bold text-forest text-[14px]">Active Loan</h4>
                  <button
                    onClick={() => setActiveTab('active')}
                    className="text-[11px] font-semibold text-gold hover:underline"
                  >
                    Full details →
                  </button>
                </div>
                {ACTIVE_LOANS.map(loan => (
                  <div key={loan.id} className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-3xl">{loan.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h5 className="font-bold text-forest text-[14px]">{loan.type}</h5>
                          <StatusBadge status={loan.status} />
                        </div>
                        <p className="text-[11px] text-muted">{loan.id} · Disbursed {loan.disbursed}</p>
                      </div>
                      <button
                        onClick={() => setScheduleOpen(true)}
                        className="flex-shrink-0 text-[11px] font-semibold bg-forest text-white px-4 py-2 rounded-xl hover:bg-forest/90 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: 'Principal',     value: `KES ${loan.principal.toLocaleString()}` },
                        { label: 'Outstanding',   value: `KES ${loan.outstanding.toLocaleString()}` },
                        { label: 'Total Interest',value: `KES ${loan.interest.toLocaleString()}` },
                        { label: 'Due Date',      value: loan.nextPayment },
                      ].map(d => (
                        <div key={d.label}>
                          <p className="text-[10px] text-muted font-medium mb-0.5">{d.label}</p>
                          <p className="text-[13px] font-bold text-forest">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-[10px] text-muted mb-1.5">
                      <span>Repayment progress</span>
                      <span>{loan.payments} / {loan.totalPayments} payments</span>
                    </div>
                    <ProgressBar pct={(loan.payments / loan.totalPayments) * 100} />
                  </div>
                ))}
              </div>
            )}

            {/* Eligibility card */}
            <div className="bg-forest rounded-2xl p-5 text-white">
              <h4 className="font-bold text-white text-[14px] mb-4 flex items-center gap-2">
                <span className="text-gold">✦</span> Your Loan Eligibility
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Max Amount',     value: `KES ${maxEligible.toLocaleString()}` },
                  { label: 'Interest Rate',  value: `${user.tier === 'A' ? '8.5' : user.tier === 'B' ? '10.5' : '13.0'}% p.a.` },
                  { label: 'Multiplier',     value: `${user.tier === 'A' ? '2×' : user.tier === 'B' ? '1.5×' : '1×'} savings` },
                  { label: 'Your Tier',      value: `Tier ${user.tier}` },
                ].map(d => (
                  <div key={d.label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-white/40 text-[10px] mb-1">{d.label}</p>
                    <p className="font-playfair text-[16px] font-black text-white">{d.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-[11px] mt-4">
                Upgrade to Tier A by maintaining a 12-month deposit streak and a TrustScore ≥ 750.
              </p>
            </div>

            {/* Quick CTA row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: '🧮', label: 'Loan Calculator',    sub: 'Estimate repayments',    action: () => setActiveTab('products') },
                { icon: '📋', label: 'View All Products',  sub: 'Explore loan types',      action: () => setActiveTab('products') },
                { icon: '📜', label: 'Loan History',       sub: 'Past & completed loans',  action: () => setActiveTab('history') },
              ].map(c => (
                <button
                  key={c.label}
                  onClick={c.action}
                  className="bg-white rounded-xl p-4 border border-black/5 shadow-sm flex items-center gap-3 hover:border-forest/20 hover:shadow-md transition-all group text-left"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                  <div>
                    <p className="text-[13px] font-bold text-forest">{c.label}</p>
                    <p className="text-[11px] text-muted">{c.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════ ACTIVE LOANS ═══════════════════════════════════════════════ */}
        {activeTab === 'active' && (
          <div className="space-y-5">
            {ACTIVE_LOANS.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-black/5 shadow-sm text-center">
                <span className="text-5xl">🎉</span>
                <p className="font-bold text-forest text-[16px] mt-4">No outstanding loans</p>
                <p className="text-[12px] text-muted mt-1 mb-5">You're debt-free! Apply for a loan whenever you need capital.</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-forest text-white font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-forest/90 transition-colors"
                >
                  Browse Loan Products →
                </button>
              </div>
            ) : (
              ACTIVE_LOANS.map(loan => (
                <div key={loan.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="px-5 py-4 bg-cream/40 border-b border-forest/6 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{loan.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-forest text-[14px]">{loan.type}</h4>
                          <StatusBadge status={loan.status} />
                        </div>
                        <p className="text-[11px] text-muted">Ref: {loan.id} · {loan.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScheduleOpen(!scheduleOpen)}
                        className="text-[11px] font-semibold bg-cream border border-forest/15 text-forest px-3 py-2 rounded-xl hover:border-forest/30 transition-colors"
                      >
                        {scheduleOpen ? 'Hide Schedule' : 'View Schedule'}
                      </button>
                      <button className="text-[11px] font-semibold bg-forest text-white px-4 py-2 rounded-xl hover:bg-forest/90 transition-colors">
                        Make Payment
                      </button>
                    </div>
                  </div>

                  {/* Loan metrics */}
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Principal',         value: `KES ${loan.principal.toLocaleString()}` },
                      { label: 'Outstanding',       value: `KES ${loan.outstanding.toLocaleString()}` },
                      { label: 'Total Interest',    value: `KES ${loan.interest.toLocaleString()}` },
                      { label: 'Interest Rate',     value: `${loan.interestRate}% p.a.` },
                      { label: 'Term',              value: loan.term },
                      { label: 'Disbursed',         value: loan.disbursed },
                      { label: 'Next Payment',      value: loan.nextPayment },
                      { label: 'Next Amount',       value: `KES ${loan.nextAmount.toLocaleString()}` },
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
                      <span>{loan.payments} / {loan.totalPayments} payments · {loan.totalPayments - loan.payments} remaining</span>
                    </div>
                    <ProgressBar pct={(loan.payments / loan.totalPayments) * 100} />
                  </div>

                  {/* Upcoming schedule */}
                  {scheduleOpen && (
                    <div className="border-t border-forest/6">
                      <div className="px-5 py-3 bg-cream/40 flex items-center justify-between">
                        <h5 className="text-[12px] font-bold text-forest">Repayment Schedule — Next 6 Months</h5>
                        <button className="text-[11px] font-semibold text-gold border border-gold/30 px-3 py-1 rounded-lg hover:bg-gold/5 transition-colors">
                          Export
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="bg-cream/70">
                              {['#', 'Due Date', 'Principal', 'Interest', 'Total', 'Balance', 'Status'].map(h => (
                                <th key={h} className={`px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap ${['Principal','Interest','Total','Balance'].includes(h) ? 'text-right' : 'text-left'}`}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-forest/4">
                            {SCHEDULE.map(row => (
                              <tr
                                key={row.no}
                                className={`transition-colors ${row.status === 'Next' ? 'bg-gold/5' : 'hover:bg-cream/40'}`}
                              >
                                <td className="px-4 py-3 font-mono text-muted text-[11px]">{row.no}</td>
                                <td className="px-4 py-3 font-medium text-forest whitespace-nowrap">{row.date}</td>
                                <td className="px-4 py-3 text-right text-muted">{row.principal.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-muted">{row.interest.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-bold text-forest">{row.total.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-muted">{row.balance.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    row.status === 'Next'
                                      ? 'bg-gold/15 text-gold'
                                      : row.status === 'Paid'
                                      ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]'
                                      : 'bg-forest/6 text-muted'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ════ LOAN PRODUCTS ══════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-5">

            {/* Eligibility reminder */}
            <div className="bg-[#2d8c4e]/6 border border-[#2d8c4e]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏅</span>
                <div>
                  <p className="font-bold text-forest text-[13px]">Tier {user.tier} Member — You're eligible for up to KES {maxEligible.toLocaleString()}</p>
                  <p className="text-[11px] text-muted">Based on your savings balance of KES {user.savings.toLocaleString()} × {user.tier === 'A' ? '2' : user.tier === 'B' ? '1.5' : '1'} multiplier</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#2d8c4e] bg-[#2d8c4e]/10 px-3 py-1.5 rounded-full flex-shrink-0">
                TrustScore: {user.trustScore}
              </span>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LOAN_PRODUCTS.map(product => {
                const maxElig = Math.min(user.savings * (user.tier === 'A' ? 2 : user.tier === 'B' ? 1.5 : 1), product.maxAmount)
                const eligible =
                  product.tier === 'all' ||
                  (product.tier === 'A' && user.tier === 'A') ||
                  (product.tier === 'B' && (user.tier === 'A' || user.tier === 'B'))

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md group ${
                      product.highlight
                        ? 'border-gold/40 ring-1 ring-gold/20'
                        : 'border-black/5'
                    } ${!eligible ? 'opacity-60' : ''}`}
                  >
                    {product.highlight && (
                      <div className="bg-gold/10 border-b border-gold/20 px-4 py-1.5 flex items-center gap-1.5">
                        <span className="text-[10px]">⭐</span>
                        <span className="text-[10px] font-bold text-gold">Recommended for your profile</span>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${product.highlight ? 'bg-gold/10' : 'bg-cream'}`}>
                            {product.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-forest text-[14px]">{product.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <TierBadge tier={product.tier} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-playfair text-[20px] font-black text-[#2d8c4e] leading-none">{product.interestRate}%</p>
                          <p className="text-[9px] text-muted font-medium">per annum</p>
                        </div>
                      </div>

                      <p className="text-[12px] text-muted mb-4 leading-relaxed">{product.purpose}</p>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Min',     value: `KES ${(product.minAmount / 1000).toFixed(0)}k` },
                          { label: 'Max',     value: `KES ${product.maxAmount >= 1000000 ? `${product.maxAmount / 1000000}M` : `${product.maxAmount / 1000}k`}` },
                          { label: 'Term',    value: product.maxTerm },
                        ].map(d => (
                          <div key={d.label} className="bg-cream/60 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] text-muted font-medium">{d.label}</p>
                            <p className="text-[12px] font-bold text-forest">{d.value}</p>
                          </div>
                        ))}
                      </div>

                      {eligible ? (
                        <button
                          onClick={() => setApplyProduct(product)}
                          className={`w-full py-2.5 text-[12px] font-bold rounded-xl transition-all ${
                            product.highlight
                              ? 'bg-gold text-forest hover:bg-gold/90'
                              : 'bg-forest text-white hover:bg-forest/90'
                          }`}
                        >
                          Apply — Up to KES {maxElig.toLocaleString()}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 text-[12px] font-semibold rounded-xl bg-cream text-muted text-center border border-dashed border-muted/30">
                          Requires Tier {product.tier} — Upgrade to unlock
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FAQ / info strip */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 space-y-4">
              <h4 className="font-bold text-forest text-[14px]">How Loan Eligibility Works</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: '💰', title: 'Savings Multiplier',    desc: 'Your max loan is a multiple of your SACCO balance — 1× (Tier C), 1.5× (Tier B), or 2× (Tier A).' },
                  { icon: '🏅', title: 'Tier Progression',      desc: 'Maintain consistent deposits and a high TrustScore to move up tiers and unlock better rates.' },
                  { icon: '⚡', title: 'Quick Disbursement',    desc: 'Approved loans for Tier A & B members are disbursed within 48 hours directly to your M-Pesa or bank.' },
                ].map(f => (
                  <div key={f.title} className="flex gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <p className="text-[12px] font-bold text-forest mb-1">{f.title}</p>
                      <p className="text-[11px] text-muted leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ HISTORY ════════════════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-5">

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Borrowed',   value: `KES ${totalBorrowed.toLocaleString()}`,   icon: '📥', accent: 'text-forest' },
                { label: 'Loans Completed',  value: `${LOAN_HISTORY.length}`,                  icon: '✅', accent: 'text-[#2d8c4e]' },
                { label: 'Interest Paid',    value: `KES ${LOAN_HISTORY.reduce((s, l) => s + l.interest, 0).toLocaleString()}`, icon: '📤', accent: 'text-gold' },
                { label: 'On-Time Rate',     value: '100%',                                    icon: '⭐', accent: 'text-[#2d8c4e]' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[18px] font-black mt-2 ${s.accent}`}>{s.value}</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Good standing banner */}
            <div className="bg-[#2d8c4e]/6 border border-[#2d8c4e]/20 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🏆</span>
              <div>
                <p className="font-bold text-forest text-[14px] mb-1">Excellent Repayment Record</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  All {LOAN_HISTORY.length + ACTIVE_LOANS.length} of your loans have been repaid or are on track with zero late payments.
                  This has earned you a <span className="font-bold text-[#2d8c4e]">Repayment Bonus</span> on your TrustScore.
                </p>
              </div>
            </div>

            {/* Loan history cards */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-forest/6 flex items-center justify-between">
                <h4 className="font-bold text-forest text-[14px]">Completed Loans</h4>
                <button className="text-[11px] font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/5 transition-colors">
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-cream/70">
                      {['Loan Ref', 'Type', 'Principal', 'Interest', 'Term', 'Disbursed', 'Closed', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/4">
                    {LOAN_HISTORY.map(loan => (
                      <tr key={loan.id} className="hover:bg-cream/50 transition-colors opacity-90">
                        <td className="px-5 py-3.5 font-mono text-[11px] text-muted">{loan.id}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span>{loan.icon}</span>
                            <span className="font-semibold text-forest">{loan.type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-forest">KES {loan.principal.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-muted">KES {loan.interest.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-muted">{loan.term}</td>
                        <td className="px-5 py-3.5 text-muted">{loan.disbursed}</td>
                        <td className="px-5 py-3.5 text-muted">{loan.nextPayment}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={loan.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current active in history context */}
            {ACTIVE_LOANS.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-forest/6">
                  <h4 className="font-bold text-forest text-[14px]">Active Loans</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-cream/70">
                        {['Loan Ref', 'Type', 'Principal', 'Outstanding', 'Next Due', 'Progress', 'Status'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest/4">
                      {ACTIVE_LOANS.map(loan => (
                        <tr key={loan.id} className="hover:bg-cream/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[11px] text-muted">{loan.id}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span>{loan.icon}</span>
                              <span className="font-semibold text-forest">{loan.type}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-forest">KES {loan.principal.toLocaleString()}</td>
                          <td className="px-5 py-3.5 font-bold text-terra">KES {loan.outstanding.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-muted">{loan.nextPayment}</td>
                          <td className="px-5 py-3.5 w-32">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-cream-dark overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#2d8c4e]"
                                  style={{ width: `${Math.max((loan.payments / loan.totalPayments) * 100, 2)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted flex-shrink-0">
                                {loan.payments}/{loan.totalPayments}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={loan.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardShell>
  )
}