'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// ─── Dummy user database ────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  phone: string
  sacco: string
  avatar: string
  trustScore: number
  tier: 'A' | 'B' | 'C' | 'D'
  savings: number
  depositStreak: number
  memberSince: string
  kycLevel: 'Full' | 'Basic' | 'Pending'
}

const DUMMY_USERS: Array<User & { password: string }> = [
  {
    id: 'usr_001',
    name: 'Amina Waweru',
    email: 'amina@example.com',
    password: 'password123',
    phone: '+254 712 345 678',
    sacco: 'Fahari SACCO',
    avatar: '👩🏾',
    trustScore: 742,
    tier: 'B',
    savings: 148500,
    depositStreak: 7,
    memberSince: 'March 2023',
    kycLevel: 'Full',
  },
  {
    id: 'usr_002',
    name: 'David Kipchoge',
    email: 'david@example.com',
    password: 'password123',
    phone: '+254 723 456 789',
    sacco: 'Ushirika SACCO',
    avatar: '🧑🏾',
    trustScore: 694,
    tier: 'B',
    savings: 87200,
    depositStreak: 4,
    memberSince: 'June 2023',
    kycLevel: 'Full',
  },
  {
    id: 'usr_003',
    name: 'Fatuma Abdi',
    email: 'fatuma@example.com',
    password: 'password123',
    phone: '+254 734 567 890',
    sacco: 'Pwani SACCO',
    avatar: '👩🏾',
    trustScore: 801,
    tier: 'A',
    savings: 312000,
    depositStreak: 14,
    memberSince: 'January 2023',
    kycLevel: 'Full',
  },
]

// ─── Context types ───────────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  sacco: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nawiri_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 900))

    const found = DUMMY_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) {
      return { ok: false, error: 'Invalid email or password. Try amina@example.com / password123' }
    }
    const { password: _, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem('nawiri_user', JSON.stringify(safeUser))
    return { ok: true }
  }

  const register = async (data: RegisterData) => {
    await new Promise((r) => setTimeout(r, 1100))

    const exists = DUMMY_USERS.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
    if (exists) {
      return { ok: false, error: 'An account with that email already exists.' }
    }

    // Create a new dummy user with a low starting score
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      sacco: data.sacco,
      avatar: '🧑🏽',
      trustScore: 320,
      tier: 'D',
      savings: 0,
      depositStreak: 0,
      memberSince: new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
      kycLevel: 'Pending',
    }
    setUser(newUser)
    localStorage.setItem('nawiri_user', JSON.stringify(newUser))
    return { ok: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('nawiri_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
