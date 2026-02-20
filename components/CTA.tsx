export default function CTA() {
  return (
    <section className="relative bg-forest px-8 md:px-16 py-28 text-center overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-gold/8 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="text-gold text-[11px] font-bold uppercase tracking-widest">Start Today</span>
        </div>
        <h2 className="font-playfair text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl mx-auto mb-5">
          Your SACCO is already waiting for you
        </h2>
        <p className="text-white/50 text-[17px] leading-relaxed max-w-xl mx-auto mb-12">
          Join thousands of members saving, borrowing responsibly, and growing their credit
          reputation — together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="bg-gold text-white px-10 py-4 rounded-full text-[15px] font-bold hover:bg-gold-light transition-all hover:-translate-y-0.5 shadow-xl shadow-gold/40"
          >
            Join a SACCO Free
          </a>
          <a
            href="#trust"
            className="border border-white/25 text-white px-10 py-4 rounded-full text-[15px] font-semibold hover:border-white/50 hover:bg-white/5 transition-all"
          >
            Learn about TrustScore
          </a>
        </div>
      </div>
    </section>
  )
}
