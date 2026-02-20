const links: Record<string, string[]> = {
  Product: ['Join a SACCO', 'TrustScore', 'P2P Lending', 'Business Loans'],
  Company: ['About Nawiri', 'Privacy Policy', 'Terms of Service', 'Contact'],
  Resources: ['Money Tips', 'Responsible Borrowing', 'CBK Financial Awareness', 'Help Center'],
}

export default function Footer() {
  return (
    <>
      <footer className="bg-ink px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="font-playfair text-2xl font-black text-white">Nawiri</span>
          </div>
          <p className="text-[14px] text-white/35 leading-relaxed max-w-[240px]">
            Building financial trust for East Africa — one deposit at a time.
          </p>
        </div>

        {/* Links */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-white/35 mb-4">
              {heading}
            </h5>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[14px] text-white/55 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>

      <div className="bg-ink border-t border-white/6 px-8 md:px-16 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[12px] text-white/25">
          © 2025 Nawiri Financial Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-[11px] text-white/25">
          <span>🛡️</span>
          <span>Licensed & supervised under CBK digital lending guidelines</span>
        </div>
      </div>
    </>
  )
}
