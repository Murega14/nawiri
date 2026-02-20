'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 transition-all duration-300 ${
        scrolled
          ? 'py-4 bg-cream/90 backdrop-blur-md border-b border-gold/15 shadow-sm'
          : 'py-6 bg-cream/80 backdrop-blur-sm'
      }`}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gold" />
        <span className="font-playfair text-2xl font-black text-forest tracking-tight">Nawiri</span>
      </a>

      {/* Links */}
      <div className="hidden md:flex items-center gap-9">
        <a href="#how" className="text-sm font-medium text-muted hover:text-forest transition-colors">
          How it works
        </a>
        <a href="#trust" className="text-sm font-medium text-muted hover:text-forest transition-colors">
          TrustScore
        </a>
        <a href="#p2p" className="text-sm font-medium text-muted hover:text-forest transition-colors">
          P2P Lending
        </a>

        {user ? (
          /* Logged-in state */
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="flex items-center gap-2.5 bg-forest/6 border border-forest/12 px-4 py-2 rounded-full hover:bg-forest/10 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center text-xs">
                {user.avatar}
              </div>
              <span className="text-sm font-semibold text-forest">{user.name.split(' ')[0]}</span>
              <span className="font-mono text-[11px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                {user.trustScore}
              </span>
            </a>
            <button
              onClick={() => { logout(); router.push('/') }}
              className="text-sm font-medium text-muted hover:text-forest transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          /* Logged-out state */
          <div className="flex items-center gap-3">
            <a
              href="/auth"
              className="text-sm font-medium text-muted hover:text-forest transition-colors"
            >
              Sign in
            </a>
            <a
              href="/auth"
              className="text-sm font-semibold text-white bg-forest px-6 py-2.5 rounded-full hover:bg-forest-light transition-all hover:-translate-y-0.5 shadow-md shadow-forest/20"
            >
              Join a SACCO →
            </a>
          </div>
        )}
      </div>

      {/* Mobile */}
      <a
        href="/auth"
        className="md:hidden text-forest font-medium text-sm border border-forest/20 px-4 py-2 rounded-full"
      >
        {user ? user.name.split(' ')[0] : 'Sign in'}
      </a>
    </nav>
  )
}
