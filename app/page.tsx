'use client'

import { useEffect, useState } from 'react'
import {
  Star,
  ArrowRight,
  Globe,
  BarChart3,
  AlertTriangle,
  Users,
  HandCoins,
  TrendingUp,
  GraduationCap,
  Rocket,
  Lightbulb,
  UserCheck,
  Wallet,
  BadgeDollarSign,
  Smartphone,
  ShieldCheck,
  Quote,
} from 'lucide-react'

/*
  ─────────────────────────────────────────────────────────────
  SETUP REQUIRED — add to tailwind.config.ts:

  theme: {
    extend: {
      colors: {
        forest:  { DEFAULT: '#1a3a2a', light: '#2d6349' },
        gold:    { DEFAULT: '#c8992a', light: '#e8b84b', pale: '#fdf6e3' },
        cream:   { DEFAULT: '#faf7f2', dark: '#f2ede4' },
        terra:   '#b05530',
        ink:     '#0d1f16',
        muted:   '#7a8a7e',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        mono:     ['"DM Mono"', 'monospace'],
      },
      keyframes: {
        floatBob: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floatBob: 'floatBob 3s ease-in-out infinite',
        fadeUp:   'fadeUp 0.6s ease both',
      },
    },
  },

  SETUP REQUIRED — add to globals.css:

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: none;
  }
  ─────────────────────────────────────────────────────────────
*/

/* ── Reveal hook ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        }),
      { threshold: 0.12 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ── TrustScore SVG Ring ─────────────────────────────────── */
function TrustRing({ score = 750 }: { score?: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - (score - 300) / 550)
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90 shrink-0">
      <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5" />
      <circle
        cx="30" cy="30" r={r}
        fill="none" stroke="#e8b84b" strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
      <text
        x="30" y="30"
        dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="11" fontFamily="DM Mono, monospace"
        transform="rotate(90,30,30)"
      >
        {score}
      </text>
    </svg>
  )
}

/* ── Eyebrow label ───────────────────────────────────────── */
function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={`w-6 h-0.5 shrink-0 ${light ? 'bg-gold-light' : 'bg-gold'}`} />
      <span className={`text-[11px] font-bold uppercase tracking-[2.5px] ${light ? 'text-gold-light' : 'text-gold'}`}>
        {text}
      </span>
    </div>
  )
}

/* ── Hero Dashboard Card ─────────────────────────────────── */
function DashboardCard() {
  return (
    <div className="relative">
      {/* Floating badge */}
      <div className="absolute -right-7 top-14 z-10 animate-floatBob bg-gold text-white rounded-2xl px-4 py-3 text-center shadow-xl shadow-gold/40 whitespace-nowrap">
        <strong className="block text-xl font-bold">+18 pts</strong>
        <small className="text-[11px] opacity-85">Score boost this month</small>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-forest/8 shadow-2xl shadow-forest/10">

        {/* Card header */}
        <div className="bg-forest px-7 py-7">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold-light bg-gold-light/15 px-3 py-1 rounded-full mb-4">
            Rongai Women's Chama
          </span>
          <div className="text-[11px] text-white/45 mb-1">Total Pool</div>
          <div className="font-playfair text-[38px] font-bold text-white leading-none mb-1.5">
            <span className="text-lg opacity-60 font-normal">KSh </span>345,200
          </div>
          <div className="text-[12px] text-white/40 mb-5">5 active members · 92% repayment rate</div>
          <div className="flex items-center gap-4">
            <TrustRing score={750} />
            <div>
              <div className="text-[13px] font-bold text-gold-light">Tier A · Excellent Terms</div>
              <div className="text-[12px] text-white/40 mt-0.5">TrustScore — up 18 pts this month</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 divide-x divide-forest/8 border-t border-forest/8">
          {[
            { label: "Mary's Contribution", val: 'KSh 43,400', note: '1.5× multiplier' },
            { label: 'Loan Eligibility',    val: 'KSh 65,100', note: 'At 10.5% interest' },
          ].map((s) => (
            <div key={s.label} className="px-6 py-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-1.5">{s.label}</div>
              <div className="font-playfair text-xl font-bold text-forest">{s.val}</div>
              <div className="text-[11px] text-muted mt-0.5">{s.note}</div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="border-t border-forest/8">
          {[
            {
              Icon: Wallet, iconBg: 'bg-forest/10', iconColor: 'text-forest-light',
              title: 'Monthly Contribution', sub: 'Received · 2 days ago',
              amt: '+KSh 8,000', badge: 'On track', badgeCls: 'bg-forest/10 text-forest-light',
              border: true,
            },
            {
              Icon: HandCoins, iconBg: 'bg-gold/10', iconColor: 'text-gold',
              title: 'P2P Loan Funded', sub: 'You lent to 3 members',
              amt: 'KSh 15,000', badge: '7 days', badgeCls: 'bg-gold/15 text-gold',
              border: false,
            },
          ].map((a) => (
            <div key={a.title} className={`flex items-center gap-3 px-5 py-4 ${a.border ? 'border-b border-forest/6' : ''}`}>
              <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0`}>
                <a.Icon className={`w-5 h-5 ${a.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-forest">{a.title}</div>
                <div className="text-[12px] text-muted">{a.sub}</div>
              </div>
              <div className="text-right ml-2 shrink-0">
                <div className="text-[15px] font-bold text-forest">{a.amt}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${a.badgeCls}`}>{a.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── TrustScore Breakdown Card ───────────────────────────── */
function ScoreCard() {
  const factors = [
    { label: 'SACCO Savings & Conduct',   pct: 45, cls: 'bg-forest' },
    { label: 'P2P Repayment Behaviour',   pct: 30, cls: 'bg-gold'   },
    { label: 'Recent Cash-Flow Signals',  pct: 15, cls: 'bg-terra'  },
    { label: 'Identity & Contactability', pct: 10, cls: 'bg-muted'  },
  ]
  return (
    <div className="bg-white rounded-3xl p-10 shadow-2xl shadow-forest/10 border border-forest/7">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[15px] font-bold text-forest">TrustScore Breakdown</span>
        <span className="font-mono text-[11px] text-muted tracking-wider">TUJENGE SCORE</span>
      </div>
      <div className="font-playfair text-[72px] font-black text-forest leading-none mb-1">742</div>
      <div className="text-[13px] text-muted mb-6">Tier B · 300–850 range</div>
      {/* Gradient bar */}
      <div className="h-2.5 rounded-full bg-cream-dark overflow-hidden mb-2">
        <div
          className="h-full rounded-full w-[66%]"
          style={{ background: 'linear-gradient(90deg, #b05530 0%, #c8992a 45%, #1a3a2a 80%)' }}
        />
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted mb-9">
        <span>300</span><span>600</span><span>850</span>
      </div>
      {/* Factor bars */}
      <div className="flex flex-col gap-4">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="text-[12px] text-muted min-w-[170px]">{f.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-cream-dark overflow-hidden">
              <div className={`h-full rounded-full ${f.cls}`} style={{ width: `${f.pct}%` }} />
            </div>
            <span className="font-mono text-[12px] font-medium text-forest min-w-[36px] text-right">{f.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Main page component
══════════════════════════════════════════════════════════ */
export default function TujengePage() {
  const [scrolled, setScrolled] = useState(false)
  useReveal()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* ── Data arrays ── */
  const problems = [
    { Icon: Globe,        title: 'Village Economy Lost',   desc: "Traditional chamas and savings circles — Africa's original fintech — built wealth through trust. Urbanization broke these networks, leaving millions financially disconnected and invisible to formal finance." },
    { Icon: BarChart3,    title: 'Stagnant Credit',        desc: "Private sector credit growth in Kenya has turned negative. Without payslips or bank history, entrepreneurs can't access capital — not because they're risky, but because their trust simply doesn't translate." },
    { Icon: AlertTriangle,title: 'Predatory Alternatives', desc: 'High-interest mobile loan apps exploit desperation, trapping borrowers in debt cycles. Digital lenders are now the worst offenders in consumer complaints across East Africa.' },
  ]

  const pillars = [
    { Icon: Users,          n: '01', title: 'Join Digital Chamas',  desc: 'Connect with verified community savings groups. Complete KYC in minutes with your national ID.' },
    { Icon: Wallet,         n: '02', title: 'Save Collectively',    desc: 'Build group capital together. Every on-time contribution automatically grows your TrustScore.' },
    { Icon: HandCoins,      n: '03', title: 'Access Fair Credit',   desc: 'Unlock peer-to-peer lending based on community trust. No black boxes, no hidden surprises.' },
    { Icon: Star,           n: '04', title: 'Build Your Score',     desc: 'Develop a TrustScore through savings, repayment, and active community participation.' },
  ]

  const wealthItems = [
    { Icon: TrendingUp,    title: 'Growing Member Wealth',   desc: "Returns from invested savings flow directly back to members' financial prosperity." },
    { Icon: GraduationCap, title: 'Empowering Communities', desc: 'A portion reinvested into educational initiatives and community skill development.' },
    { Icon: Rocket,        title: 'Platform Sustainability', desc: "Generated returns fund ongoing innovation and TUJENGE's long-term mission." },
  ]

  const steps = [
    { num: '01', Icon: UserCheck,       title: 'Join a Digital Chama', desc: 'Browse verified savings groups in your area. Complete KYC in minutes with your national ID and M-PESA number.' },
    { num: '02', Icon: Wallet,          title: 'Save Consistently',    desc: 'Make regular deposits to build your savings balance. Every on-time contribution grows your TrustScore automatically.' },
    { num: '03', Icon: BadgeDollarSign, title: 'Access Fair Loans',    desc: 'Once your TrustScore qualifies, unlock SACCO business loans. Repay on time to access better terms and higher limits.' },
    { num: '04', Icon: HandCoins,       title: 'Lend & Earn',          desc: 'As a trusted member, join the P2P marketplace. Fund short-term loans for fellow members and earn transparent returns.' },
  ]

  const tiers = [
    { letter: 'A', range: '750–850', perk: 'Up to 70% of savings', wrapCls: 'bg-forest/8  border-forest/20', letterCls: 'text-forest' },
    { letter: 'B', range: '650–749', perk: 'Up to 50% of savings', wrapCls: 'bg-gold/8    border-gold/20',   letterCls: 'text-gold'   },
    { letter: 'C', range: '550–649', perk: 'Up to 30% of savings', wrapCls: 'bg-terra/8   border-terra/20',  letterCls: 'text-terra'  },
    { letter: 'D', range: 'Below 550', perk: '0–20% of savings',  wrapCls: 'bg-forest/4  border-forest/10', letterCls: 'text-muted'  },
  ]

  const testimonials = [
    { q: 'In eight months my TrustScore went from 490 to 694. The platform showed me exactly what to fix — I just followed it.',             name: 'David Kipchoge', role: 'Small Business Owner · Eldoret',    initials: 'DK' },
    { q: "I've lent across seven loans and earned good returns — and my TrustScore went up every time members repaid on time. It's a win-win.", name: 'Fatuma Abdi',   role: 'Teacher · Mombasa',                 initials: 'FA' },
    { q: 'Back in my village the chama knew me. TUJENGE gave me that back in Nairobi. My business loan came through in days, not months.',    name: 'Mueni Mutua',   role: 'Cosmetics Entrepreneur · Nairobi', initials: 'MM' },
  ]

  const marketStats = [
    { num: '57%', Icon: Users,       title: 'Unbanked Adults',          sub: 'Across Sub-Saharan Africa — a massive underserved market with proven savings discipline' },
    { num: '80%', Icon: Smartphone,  title: 'Mobile Money Penetration', sub: 'Creating digital infrastructure ready to power community-first financial products' },
    { num: '15%', Icon: TrendingUp,  title: 'Annual Fintech Growth',    sub: 'The fastest-growing financial market in the world, driven by mobile-first consumers' },
  ]

  const footerLinks = [
    { heading: 'Product',   items: ['Join a Chama', 'TrustScore', 'P2P Lending', 'Business Loans'] },
    { heading: 'Company',   items: ['About TUJENGE', 'Privacy Policy', 'Terms of Service', 'Contact'] },
    { heading: 'Resources', items: ['Money Tips', 'Responsible Borrowing', 'CBK Financial Awareness', 'Help Center'] },
  ]

  /* ── JSX ── */
  return (
    <div className="font-sans bg-cream text-forest overflow-x-hidden">

      {/* ══ NAVBAR ════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-20 transition-all duration-300 ${
        scrolled
          ? 'py-3.5 bg-cream/90 backdrop-blur-md border-b border-gold/15 shadow-sm'
          : 'py-6 bg-cream/80 backdrop-blur-sm'
      }`}>
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          <div>
            <div className="font-playfair text-[22px] font-black text-forest leading-tight">TUJENGE</div>
            <div className="text-[10px] font-semibold text-muted uppercase tracking-[2px]">Digital Community Lending</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-9">
          <a href="#how"    className="text-sm font-medium text-muted hover:text-forest transition-colors no-underline">How it Works</a>
          <a href="#trust"  className="text-sm font-medium text-muted hover:text-forest transition-colors no-underline">TrustScore</a>
          <a href="#market" className="text-sm font-medium text-muted hover:text-forest transition-colors no-underline">Why Now</a>
          <a href="/auth"   className="text-sm font-semibold text-white bg-forest px-6 py-2.5 rounded-full hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-md shadow-forest/20 no-underline">
            Join a Chama →
          </a>
        </div>

        {/* Mobile */}
        <a href="#join" className="md:hidden text-sm font-medium text-forest border border-forest/20 px-4 py-2 rounded-full no-underline">Join</a>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-12 px-6 md:px-20 pt-36 pb-20 relative overflow-hidden">
        {/* Background glows */}
        <div
          className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,153,42,.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,58,42,.07) 0%, transparent 70%)' }}
        />

        {/* Left — copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-gold-pale border border-gold/30 rounded-full px-4 py-1.5 mb-7 animate-fadeUp">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span className="text-gold text-[11px] font-bold uppercase tracking-widest">Digitizing Africa's Savings Culture</span>
          </div>

          <h1
            className="font-playfair text-5xl md:text-6xl lg:text-[64px] font-black text-forest leading-[1.06] mb-6"
            style={{ animation: 'fadeUp 0.6s 0.1s ease both' }}
          >
            Community trust<br />
            becomes <em className="not-italic text-gold">financial</em><br />
            opportunity.
          </h1>

          <p
            className="text-lg text-muted leading-relaxed max-w-md mb-10"
            style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}
          >
            TUJENGE brings the power of Africa's traditional chama networks into the digital age — where your savings reputation unlocks fair credit, peer lending, and lasting wealth.
          </p>

          <div className="flex items-center gap-4 mb-12" style={{ animation: 'fadeUp 0.6s 0.3s ease both' }}>
            <a href="#join" className="bg-forest text-white px-9 py-4 rounded-full text-[15px] font-semibold hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/25 no-underline">
              Join a Chama Free
            </a>
            <a href="#how" className="group flex items-center gap-2 text-[15px] font-medium text-forest no-underline">
              See how it works
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </a>
          </div>

          <div className="flex gap-8 pt-8 border-t border-forest/10" style={{ animation: 'fadeUp 0.6s 0.4s ease both' }}>
            {[
              { num: '12K+',    label: 'Active Members'  },
              { num: 'KES 480M', label: 'Savings Managed' },
              { num: '94%',     label: 'Repayment Rate'  },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-playfair text-3xl font-bold text-forest">{s.num}</div>
                <div className="text-[11px] text-muted uppercase tracking-wider font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — dashboard card */}
        <div className="hidden lg:block relative" style={{ animation: 'fadeUp 0.6s 0.2s ease both' }}>
          <DashboardCard />
        </div>
      </section>

      {/* ══ PROBLEM ═══════════════════════════════════════════ */}
      <section className="bg-ink px-6 md:px-20 py-24 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,153,42,.06) 0%, transparent 70%)' }}
          />
        </div>
        <div className="relative z-10">
          <Eyebrow text="The Problem" light />
          <h2 className="font-playfair text-4xl md:text-5xl font-black text-white leading-tight max-w-lg mb-4">
            Trust doesn't <em className="not-italic text-gold">scale</em> in the city.
          </h2>
          <p className="text-[17px] text-white/45 max-w-xl mb-16 leading-relaxed">
            For millions of Africans like Mueni — a 27-year-old entrepreneur from Kathonzweni — moving to the city means losing the social capital that was their only access to credit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((p, i) => (
              <div
                key={p.title}
                className="reveal bg-white/[0.04] border border-white/8 rounded-2xl p-8 hover:bg-white/[0.07] transition-colors"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-5">
                  <p.Icon className="w-6 h-6 text-gold-light" />
                </div>
                <h3 className="text-[16px] font-bold text-white mb-3">{p.title}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SOLUTION ══════════════════════════════════════════ */}
      <section className="bg-cream px-6 md:px-20 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left */}
          <div>
            <Eyebrow text="The Solution" />
            <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight mb-4">
              Digitizing Africa's greatest <em className="not-italic text-gold">financial</em> system.
            </h2>
            <p className="text-[17px] text-muted leading-relaxed mb-10 max-w-md">
              TUJENGE is an AI-powered P2P community lending platform where people can save, lend, and borrow within trusted digital communities — restoring the village economy for the urban age.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((p, i) => (
                <div
                  key={p.n}
                  className="reveal bg-white rounded-2xl p-5 border border-forest/8 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-forest/8 transition-all duration-200"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center mb-3.5">
                    <p.Icon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-[14px] font-bold text-forest mb-1.5">{p.title}</h4>
                  <p className="text-[12px] text-muted leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="reveal">
            {/* Wealth ecosystem */}
            <div className="bg-forest rounded-3xl p-9 text-white mb-5">
              <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold-light mb-5">Beyond Lending</div>
              <h3 className="font-playfair text-[26px] font-bold leading-snug mb-4">
                A Community <em className="not-italic text-gold">Wealth</em> Ecosystem
              </h3>
              <p className="text-[14px] text-white/50 leading-relaxed mb-7">
                Idle chama funds are invested through licensed fund managers, creating returns that flow back to members, community education programs, and platform growth.
              </p>
              <div className="flex flex-col gap-5">
                {wealthItems.map((w) => (
                  <div key={w.title} className="flex gap-3.5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
                      <w.Icon className="w-5 h-5 text-gold-light" />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-white mb-1">{w.title}</div>
                      <div className="text-[13px] text-white/40 leading-relaxed">{w.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro tip */}
            <div className="bg-gold/10 border border-gold/25 rounded-2xl p-5 flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-gold" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-forest mb-1">Pro Tip</div>
                <p className="text-[12px] text-muted leading-relaxed">
                  Consistent savings + on-time repayments + P2P lending = faster path to Tier A, unlocking up to 70% of your savings at the best rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section id="how" className="bg-forest px-6 md:px-20 py-24 relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,153,42,.07) 0%, transparent 70%)' }}
        />
        <div className="relative z-10">
          <Eyebrow text="How TUJENGE Works" light />
          <h2 className="font-playfair text-4xl md:text-5xl font-black text-white leading-tight max-w-lg mb-4">
            Your journey to financial <em className="not-italic text-gold">freedom</em>
          </h2>
          <p className="text-[17px] text-white/45 max-w-lg mb-16 leading-relaxed">
            From your first deposit to P2P lending — a clear, transparent path with no hidden surprises.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Dashed connector (desktop) */}
            <div
              className="absolute hidden lg:block top-9 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px"
              style={{ background: 'repeating-linear-gradient(to right, rgba(200,153,42,.4) 0, rgba(200,153,42,.4) 8px, transparent 8px, transparent 16px)' }}
            />
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="reveal text-center relative z-10"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="w-[72px] h-[72px] rounded-full border-2 border-gold/30 bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <s.Icon className="w-7 h-7 text-gold-light" />
                </div>
                <div className="font-mono text-[11px] text-gold/60 mb-1">{s.num}</div>
                <h3 className="text-white font-bold text-[16px] mb-3">{s.title}</h3>
                <p className="text-white/45 text-[13px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST SCORE ═══════════════════════════════════════ */}
      <section id="trust" className="bg-cream-dark px-6 md:px-20 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">

          {/* Left */}
          <div>
            <Eyebrow text="TrustScore" />
            <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight mb-4">
              Your reputation, <em className="not-italic text-gold">honestly</em> earned
            </h2>
            <p className="text-[17px] text-muted leading-relaxed max-w-md mb-10">
              Your TrustScore (300–850) is built from real behaviour — savings habits, loan repayments, and cash-flow signals. No black boxes. You always see exactly what drives it.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tiers.map((t) => (
                <div
                  key={t.letter}
                  className={`rounded-xl border p-3.5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default ${t.wrapCls}`}
                >
                  <div className={`font-playfair text-[28px] font-black mb-0.5 ${t.letterCls}`}>{t.letter}</div>
                  <div className="font-mono text-[10px] text-muted mb-2">{t.range}</div>
                  <div className="text-[11px] font-semibold text-forest">{t.perk}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="reveal">
            <ScoreCard />
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="bg-white px-6 md:px-20 py-24">
        <Eyebrow text="Member Stories" />
        <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight max-w-lg mb-14">
          Real people, real <em className="not-italic text-gold">growth</em>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="reveal bg-cream rounded-2xl p-7 border border-forest/8 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10 transition-all duration-200"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <Quote className="w-8 h-8 text-gold mb-4 fill-gold/15" />
              <p className="text-[15px] text-forest leading-relaxed italic mb-6">{t.q}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-forest">{t.name}</div>
                  <div className="text-[12px] text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MARKET ════════════════════════════════════════════ */}
      <section id="market" className="bg-cream-dark px-6 md:px-20 py-24">
        <Eyebrow text="Why Now" />
        <h2 className="font-playfair text-4xl md:text-5xl font-black text-forest leading-tight max-w-xl mb-4">
          The future of <em className="not-italic text-gold">African</em> finance
        </h2>
        <p className="text-[17px] text-muted max-w-xl mb-16 leading-relaxed">
          Africa's informal savings groups manage over $500 billion annually. With 600 million mobile money users and rising digital adoption, TUJENGE sits at the intersection of community trust and mobile technology.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketStats.map((s, i) => (
            <div
              key={s.title}
              className="reveal bg-white rounded-2xl p-9 border border-forest/8 shadow-md text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-forest/8 flex items-center justify-center mx-auto mb-5">
                <s.Icon className="w-6 h-6 text-forest" />
              </div>
              <div className="font-playfair text-[52px] font-black text-forest leading-none mb-2">{s.num}</div>
              <div className="text-[14px] font-bold text-forest mb-2">{s.title}</div>
              <div className="text-[13px] text-muted leading-relaxed">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section id="join" className="bg-forest px-6 md:px-20 py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(200,153,42,.1) 0%, transparent 70%)' }}
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5 justify-center">
            <span className="w-6 h-0.5 bg-gold-light" />
            <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-gold-light">Join the Movement</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl mx-auto mb-5">
            Your chama is already waiting for you
          </h2>
          <p className="text-white/50 text-[17px] leading-relaxed max-w-xl mx-auto mb-12">
            Join thousands of members saving, borrowing responsibly, and growing their financial reputation — together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="bg-gold text-white px-10 py-4 rounded-full text-[15px] font-bold hover:bg-gold-light transition-all hover:-translate-y-0.5 shadow-xl shadow-gold/40 no-underline">
              Join a Chama Free
            </a>
            <a href="#trust" className="border border-white/25 text-white px-10 py-4 rounded-full text-[15px] font-semibold hover:border-white/50 hover:bg-white/5 transition-all no-underline">
              Learn about TrustScore
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="bg-ink px-6 md:px-20 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-white">TUJENGE</span>
          </div>
          <p className="text-[14px] text-white/35 leading-relaxed max-w-[240px]">
            Building financial trust for East Africa — one deposit at a time.
          </p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.heading}>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-4">{col.heading}</h5>
            <ul className="flex flex-col gap-3 list-none p-0">
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[14px] text-white/55 hover:text-white transition-colors no-underline">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>

      <div className="bg-ink border-t border-white/6 px-6 md:px-20 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[12px] text-white/25">© 2025 TUJENGE Financial Ltd. All rights reserved.</p>
        <div className="flex items-center gap-2 text-[11px] text-white/25">
          <ShieldCheck className="w-4 h-4" />
          <span>Licensed & supervised under CBK digital lending guidelines</span>
        </div>
      </div>

    </div>
  )
}