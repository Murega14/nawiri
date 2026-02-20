'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Icons                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
const IC = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  savings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <path d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"/>
      <path d="M16 3v4M8 3v4M3 11h18"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  loans: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <rect x="2" y="5" width="20" height="14" rx="2.5"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <path d="M7 15h3M16 15h1"/>
    </svg>
  ),
  p2p: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <path d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Nav config                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',   icon: IC.dashboard, badge: null },
  { href: '/profile',   label: 'My Profile',  icon: IC.profile,   badge: null },
  { href: '/sacco',   label: 'Sacco',  icon: IC.profile,   badge: 3 },
  { href: '/savings',   label: 'Savings',     icon: IC.savings,   badge: null },
  { href: '/loans',     label: 'Loans',       icon: IC.loans,     badge: '1' },
  { href: '/p2p',       label: 'P2P Lending', icon: IC.p2p,       badge: null },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile':   'My Profile',
  '/savings':   'Savings',
  '/loans':     'Loans',
  '/p2p':       'P2P Lending',
  '/settings':  'Settings',
}

const TIER_STYLES: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  A: { ring: 'ring-[#2d8c4e]', bg: 'bg-[#2d8c4e]', text: 'text-white', label: 'Best Terms' },
  B: { ring: 'ring-gold',      bg: 'bg-gold',       text: 'text-white', label: 'Good Terms' },
  C: { ring: 'ring-terra',     bg: 'bg-terra',      text: 'text-white', label: 'Standard' },
  D: { ring: 'ring-muted',     bg: 'bg-muted',      text: 'text-white', label: 'Strict' },
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  NavItem                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: typeof NAV_ITEMS[0]
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <a
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        relative flex items-center gap-3 rounded-xl transition-all duration-150 group
        ${collapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5'}
        ${active
          ? 'bg-white/[0.13] text-white'
          : 'text-white/50 hover:text-white/90 hover:bg-white/[0.06]'
        }
      `}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gold" />
      )}

      <span className={`flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
        {item.icon}
      </span>

      {!collapsed && (
        <span className={`text-[13px] font-medium flex-1 ${active ? 'font-semibold' : ''}`}>
          {item.label}
        </span>
      )}

      {/* Badge */}
      {item.badge && !collapsed && (
        <span className="ml-auto text-[9px] bg-terra text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
          {item.badge}
        </span>
      )}
      {item.badge && collapsed && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terra border border-[#1a3c2b]" />
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-[#0e2418] text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {item.label}
          {item.badge && <span className="ml-1.5 text-terra font-bold">({item.badge})</span>}
        </span>
      )}
    </a>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Shell                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function DashboardShell({
  children,
  rightPanel,
}: {
  children: React.ReactNode
  rightPanel?: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [collapsed,   setCollapsed]   = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  /* Track main-area scroll for header shadow */
  useEffect(() => {
    const el = document.getElementById('main-scroll')
    if (!el) return
    const fn = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', fn)
    return () => el.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => { logout(); router.push('/') }
  const tier = user ? (TIER_STYLES[user.tier] ?? TIER_STYLES.D) : null
  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard'

  const sidebarW = collapsed ? 'w-[60px]' : 'w-[220px]'

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: 'linear-gradient(135deg, #e8e2d6 0%, #ede8de 50%, #e4ddd0 100%)',
      }}
    >

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 flex flex-col flex-shrink-0
          ${sidebarW} transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #162d20 0%, #1a3c2b 60%, #172f22 100%)',
        }}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center border-b border-white/[0.07] flex-shrink-0 ${collapsed ? 'justify-center px-3 py-[17px]' : 'justify-between px-4 py-4'}`}>
          {!collapsed && (
            <a href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold/20">
                <span className="font-playfair font-black text-white text-sm leading-none">N</span>
              </div>
              <div className="min-w-0">
                <div className="font-playfair font-black text-white text-[15px] leading-none tracking-tight">NAWIRI</div>
                <div className="text-[9px] text-white/30 leading-none mt-0.5 tracking-widest uppercase">Building together</div>
              </div>
            </a>
          )}
          {collapsed && (
            <a href="/" className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
              <span className="font-playfair font-black text-white text-sm leading-none">N</span>
            </a>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/8 transition-all ${collapsed ? 'mt-0' : ''}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 ${collapsed ? 'px-2 space-y-1' : 'px-3 space-y-0.5'}`}>
          {/* Main nav */}
          <div className={`${!collapsed ? 'mb-1' : ''}`}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.12em] px-3.5 mb-2">Menu</p>
            )}
            {NAV_ITEMS.map(item => {
              const active =
                (item.href === pathname) ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <NavItem
                  key={item.label}
                  item={item}
                  active={active}
                  collapsed={collapsed}
                  onClick={() => setMobileOpen(false)}
                />
              )
            })}
          </div>

          {/* Divider */}
          <div className={`${collapsed ? 'my-2' : 'my-3'} border-t border-white/[0.06]`} />

          {/* Secondary */}
          <div>
            {!collapsed && (
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.12em] px-3.5 mb-2">Account</p>
            )}
            <NavItem
              item={{ href: '/settings', label: 'Settings', icon: IC.settings, badge: null }}
              active={pathname === '/settings'}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </nav>

        {/* User card */}
        {user && (
          <div className={`border-t border-white/[0.07] flex-shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
            {!collapsed ? (
              <div className="rounded-xl bg-white/[0.06] overflow-hidden mb-2">
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  {/* Avatar */}
                  <div className={`relative flex-shrink-0 w-8 h-8 rounded-full ring-2 ${tier?.ring} ring-offset-1 ring-offset-[#1a3c2b] flex items-center justify-center bg-white/15 text-base`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white leading-tight truncate">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-white/35 truncate leading-tight">{user.email}</p>
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${tier?.bg} ${tier?.text}`}>
                    {user.tier}
                  </span>
                </div>
                {/* Score bar */}
                <div className="px-3 pb-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-white/30 font-medium">TrustScore</span>
                    <span className="text-[9px] font-bold text-gold font-mono">{user.trustScore}</span>
                  </div>
                  <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold"
                      style={{ width: `${((user.trustScore - 300) / 550) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-2">
                <div className={`w-8 h-8 rounded-full ring-2 ${tier?.ring} ring-offset-1 ring-offset-[#1a3c2b] flex items-center justify-center bg-white/15 text-base`}>
                  {user.avatar}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              title={collapsed ? 'Sign out' : undefined}
              className={`w-full flex items-center gap-2.5 rounded-xl text-[11px] font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}`}
            >
              {IC.logout}
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        )}
      </aside>

      {/* ── Main column ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className={`flex-shrink-0 flex items-center justify-between px-5 lg:px-6 py-3 transition-all duration-200 ${
            scrolled
              ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-black/[0.06]'
              : 'bg-transparent border-b border-transparent'
          }`}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-forest hover:bg-forest/8 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              {IC.menu}
            </button>

            {/* Breadcrumb-style title */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted font-medium">Nawiri</span>
                <span className="text-[10px] text-muted/40">/</span>
                <span className="text-[10px] font-semibold text-forest">{pageTitle}</span>
              </div>
              <p className="text-[12px] text-muted/60 leading-none mt-0.5">
                {new Date().toLocaleDateString('en-KE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <div className="hidden sm:flex items-center gap-2 bg-white/70 border border-black/[0.07] rounded-xl px-3 py-2 text-muted hover:border-forest/20 transition-colors cursor-pointer group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-muted/50 group-hover:text-muted transition-colors">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-[11px] text-muted/50 select-none w-24">Search…</span>
              <kbd className="text-[9px] bg-cream border border-forest/10 rounded px-1 py-0.5 text-muted/40 font-mono">⌘K</kbd>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-white/70 border border-black/[0.07] hover:border-forest/20 transition-colors group">
              <span className="text-muted/60 group-hover:text-forest transition-colors block">
                {IC.bell}
              </span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-terra border border-white" />
            </button>

            {/* Profile chip */}
            {user && (
              <a
                href="/profile"
                className="flex items-center gap-2 bg-white/70 border border-black/[0.07] hover:border-forest/20 rounded-xl px-3 py-2 transition-all hover:shadow-sm group"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ring-1 ${tier?.ring ?? 'ring-forest/20'} ring-offset-1 ring-offset-white`}>
                  {user.avatar}
                </div>
                <span className="text-[12px] font-semibold text-forest hidden sm:block leading-none">
                  {user.name.split(' ')[0]}
                </span>
                <span className="font-mono text-[10px] font-bold text-gold bg-gold/12 px-1.5 py-0.5 rounded-full leading-none">
                  {user.trustScore}
                </span>
              </a>
            )}
          </div>
        </header>

        {/* Content + optional right panel */}
        <div className="flex flex-1 overflow-hidden">
          <main
            id="main-scroll"
            className="flex-1 overflow-y-auto"
            style={{ padding: '20px 24px 48px', scrollbarWidth: 'thin' }}
          >
            {children}
          </main>

          {rightPanel && (
            <aside className="hidden xl:flex flex-col w-[280px] flex-shrink-0 bg-white/60 backdrop-blur-sm border-l border-black/[0.06] overflow-y-auto">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}