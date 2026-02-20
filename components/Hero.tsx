'use client'
import DashboardCard from './DashboardCard'

export default function Hero() {
  return (
    <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-12 px-8 md:px-16 pt-32 pb-20 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-forest/6 blur-[100px] pointer-events-none" />

      {/* Left — copy */}
      <div className="relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-gold-pale border border-gold/30 rounded-full px-4 py-1.5 mb-7 animate-fade-up">
          <span className="text-gold text-xs">✦</span>
          <span className="text-gold text-[11px] font-bold uppercase tracking-widest">
            Built for East Africa's Savings Culture
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-playfair text-5xl md:text-6xl lg:text-[64px] font-black text-forest leading-[1.07] mb-6 animate-fade-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          Save together.{' '}
          <em className="not-italic text-gold">Grow</em>
          <br />
          beyond<br />the ordinary.
        </h1>

        {/* Subtext */}
        <p
          className="text-lg text-muted leading-relaxed max-w-md mb-10 animate-fade-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          Nawiri connects you to trusted SACCOs, helps you build a credit reputation
          that's truly yours, and unlocks peer-to-peer loans from members who believe in you.
        </p>

        {/* CTAs */}
        <div
          className="flex items-center gap-4 mb-12 animate-fade-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <a
            href="#"
            className="bg-forest text-white px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-lg shadow-forest/25"
          >
            Join Your SACCO
          </a>
          <a
            href="#how"
            className="group flex items-center gap-2 text-[15px] font-medium text-forest"
          >
            See how it works
            <span className="inline-block transition-transform group-hover:translate-x-1.5">→</span>
          </a>
        </div>

        {/* Stats */}
        <div
          className="flex gap-8 pt-8 border-t border-forest/10 animate-fade-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          {[
            { num: '12K+', label: 'Active Members' },
            { num: 'KES 480M', label: 'Savings Managed' },
            { num: '94%', label: 'Repayment Rate' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-playfair text-3xl font-bold text-forest">{s.num}</span>
              <span className="text-[11px] text-muted uppercase tracking-wider font-semibold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — dashboard visual */}
      <div
        className="hidden lg:block relative animate-fade-up"
        style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
      >
        <DashboardCard />
      </div>
    </section>
  )
}
