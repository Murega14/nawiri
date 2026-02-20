'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const SACCOS = [
  'Fahari SACCO',
  'Ushirika SACCO',
  'Pwani SACCO',
  'Maendeleo SACCO',
  'Nguvu SACCO',
  'Umoja SACCO',
]

const DEMO_CREDENTIALS = [
  { name: 'Amina Waweru', email: 'amina@example.com', tier: 'B · 742', score: 742 },
  { name: 'David Kipchoge', email: 'david@example.com', tier: 'B · 694', score: 694 },
  { name: 'Fatuma Abdi', email: 'fatuma@example.com', tier: 'A · 801', score: 801 },
]

function TrustRingMini({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const pct = (score - 300) / 550
  const offset = circ * (1 - pct)
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e8b84b" strokeWidth="3.5"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const { login, register, user } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regSacco, setRegSacco] = useState('')
  const [agreed, setAgreed] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(loginEmail, loginPassword)
    setLoading(false)
    if (!result.ok) {
      setError(result.error || 'Login failed')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 800)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please accept the terms to continue.')
      return
    }
    setLoading(true)
    const result = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      sacco: regSacco,
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.error || 'Registration failed')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 800)
    }
  }

  const fillDemo = (email: string) => {
    setLoginEmail(email)
    setLoginPassword('password123')
    setError('')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── LEFT PANEL — brand ─────────────────────────────────────── */}
      <div className="relative bg-forest hidden lg:flex flex-col justify-between p-14 overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/6 blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-white">Nawiri</span>
          </a>
        </div>

        {/* Middle — headline */}
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-light mb-5">
            ✦ Built on Trust
          </p>
          <h2 className="font-playfair text-5xl font-black text-white leading-[1.08] mb-6">
            Every deposit<br />builds your<br />
            <em className="not-italic text-gold">future.</em>
          </h2>
          <p className="text-white/45 text-[15px] leading-relaxed max-w-sm">
            Join a SACCO, save consistently, and unlock peer-to-peer loans
            — all powered by a credit score you actually understand.
          </p>

          {/* Demo user pills */}
          <div className="mt-10">
            <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mb-4">
              Demo accounts
            </p>
            <div className="flex flex-col gap-3">
              {DEMO_CREDENTIALS.map((d) => (
                <button
                  key={d.email}
                  onClick={() => { setTab('login'); fillDemo(d.email) }}
                  className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-2xl px-4 py-3 transition-all text-left w-full"
                >
                  <div className="relative flex-shrink-0">
                    <TrustRingMini score={d.score} />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white rotate-90">
                      {d.score}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{d.name}</div>
                    <div className="text-[11px] text-white/40 truncate">{d.email}</div>
                  </div>
                  <div className="text-[10px] font-bold text-gold-light bg-gold/15 px-2.5 py-1 rounded-full">
                    Tier {d.tier}
                  </div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors text-sm">→</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-white/25 mt-3">
              Password for all demo accounts: <span className="font-mono text-white/40">password123</span>
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative flex items-center gap-2 text-[12px] text-white/25">
          <span>🛡️</span>
          <span>Licensed under CBK digital lending guidelines</span>
        </div>
      </div>

      {/* ── RIGHT PANEL — forms ────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-16 bg-cream min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <a href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-forest">Nawiri</span>
          </a>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-playfair text-4xl font-black text-forest mb-2">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-muted text-[15px]">
              {tab === 'login'
                ? 'Sign in to your Nawiri account to continue.'
                : 'Start your savings journey — it takes 2 minutes.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-cream-dark rounded-full p-1 mb-8">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-white text-forest shadow-sm shadow-forest/10'
                    : 'text-muted hover:text-forest'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Success flash */}
          {success && (
            <div className="mb-6 bg-forest/10 border border-forest/20 rounded-2xl px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-[14px] font-bold text-forest">
                  {tab === 'login' ? 'Signed in!' : 'Account created!'}
                </div>
                <div className="text-[12px] text-muted">Redirecting to your dashboard…</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-base mt-0.5">⚠️</span>
              <p className="text-[13px] text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button" className="text-[12px] text-gold hover:text-gold-light font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors text-sm"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-forest text-white py-4 rounded-xl font-semibold text-[15px] hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-forest/10" />
                <span className="text-[12px] text-muted">or try a demo account</span>
                <div className="flex-1 h-px bg-forest/10" />
              </div>

              <div className="flex flex-col gap-2">
                {DEMO_CREDENTIALS.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fillDemo(d.email)}
                    className="flex items-center justify-between bg-white border border-forest/10 rounded-xl px-4 py-3 hover:border-forest/30 hover:bg-forest/2 transition-all group"
                  >
                    <div className="text-left">
                      <div className="text-[13px] font-semibold text-forest">{d.name}</div>
                      <div className="text-[11px] text-muted font-mono">{d.email}</div>
                    </div>
                    <span className="text-[11px] font-bold text-gold-light bg-gold/10 px-2.5 py-1 rounded-full">
                      Tier {d.tier}
                    </span>
                  </button>
                ))}
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              {/* Name + Phone row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jane Mwangi"
                    className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                  Select SACCO
                </label>
                <div className="relative">
                  <select
                    required
                    value={regSacco}
                    onChange={(e) => setRegSacco(e.target.value)}
                    className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose your SACCO…</option>
                    {SACCOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-sm">▾</span>
                </div>
              </div>

              {/* Passwords row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 chars"
                      className="w-full bg-white border border-forest/15 rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-forest uppercase tracking-wider mb-2">
                    Confirm
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full bg-white border rounded-xl px-4 py-3.5 text-[15px] text-forest placeholder-muted/60 outline-none focus:ring-2 transition-all ${
                      regConfirm && regConfirm !== regPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-forest/15 focus:border-forest focus:ring-forest/10'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[12px] text-muted hover:text-forest transition-colors text-left -mt-2"
              >
                {showPassword ? '🙈 Hide passwords' : '👁️ Show passwords'}
              </button>

              {/* Password strength */}
              {regPassword && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all ${
                          regPassword.length >= i * 3
                            ? i <= 1 ? 'bg-red-400'
                              : i <= 2 ? 'bg-terra'
                              : i <= 3 ? 'bg-gold'
                              : 'bg-forest'
                            : 'bg-cream-dark'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted">
                    {regPassword.length < 4 ? 'Too weak' : regPassword.length < 7 ? 'Fair' : regPassword.length < 10 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    agreed ? 'bg-forest border-forest' : 'border-forest/25 group-hover:border-forest/50'
                  }`}>
                    {agreed && <span className="text-white text-[11px] font-bold">✓</span>}
                  </div>
                </div>
                <span className="text-[13px] text-muted leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-forest font-semibold hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-forest font-semibold hover:underline">Privacy Policy</a>.
                  I consent to data sharing as described.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-forest text-white py-4 rounded-xl font-semibold text-[15px] hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : 'Create Account'}
              </button>

              {/* KYC note */}
              <p className="text-[12px] text-muted text-center leading-relaxed">
                🪪 You'll complete ID verification after sign-up to activate your TrustScore.
              </p>
            </form>
          )}

          {/* Switch tab link */}
          <p className="mt-8 text-center text-[14px] text-muted">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
              className="text-forest font-semibold hover:underline"
            >
              {tab === 'login' ? 'Register for free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
