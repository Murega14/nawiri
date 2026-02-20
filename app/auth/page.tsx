'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Data                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const DEMO_CREDENTIALS = [
  { name: 'Amina Waweru',   email: 'amina@example.com',  tier: 'B', score: 742 },
  { name: 'David Kipchoge', email: 'david@example.com',  tier: 'B', score: 694 },
  { name: 'Fatuma Abdi',    email: 'fatuma@example.com', tier: 'A', score: 801 },
]

interface Sacco {
  id: string; name: string; location: string; sector: string
  members: number; minSavings: number; joinFee: number
  interestRate: number; loanMultiplier: number; founded: number
  description: string; requirements: string[]; benefits: string[]
  approved: boolean; badge?: string
}

const SACCOS: Sacco[] = [
  {
    id: 'fahari', name: 'Fahari SACCO', location: 'Nairobi, Westlands', sector: 'Trade & Commerce',
    members: 4820, minSavings: 2000, joinFee: 1000, interestRate: 7.5, loanMultiplier: 3, founded: 2008,
    description: "Nairobi's premier trade-focused SACCO serving market vendors, retailers, and wholesalers. Known for fast loan turnaround and flexible repayment.",
    requirements: ['National ID or Passport', 'Recent utility bill', 'Employed or self-employed proof', 'Passport photo'],
    benefits: ['Loans up to 3× savings', 'Emergency loan within 48 hrs', 'Group savings pools', 'Annual dividends'],
    approved: true, badge: '⭐ Top Rated',
  },
  {
    id: 'ushirika', name: 'Ushirika SACCO', location: 'Mombasa, CBD', sector: 'Civil Service',
    members: 11200, minSavings: 3000, joinFee: 500, interestRate: 6.0, loanMultiplier: 4, founded: 1995,
    description: "One of Kenya's oldest SACCOs, serving government employees and civil servants along the coast. Excellent loan terms and long-term security.",
    requirements: ['Government employee ID', 'Letter from employer', 'National ID', 'Bank statement (3 months)'],
    benefits: ['Loans up to 4× savings', 'School fees advance', 'Housing loan product', 'Medical cover'],
    approved: true,
  },
  {
    id: 'pwani', name: 'Pwani SACCO', location: 'Mombasa, Nyali', sector: 'Agriculture',
    members: 2150, minSavings: 1000, joinFee: 300, interestRate: 8.0, loanMultiplier: 2, founded: 2014,
    description: 'Community-owned SACCO built for coastal farmers, fishermen, and small agri-businesses. Low entry barrier with a focus on seasonal income cycles.',
    requirements: ['National ID', 'Proof of residence', 'Passport photo'],
    benefits: ['Seasonal repayment plans', 'Crop insurance linkage', 'Low entry fee', 'Mobile-first service'],
    approved: true,
  },
  {
    id: 'maendeleo', name: 'Maendeleo SACCO', location: 'Kisumu, CBD', sector: 'Women & Youth',
    members: 6700, minSavings: 1500, joinFee: 500, interestRate: 7.0, loanMultiplier: 3, founded: 2010,
    description: 'Empowering women and youth entrepreneurs in Western Kenya with affordable credit, financial literacy, and mentorship networks.',
    requirements: ['National ID', 'Group membership letter (optional)', 'Passport photo'],
    benefits: ['Women-led governance', 'Business mentorship', 'Group guarantee loans', 'Annual retreats'],
    approved: true, badge: '🌿 Community Pick',
  },
  {
    id: 'nguvu', name: 'Nguvu SACCO', location: 'Nakuru, CBD', sector: 'Manufacturing',
    members: 3400, minSavings: 5000, joinFee: 2000, interestRate: 6.5, loanMultiplier: 5, founded: 2005,
    description: 'Built for factory workers and industrial employees in the Rift Valley. High loan multiples and strong welfare benefits.',
    requirements: ['Employment contract', 'National ID', 'Payslip (last 3 months)', 'Bank statement'],
    benefits: ['Loans up to 5× savings', 'Emergency welfare fund', 'Last expense cover', 'Investment account'],
    approved: false,
  },
  {
    id: 'umoja', name: 'Umoja SACCO', location: 'Eldoret, Town', sector: 'Transport',
    members: 1890, minSavings: 2500, joinFee: 800, interestRate: 7.8, loanMultiplier: 3, founded: 2017,
    description: 'Serving matatu operators, truck drivers, and logistics workers in the North Rift. Designed around irregular income patterns.',
    requirements: ['PSV or commercial license', 'National ID', 'Passport photo', 'Recent bank statement'],
    benefits: ['Flexible repayment dates', 'Vehicle financing product', 'Roadside emergency fund', 'Fuel advance'],
    approved: true,
  },
]

type RegStep = 'details' | 'account' | 'pending' | 'sacco-browse' | 'sacco-detail'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Atoms                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function TrustRingMini({ score }: { score: number }) {
  const r = 18, circ = 2 * Math.PI * r
  const offset = circ * (1 - (score - 300) / 550)
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e8b84b" strokeWidth="3.5"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold text-forest uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"

function StepDots({ step }: { step: RegStep }) {
  const steps: RegStep[] = ['details', 'account', 'pending', 'sacco-browse']
  const labels = ['Your Details', 'Account', 'Review', 'Join SACCO']
  const idx = ['sacco-detail'].includes(step) ? 3 : steps.indexOf(step)
  return (
    <div className="flex items-center gap-1 mb-8 flex-wrap">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`flex items-center justify-center rounded-full text-[11px] font-black transition-all duration-300 ${
            i < idx ? 'w-6 h-6 bg-forest text-white' :
            i === idx ? 'w-7 h-7 bg-forest text-white ring-4 ring-forest/20' :
            'w-6 h-6 bg-forest/10 text-muted'
          }`}>
            {i < idx ? '✓' : i + 1}
          </div>
          <span className={`text-[11px] font-semibold hidden sm:block ${i === idx ? 'text-forest' : 'text-muted'}`}>
            {labels[i]}
          </span>
          {i < steps.length - 1 && <div className={`w-5 h-px mx-1 ${i < idx ? 'bg-forest' : 'bg-forest/15'}`} />}
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SACCO Card                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function SaccoCard({ sacco, onView, applied }: { sacco: Sacco; onView: () => void; applied: boolean }) {
  return (
    <button onClick={onView}
      className="w-full text-left bg-white rounded-2xl border-2 border-forest/8 shadow-sm hover:border-forest/25 hover:shadow-lg transition-all p-5 group active:scale-[0.99]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-forest text-[16px]">{sacco.name}</h3>
            {sacco.badge && (
              <span className="text-[10px] font-bold bg-gold/12 text-gold px-2 py-0.5 rounded-full">{sacco.badge}</span>
            )}
            {applied && (
              <span className="text-[10px] font-bold bg-[rgba(34,197,94,0.12)] text-[#16a34a] px-2 py-0.5 rounded-full">✓ Applied</span>
            )}
          </div>
          <p className="text-[12px] text-muted">{sacco.location} · {sacco.sector}</p>
        </div>
        <span className="text-[22px] text-muted group-hover:text-forest transition-colors flex-shrink-0">›</span>
      </div>
      <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mb-4">{sacco.description}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Members',    value: sacco.members >= 1000 ? `${(sacco.members/1000).toFixed(1)}k` : `${sacco.members}` },
          { label: 'Interest',   value: `${sacco.interestRate}% p.a.` },
          { label: 'Loan limit', value: `${sacco.loanMultiplier}× savings` },
        ].map(d => (
          <div key={d.label} className="bg-cream rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-muted uppercase tracking-wider">{d.label}</p>
            <p className="text-[13px] font-bold text-forest mt-0.5">{d.value}</p>
          </div>
        ))}
      </div>
      {!sacco.approved && (
        <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          ⚠️ Applications paused — pending CBK review
        </div>
      )}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SACCO Detail                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function SaccoDetail({ sacco, onBack, onApply, applied }: {
  sacco: Sacco; onBack: () => void; onApply: () => void; applied: boolean
}) {
  return (
    <div className="space-y-6">
      <button onClick={onBack}
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-forest transition-colors group">
        <span className="w-7 h-7 rounded-xl bg-forest/8 flex items-center justify-center group-hover:bg-forest/15 transition-colors">←</span>
        Back to SACCOs
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-forest via-[#1e4830] to-[#143020] rounded-3xl p-7 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-24 h-24 rounded-full border border-white/6 pointer-events-none" />
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {sacco.badge && <span className="text-[11px] font-bold bg-gold/20 text-gold px-2.5 py-1 rounded-full">{sacco.badge}</span>}
              {applied && <span className="text-[11px] font-bold bg-white/15 text-white px-2.5 py-1 rounded-full">✓ Applied</span>}
            </div>
            <h2 className="font-playfair text-[34px] font-black text-white leading-tight">{sacco.name}</h2>
            <p className="text-white/55 text-[13px] mt-1">{sacco.location} · Est. {sacco.founded}</p>
          </div>
          <div className="text-right">
            <p className="font-playfair text-[42px] font-black text-gold leading-none">{(sacco.members/1000).toFixed(1)}k</p>
            <p className="text-white/45 text-[12px]">active members</p>
          </div>
        </div>
        <p className="text-white/65 text-[14px] leading-relaxed mt-5 max-w-lg">{sacco.description}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {[sacco.sector, `Founded ${sacco.founded}`, sacco.approved ? '✓ CBK Approved' : '⏳ Pending Review'].map(t => (
            <span key={t} className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${
              t.includes('CBK') ? 'bg-[rgba(34,197,94,0.15)] text-[#86efac]' :
              t.includes('Pending') ? 'bg-amber-500/20 text-amber-300' :
              'bg-white/10 text-white/65'
            }`}>{t}</span>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div>
        <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Terms of Operation</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '💰', label: 'Min. Monthly Savings', value: `KES ${sacco.minSavings.toLocaleString()}` },
            { icon: '🎟️', label: 'One-time Join Fee',    value: `KES ${sacco.joinFee.toLocaleString()}` },
            { icon: '📈', label: 'Savings Interest',     value: `${sacco.interestRate}% p.a.` },
            { icon: '🏦', label: 'Max Loan Available',   value: `${sacco.loanMultiplier}× savings` },
          ].map(d => (
            <div key={d.label} className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 text-center">
              <span className="text-2xl">{d.icon}</span>
              <p className="font-playfair text-[22px] font-black text-forest mt-2 leading-none">{d.value}</p>
              <p className="text-[10px] text-muted mt-2 leading-tight">{d.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements + Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Requirements to Join</p>
          <div className="space-y-3">
            {sacco.requirements.map(r => (
              <div key={r} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest/8 flex items-center justify-center text-forest text-[11px] font-black flex-shrink-0 mt-0.5">✓</span>
                <p className="text-[13px] text-forest leading-snug">{r}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Member Benefits</p>
          <div className="space-y-3">
            {sacco.benefits.map(b => (
              <div key={b} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center text-gold text-[11px] font-black flex-shrink-0 mt-0.5">✦</span>
                <p className="text-[13px] text-forest leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {sacco.approved ? (
        applied ? (
          <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 flex items-center gap-4">
            <span className="text-4xl flex-shrink-0">✅</span>
            <div>
              <p className="font-bold text-[#16a34a] text-[16px]">Application submitted!</p>
              <p className="text-[13px] text-muted mt-0.5">You'll receive a decision from {sacco.name} within 3–5 business days. Check your email.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={onApply}
              className="w-full py-5 bg-gold text-forest font-black text-[17px] rounded-2xl hover:bg-gold/90 transition-all active:scale-[0.99] shadow-sm">
              Apply to Join {sacco.name} →
            </button>
            <p className="text-[12px] text-muted text-center">Applying takes 2 minutes. A SACCO officer will contact you to finalise onboarding.</p>
          </div>
        )
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-amber-800 text-[15px]">Applications currently paused</p>
          <p className="text-[13px] text-amber-700 mt-1">This SACCO is under CBK regulatory review. Check back in a few weeks or browse another SACCO.</p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function AuthPage() {
  const router = useRouter()
  const { login, register, user } = useAuth()

  const [tab, setTab]           = useState<'login' | 'register'>('login')
  const [regStep, setRegStep]   = useState<RegStep>('details')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  /* Login */
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  /* Register step 1 */
  const [regName, setRegName]               = useState('')
  const [regPhone, setRegPhone]             = useState('')
  const [regDob, setRegDob]                 = useState('')
  const [regId, setRegId]                   = useState('')
  const [regCity, setRegCity]               = useState('')
  const [regOccupation, setRegOccupation]   = useState('')

  /* Register step 2 */
  const [regEmail, setRegEmail]     = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [agreed, setAgreed]         = useState(false)

  /* SACCO */
  const [selectedSacco, setSelectedSacco]   = useState<Sacco | null>(null)
  const [appliedSaccos, setAppliedSaccos]   = useState<Set<string>>(new Set())
  const [saccoFilter, setSaccoFilter]       = useState('all')

  useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const r = await login(loginEmail, loginPassword)
    setLoading(false)
    if (!r.ok) setError(r.error || 'Login failed')
    else { setSuccess(true); setTimeout(() => router.push('/dashboard'), 800) }
  }

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!regName || !regPhone || !regDob || !regId) { setError('Please fill all required fields.'); return }
    setRegStep('account')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (regPassword !== regConfirm) { setError('Passwords do not match.'); return }
    if (!agreed) { setError('Please accept the terms to continue.'); return }
    setLoading(true)
    const r = await register({ name: regName, email: regEmail, phone: regPhone, password: regPassword, sacco: '' })
    setLoading(false)
    if (!r.ok) setError(r.error || 'Registration failed')
    else setRegStep('pending')
  }

  const handleApply = (saccoId: string) => {
    setAppliedSaccos(prev => new Set([...prev, saccoId]))
  }

  const pwdStrength = (p: string) => p.length < 4 ? 0 : p.length < 7 ? 1 : p.length < 10 ? 2 : 3
  const sectors = ['all', ...Array.from(new Set(SACCOS.map(s => s.sector)))]
  const filteredSaccos = saccoFilter === 'all' ? SACCOS : SACCOS.filter(s => s.sector === saccoFilter)

  const isSaccoBrowse = tab === 'register' && (regStep === 'sacco-browse' || regStep === 'sacco-detail')

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[460px_1fr]">

      {/* ═══ LEFT PANEL ═══════════════════════════════════════════════════ */}
      <div className="relative bg-forest hidden lg:flex flex-col justify-between p-14 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/6 blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-white">Nawiri</span>
          </a>
        </div>

        {/* Headline */}
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold mb-5">✦ Built on Trust</p>
          <h2 className="font-playfair text-5xl font-black text-white leading-[1.08] mb-6">
            Every deposit<br />builds your<br />
            <em className="not-italic text-gold">future.</em>
          </h2>
          <p className="text-white/45 text-[15px] leading-relaxed max-w-sm">
            Join a SACCO, save consistently, and unlock peer-to-peer loans — all powered by a credit score you actually understand.
          </p>

          <div className="mt-10">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mb-4">Demo accounts</p>
            <div className="flex flex-col gap-3">
              {DEMO_CREDENTIALS.map(d => (
                <button key={d.email}
                  onClick={() => { setTab('login'); setLoginEmail(d.email); setLoginPassword('password123'); setError('') }}
                  className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-2xl px-4 py-3 transition-all text-left w-full">
                  <div className="relative flex-shrink-0">
                    <TrustRingMini score={d.score} />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white rotate-90">{d.score}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{d.name}</div>
                    <div className="text-[11px] text-white/40 truncate">{d.email}</div>
                  </div>
                  <div className="text-[10px] font-bold text-gold bg-gold/15 px-2.5 py-1 rounded-full">Tier {d.tier}</div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors">→</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/25 mt-3">Password: <span className="font-mono text-white/40">password123</span></p>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[12px] text-white/25">
          <span>🛡️</span><span>Licensed under CBK digital lending guidelines</span>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ══════════════════════════════════════════════════ */}
      <div className={`flex flex-col justify-start bg-cream min-h-screen py-14 overflow-y-auto ${
        isSaccoBrowse ? 'px-8 sm:px-14 lg:px-16' : 'px-8 sm:px-16 lg:px-20'
      }`}>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <a href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-forest">Nawiri</span>
          </a>
        </div>

        {/* ─── SACCO BROWSE ──────────────────────────────────────────────── */}
        {isSaccoBrowse && regStep === 'sacco-browse' && !selectedSacco && (
          <div className="w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-full px-4 py-2 mb-4">
                <span className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center text-white text-[9px] font-black">✓</span>
                <p className="text-[12px] font-bold text-[#16a34a]">Account approved — welcome to Nawiri!</p>
              </div>
              <h1 className="font-playfair text-[38px] font-black text-forest leading-tight">Choose a SACCO</h1>
              <p className="text-[15px] text-muted mt-2 max-w-xl">
                Browse SACCOs and read their full terms before applying. You can apply to multiple — take your time.
              </p>
            </div>

            {/* Sector filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {sectors.map(s => (
                <button key={s} onClick={() => setSaccoFilter(s)}
                  className={`px-4 py-2 text-[12px] font-bold rounded-xl border-2 transition-all capitalize ${
                    saccoFilter === s ? 'bg-forest text-white border-forest' : 'bg-white text-muted border-forest/12 hover:border-forest/30 hover:text-forest'
                  }`}>
                  {s === 'all' ? 'All Sectors' : s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredSaccos.map(s => (
                <SaccoCard key={s.id} sacco={s} applied={appliedSaccos.has(s.id)}
                  onView={() => { setSelectedSacco(s); setRegStep('sacco-detail') }} />
              ))}
            </div>

            {appliedSaccos.size > 0 && (
              <div className="mt-8 bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-4">Your Applications ({appliedSaccos.size})</p>
                <div className="space-y-3">
                  {SACCOS.filter(s => appliedSaccos.has(s.id)).map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-forest text-[15px]">{s.name}</p>
                        <p className="text-[12px] text-muted">{s.location}</p>
                      </div>
                      <span className="text-[11px] font-bold bg-[rgba(34,197,94,0.1)] text-[#16a34a] px-3 py-1.5 rounded-full flex-shrink-0">
                        ⏳ Pending · 3–5 days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── SACCO DETAIL ──────────────────────────────────────────────── */}
        {isSaccoBrowse && regStep === 'sacco-detail' && selectedSacco && (
          <div className="w-full max-w-3xl">
            <SaccoDetail sacco={selectedSacco} applied={appliedSaccos.has(selectedSacco.id)}
              onBack={() => { setSelectedSacco(null); setRegStep('sacco-browse') }}
              onApply={() => handleApply(selectedSacco.id)} />
          </div>
        )}

        {/* ─── AUTH FORMS ────────────────────────────────────────────────── */}
        {!isSaccoBrowse && (
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-playfair text-[40px] font-black text-forest leading-tight mb-2">
                {tab === 'login' ? 'Welcome back' :
                  regStep === 'details' ? 'Create account' :
                  regStep === 'account' ? 'Set up access' : 'Under review'}
              </h1>
              <p className="text-muted text-[15px]">
                {tab === 'login' ? 'Sign in to your Nawiri account to continue.' :
                  regStep === 'details' ? 'Tell us a bit about yourself. Takes 2 minutes.' :
                  regStep === 'account' ? 'Almost done — create your login credentials.' :
                  'Your application is being reviewed.'}
              </p>
            </div>

            {/* Tab switcher */}
            {(tab === 'login' || regStep === 'details') && (
              <div className="flex bg-cream-dark rounded-full p-1 mb-8">
                {(['login', 'register'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); setRegStep('details') }}
                    className={`flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all ${
                      tab === t ? 'bg-white text-forest shadow-sm' : 'text-muted hover:text-forest'
                    }`}>
                    {t === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>
            )}

            {/* Step progress */}
            {tab === 'register' && regStep !== 'pending' && <StepDots step={regStep} />}

            {/* Back link on step 2 */}
            {tab === 'register' && regStep === 'account' && (
              <button onClick={() => setRegStep('details')}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-forest transition-colors mb-6 group">
                <span className="w-7 h-7 rounded-xl bg-forest/8 flex items-center justify-center group-hover:bg-forest/15 transition-colors">←</span>
                Back to personal details
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="mt-0.5">⚠️</span>
                <p className="text-[13px] text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-6 bg-forest/10 border border-forest/20 rounded-2xl px-5 py-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-[14px] font-bold text-forest">Signed in!</p>
                  <p className="text-[12px] text-muted">Redirecting to your dashboard…</p>
                </div>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <Field label="Email address">
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                      className={`${inputCls} pr-12`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors">
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </Field>
                <button type="button" className="text-[12px] text-gold hover:text-gold/80 text-left -mt-2">Forgot password?</button>

                <button type="submit" disabled={loading || success}
                  className="w-full bg-forest text-white py-4 rounded-xl font-bold text-[15px] hover:bg-forest/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</> : 'Sign In →'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-forest/10" /><span className="text-[12px] text-muted">or try a demo</span><div className="flex-1 h-px bg-forest/10" />
                </div>

                <div className="flex flex-col gap-2">
                  {DEMO_CREDENTIALS.map(d => (
                    <button key={d.email} type="button"
                      onClick={() => { setLoginEmail(d.email); setLoginPassword('password123'); setError('') }}
                      className="flex items-center justify-between bg-white border border-forest/10 rounded-xl px-4 py-3 hover:border-forest/30 transition-all">
                      <div className="text-left">
                        <p className="text-[13px] font-semibold text-forest">{d.name}</p>
                        <p className="text-[11px] text-muted font-mono">{d.email}</p>
                      </div>
                      <span className="text-[11px] font-bold bg-gold/10 text-gold px-2.5 py-1 rounded-full">Tier {d.tier}</span>
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* ── REGISTER STEP 1: Personal Details ── */}
            {tab === 'register' && regStep === 'details' && (
              <form onSubmit={handleDetailsNext} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name *">
                    <input type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="Jane Mwangi" className={inputCls} />
                  </Field>
                  <Field label="Phone Number *">
                    <input type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX" className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Birth *">
                    <input type="date" required value={regDob} onChange={e => setRegDob(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="National ID Number *">
                    <input type="text" required value={regId} onChange={e => setRegId(e.target.value)}
                      placeholder="e.g. 12345678" className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City / Town">
                    <input type="text" value={regCity} onChange={e => setRegCity(e.target.value)}
                      placeholder="Nairobi" className={inputCls} />
                  </Field>
                  <Field label="Occupation">
                    <input type="text" value={regOccupation} onChange={e => setRegOccupation(e.target.value)}
                      placeholder="e.g. Trader" className={inputCls} />
                  </Field>
                </div>

                <div className="bg-forest/5 border border-forest/10 rounded-2xl px-4 py-3.5 flex items-start gap-3 text-[12px] text-muted">
                  <span className="text-base flex-shrink-0 mt-0.5">🔒</span>
                  Your details are used for identity verification and TrustScore calculation. All data is encrypted and never shared with third parties.
                </div>

                <button type="submit"
                  className="w-full bg-forest text-white py-4 rounded-xl font-bold text-[15px] hover:bg-forest/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/20">
                  Continue to Account Setup →
                </button>

                <p className="text-center text-[13px] text-muted">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setTab('login'); setError('') }} className="text-forest font-semibold hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {/* ── REGISTER STEP 2: Account Credentials ── */}
            {tab === 'register' && regStep === 'account' && (
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                {/* Who you are */}
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-forest/10 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-forest/8 flex items-center justify-center text-forest font-black text-[16px] flex-shrink-0">
                    {regName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-forest text-[14px]">{regName}</p>
                    <p className="text-[11px] text-muted truncate">{regPhone} · ID {regId}</p>
                  </div>
                </div>

                <Field label="Email address">
                  <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Password">
                    <input type={showPwd ? 'text' : 'password'} required minLength={8} value={regPassword}
                      onChange={e => setRegPassword(e.target.value)} placeholder="Min. 8 chars" className={inputCls} />
                  </Field>
                  <Field label="Confirm Password">
                    <input type={showPwd ? 'text' : 'password'} required value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)} placeholder="Repeat"
                      className={`${inputCls} ${regConfirm && regConfirm !== regPassword ? '!border-red-300 focus:!border-red-400' : ''}`} />
                  </Field>
                </div>

                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="text-[12px] text-muted hover:text-forest -mt-2 text-left transition-colors">
                  {showPwd ? '🙈 Hide' : '👁️ Show'} passwords
                </button>

                {regPassword && (
                  <div>
                    <div className="flex gap-1 mb-1.5">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                          pwdStrength(regPassword) > i
                            ? ['bg-red-400','bg-terra','bg-gold','bg-forest'][i]
                            : 'bg-forest/10'
                        }`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted">{['Too weak','Fair','Good','Strong ✓'][pwdStrength(regPassword)]}</p>
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      agreed ? 'bg-forest border-forest' : 'border-forest/25 group-hover:border-forest/50'
                    }`}>
                      {agreed && <span className="text-white text-[11px] font-bold">✓</span>}
                    </div>
                  </div>
                  <span className="text-[13px] text-muted leading-relaxed">
                    I agree to the <a href="#" className="text-forest font-semibold hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-forest font-semibold hover:underline">Privacy Policy</a>. I consent to data sharing as described.
                  </span>
                </label>

                <button type="submit" disabled={loading}
                  className="w-full bg-forest text-white py-4 rounded-xl font-bold text-[15px] hover:bg-forest/90 transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                    : 'Create Account →'}
                </button>

                <p className="text-[12px] text-muted text-center">
                  🪪 You'll complete ID verification after sign-up to activate your TrustScore.
                </p>
              </form>
            )}

            {/* ── REGISTER STEP 3: Pending / Approved ── */}
            {tab === 'register' && regStep === 'pending' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-forest via-[#1e4830] to-[#143020] rounded-3xl p-8 text-center relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-5xl mx-auto mb-5">🎉</div>
                  <h2 className="font-playfair text-[30px] font-black text-white mb-2">Account Created!</h2>
                  <p className="text-white/60 text-[14px] leading-relaxed max-w-xs mx-auto">
                    Welcome, {regName.split(' ')[0]}! Your account is live. Now choose a SACCO to join.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 space-y-4">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-widest">What happens next</p>
                  {[
                    { icon: '🔍', title: 'Identity verified', desc: 'Your National ID details have been checked automatically.' },
                    { icon: '📊', title: 'TrustScore assigned', desc: 'Your initial score is computed from your profile data.' },
                    { icon: '🏦', title: 'Choose a SACCO', desc: 'Browse SACCOs, read their full terms, and apply to join.' },
                  ].map((s, i) => (
                    <div key={s.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-forest/8 flex items-center justify-center text-[18px] flex-shrink-0">{s.icon}</div>
                      <div>
                        <p className="font-bold text-forest text-[13px] flex items-center gap-1.5">
                          {s.title}
                          {i < 2 && <span className="text-[10px] font-black bg-[rgba(34,197,94,0.1)] text-[#16a34a] px-1.5 py-0.5 rounded-full">Done</span>}
                        </p>
                        <p className="text-[12px] text-muted mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setRegStep('sacco-browse')}
                  className="w-full py-5 bg-gold text-forest font-black text-[17px] rounded-2xl hover:bg-gold/90 transition-all active:scale-[0.99] shadow-sm">
                  Browse & Join a SACCO →
                </button>
              </div>
            )}

            {/* Tab switch link */}
            {(tab === 'login' || regStep === 'details') && (
              <p className="mt-8 text-center text-[14px] text-muted">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setRegStep('details') }}
                  className="text-forest font-semibold hover:underline">
                  {tab === 'login' ? 'Register for free' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}