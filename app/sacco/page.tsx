'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Data types                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
type VoteOption  = { id: string; label: string; votes: number }
type Poll = {
  id: string; title: string; description: string
  category: 'investment' | 'governance' | 'bylaw' | 'welfare'
  deadline: string; daysLeft: number; quorum: number
  totalVoters: number; votesCast: number; options: VoteOption[]
  userVote: string | null; status: 'open' | 'closed' | 'passed' | 'rejected'
  urgent: boolean
}
type Meeting = {
  id: string; title: string; type: 'agm' | 'special' | 'regular' | 'emergency'
  date: string; time: string; venue: string; virtual: boolean; agenda: string[]
  rsvp: 'yes' | 'no' | 'maybe' | null; attendees: number; totalMembers: number
  notes?: string
}
type Investment = {
  id: string; name: string; category: 'real_estate' | 'equity' | 'money_market' | 'agriculture' | 'bonds'
  amount: number; currentValue: number; returnPct: number; startDate: string
  maturityDate?: string; status: 'active' | 'matured' | 'divested'
  description: string; icon: string; memberReturn: number
}
type Announcement = {
  id: string; title: string; body: string; date: string; author: string
  priority: 'urgent' | 'high' | 'normal'
  category: 'financial' | 'governance' | 'social' | 'regulatory'
  read: boolean; pinned: boolean
}
type Document = {
  id: string; name: string; category: 'minutes' | 'financial' | 'policy' | 'legal'
  date: string; size: string; icon: string
}
type Member = {
  id: string; name: string; avatar: string
  role: 'Chairman' | 'Secretary' | 'Treasurer' | 'Member'
  since: string; tier: 'A' | 'B' | 'C'; contributions: number; streak: number
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const POLLS: Poll[] = [
  {
    id: 'V-001',
    title: 'Invest KES 500,000 in Acacia Ridge Apartments — Phase 2',
    description: 'The investment committee proposes allocating KES 500,000 from the pool into Phase 2 of Acacia Ridge Apartments in Ruaka. Projected annual return is 14.5% over a 3-year horizon, with quarterly rental distributions starting Q2 2026.',
    category: 'investment', deadline: 'Oct 20, 2025', daysLeft: 5,
    quorum: 80, totalVoters: 5, votesCast: 3,
    options: [
      { id: 'yes',   label: 'Approve Investment',    votes: 2 },
      { id: 'no',    label: 'Reject Investment',     votes: 1 },
      { id: 'defer', label: 'Defer — Need More Info', votes: 0 },
    ],
    userVote: null, status: 'open', urgent: true,
  },
  {
    id: 'V-002',
    title: 'Amend Constitution — Raise Max Loan Multiplier to 3× for Tier A',
    description: 'Proposed amendment to Section 14(b) to raise the maximum loan ceiling from 2× to 3× personal savings for Tier A members in good standing for 24+ consecutive months. Risk committee has reviewed and conditionally approved.',
    category: 'bylaw', deadline: 'Oct 28, 2025', daysLeft: 13,
    quorum: 80, totalVoters: 5, votesCast: 2,
    options: [
      { id: 'yes', label: 'Approve Amendment', votes: 2 },
      { id: 'no',  label: 'Reject Amendment',  votes: 0 },
    ],
    userVote: null, status: 'open', urgent: false,
  },
  {
    id: 'V-003',
    title: 'Elect Secretary for 2026 Term',
    description: 'The term of the current Secretary expires in December 2025. Nominations closed October 1. Members vote from two ratified nominees.',
    category: 'governance', deadline: 'Nov 5, 2025', daysLeft: 21,
    quorum: 100, totalVoters: 5, votesCast: 1,
    options: [
      { id: 'grace',  label: 'Grace Wanjiru Kamau',   votes: 1 },
      { id: 'peter',  label: 'Peter Ochieng Otieno',  votes: 0 },
    ],
    userVote: null, status: 'open', urgent: false,
  },
]

const MEETINGS: Meeting[] = [
  {
    id: 'M-001', title: 'October Monthly Meeting', type: 'regular',
    date: 'Sat, Oct 19, 2025', time: '10:00 AM – 12:30 PM',
    venue: 'Westlands Community Hall, Room 3B', virtual: true,
    agenda: [
      'Opening prayer & quorum confirmation',
      "Confirmation of September minutes",
      "Treasurer's report — Q3 financials",
      'Investment committee update: Acacia Ridge vote outcome',
      'Loan applications review (3 pending)',
      'Member welfare update',
      'AOB',
    ],
    rsvp: 'yes', attendees: 4, totalMembers: 5,
    notes: 'Zoom link will be shared 30 minutes before the meeting via WhatsApp.',
  },
  {
    id: 'M-002', title: 'Annual General Meeting 2025', type: 'agm',
    date: 'Sat, Dec 13, 2025', time: '9:00 AM – 4:00 PM',
    venue: 'Nairobi Serena Hotel — Simba Ballroom', virtual: false,
    agenda: [
      'Annual financial statements presentation',
      "Auditor's independent report",
      'Election of officials for 2026',
      'Investment portfolio review & 2026 strategy',
      'Dividend / surplus distribution vote',
      'Constitution amendment votes',
      'Gala dinner & awards',
    ],
    rsvp: null, attendees: 3, totalMembers: 5,
    notes: 'Dress code: Smart casual. RSVP by Nov 30. Partners welcome.',
  },
  {
    id: 'M-003', title: 'Emergency Investment Committee', type: 'emergency',
    date: 'Wed, Oct 23, 2025', time: '6:00 PM – 7:30 PM',
    venue: 'Zoom (link in WhatsApp)', virtual: true,
    agenda: [
      'Acacia Ridge Phase 2 due diligence Q&A with developer',
      'Final discussion ahead of Oct 20 voting deadline',
      'Risk mitigation options if vote fails',
    ],
    rsvp: null, attendees: 2, totalMembers: 5,
  },
]

const INVESTMENTS: Investment[] = [
  {
    id: 'I-001', name: 'Acacia Ridge Apartments — Phase 1',
    category: 'real_estate', amount: 300000, currentValue: 381000,
    returnPct: 27.0, startDate: 'Jan 2023', maturityDate: 'Jan 2026',
    status: 'active', icon: '🏗️',
    description: 'Off-plan residential units in Ruaka. Rental income flowing since Q2 2024.',
    memberReturn: 16200,
  },
  {
    id: 'I-002', name: 'Sanlam Money Market Fund',
    category: 'money_market', amount: 150000, currentValue: 164250,
    returnPct: 9.5, startDate: 'Mar 2024',
    status: 'active', icon: '📈',
    description: 'High-liquidity emergency reserve fund. 9.5% annualised, withdrawable in T+1.',
    memberReturn: 2850,
  },
  {
    id: 'I-003', name: 'Kenya Government Bonds (2-Year)',
    category: 'bonds', amount: 200000, currentValue: 221000,
    returnPct: 10.5, startDate: 'Jun 2023', maturityDate: 'Jun 2025',
    status: 'matured', icon: '🏛️',
    description: 'Matured government bonds. Principal + interest returned to pool June 2025.',
    memberReturn: 4200,
  },
  {
    id: 'I-004', name: 'Kipkaren Dairy Cooperative',
    category: 'agriculture', amount: 80000, currentValue: 74400,
    returnPct: -7.0, startDate: 'Aug 2022',
    status: 'active', icon: '🌾',
    description: 'Cooperative dairy venture. Temporarily impacted by drought. Recovery expected Q1 2026.',
    memberReturn: -1480,
  },
]

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'A-001', title: 'Q3 2025 Dividends — KES 2,400 Per Member',
    body: 'The board approved a KES 2,400 per-member dividend payout for Q3 2025. Disbursement to all members in good standing by November 15. Members with arrears will have amounts offset automatically.',
    date: 'Oct 10, 2025', author: 'Treasurer', priority: 'high',
    category: 'financial', read: false, pinned: true,
  },
  {
    id: 'A-002', title: 'Action Required — Enhanced KYC by Dec 31',
    body: 'The Central Bank of Kenya (Circular CBK/PG/28/2025) requires all SACCO members to complete enhanced KYC by December 31, 2025. Log in to the portal and upload a selfie with your National ID.',
    date: 'Sep 28, 2025', author: 'Secretary', priority: 'urgent',
    category: 'regulatory', read: false, pinned: true,
  },
  {
    id: 'A-003', title: 'Welfare — Thomas Oduya Hospitalised',
    body: 'Member Thomas Oduya was admitted to Aga Khan Hospital on Oct 8. The welfare committee requests a voluntary contribution of KES 1,000. Transfer to welfare M-Pesa till 765432.',
    date: 'Oct 9, 2025', author: 'Welfare Chair', priority: 'normal',
    category: 'social', read: true, pinned: false,
  },
  {
    id: 'A-004', title: 'AGM Venue Confirmed — Save the Date',
    body: 'The 2025 Annual General Meeting will be held at Nairobi Serena Hotel, December 13. Formal invitations by November 1. RSVP by November 30. Partners welcome.',
    date: 'Sep 15, 2025', author: 'Secretary', priority: 'normal',
    category: 'governance', read: true, pinned: false,
  },
]

const DOCUMENTS: Document[] = [
  { id: 'D-001', name: 'September 2025 — Meeting Minutes',     category: 'minutes',   date: 'Sep 22, 2025', size: '245 KB', icon: '📋' },
  { id: 'D-002', name: 'Q3 2025 — Financial Statements',       category: 'financial', date: 'Oct 5, 2025',  size: '1.2 MB', icon: '📊' },
  { id: 'D-003', name: 'Acacia Ridge Phase 2 — Due Diligence', category: 'financial', date: 'Oct 8, 2025',  size: '3.8 MB', icon: '🏗️' },
  { id: 'D-004', name: 'NAWIRI SACCO Constitution (Rev. 2024)',  category: 'legal',     date: 'Jan 1, 2024',  size: '890 KB', icon: '⚖️' },
  { id: 'D-005', name: 'August 2025 — Meeting Minutes',        category: 'minutes',   date: 'Aug 25, 2025', size: '198 KB', icon: '📋' },
  { id: 'D-006', name: 'Investment Policy Statement 2025',     category: 'policy',    date: 'Mar 12, 2025', size: '560 KB', icon: '📜' },
]

const MEMBERS: Member[] = [
  { id: 'M-01', name: 'Grace Wanjiru',  avatar: '👩🏾', role: 'Chairman',  since: 'Jan 2020', tier: 'A', contributions: 210000, streak: 12 },
  { id: 'M-02', name: 'Peter Ochieng',  avatar: '👨🏿', role: 'Secretary', since: 'Jan 2020', tier: 'B', contributions: 185000, streak: 9  },
  { id: 'M-03', name: 'Amina Hassan',   avatar: '👩🏽', role: 'Treasurer', since: 'Mar 2021', tier: 'A', contributions: 196000, streak: 12 },
  { id: 'M-04', name: 'David Kamau',    avatar: '👨🏾', role: 'Member',    since: 'Jul 2022', tier: 'B', contributions: 148500, streak: 7  },
  { id: 'M-05', name: 'Fatuma Wambua',  avatar: '👩🏿', role: 'Member',    since: 'Feb 2023', tier: 'C', contributions: 96000,  streak: 5  },
]

const ACTIVITY_LOG = [
  { icon: '💰', text: 'Amina Hassan deposited KES 8,000',           sub: 'Monthly contribution', time: '2 hrs ago',  color: 'bg-[#2d8c4e]/10 text-[#2d8c4e]' },
  { icon: '🗳️', text: 'Grace Wanjiru voted on Acacia Ridge Ph. 2',  sub: 'Investment vote',      time: '5 hrs ago',  color: 'bg-gold/10 text-gold' },
  { icon: '💳', text: 'Peter Ochieng applied for KES 50,000 loan',  sub: 'Awaiting committee',  time: 'Yesterday',  color: 'bg-terra/10 text-terra' },
  { icon: '📋', text: 'September minutes uploaded to vault',         sub: 'By Secretary',         time: '3 days ago', color: 'bg-forest/8 text-forest' },
  { icon: '✅', text: 'David Kamau repaid P2P loan P2P-1601',        sub: 'KES 3,105 — on time', time: '1 wk ago',   color: 'bg-[#2d8c4e]/10 text-[#2d8c4e]' },
  { icon: '📊', text: 'Q3 2025 financial statements published',      sub: 'By Treasurer',         time: '2 wks ago',  color: 'bg-forest/8 text-forest' },
]

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Meta maps                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const POLL_CAT: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  investment: { label: 'Investment', bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]', icon: '💼' },
  governance: { label: 'Governance', bg: 'bg-forest/8',     text: 'text-forest',    icon: '🏛️' },
  bylaw:      { label: 'Bylaw',      bg: 'bg-gold/12',      text: 'text-gold',      icon: '⚖️' },
  welfare:    { label: 'Welfare',    bg: 'bg-terra/10',     text: 'text-terra',     icon: '🤝' },
}
const MEET_TYPE: Record<string, { label: string; pill: string; calBg: string }> = {
  agm:       { label: 'AGM',       pill: 'bg-forest/10 text-forest',     calBg: 'bg-forest'  },
  regular:   { label: 'Regular',   pill: 'bg-[#2d8c4e]/10 text-[#2d8c4e]', calBg: 'bg-[#2d8c4e]' },
  special:   { label: 'Special',   pill: 'bg-gold/12 text-gold',         calBg: 'bg-gold'    },
  emergency: { label: 'Emergency', pill: 'bg-terra/10 text-terra',       calBg: 'bg-terra'   },
}
const INV_CAT: Record<string, { label: string; bg: string; text: string }> = {
  real_estate:  { label: 'Real Estate',  bg: 'bg-forest/10',    text: 'text-forest'    },
  money_market: { label: 'Money Market', bg: 'bg-[#2d8c4e]/10', text: 'text-[#2d8c4e]' },
  bonds:        { label: 'Bonds',        bg: 'bg-muted/10',     text: 'text-muted'     },
  agriculture:  { label: 'Agriculture',  bg: 'bg-gold/12',      text: 'text-gold'      },
  equity:       { label: 'Equity',       bg: 'bg-terra/10',     text: 'text-terra'     },
}
const ANN_PRI: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-terra/10',      text: 'text-terra'   },
  high:   { label: 'High',   bg: 'bg-gold/12',       text: 'text-gold'    },
  normal: { label: 'Normal', bg: 'bg-forest/8',      text: 'text-forest'  },
}
const ANN_CAT: Record<string, { icon: string; label: string }> = {
  financial:  { icon: '💰', label: 'Financial'  },
  governance: { icon: '🏛️', label: 'Governance' },
  social:     { icon: '🤝', label: 'Social'     },
  regulatory: { icon: '⚖️', label: 'Regulatory' },
}
const DOC_CAT: Record<string, { label: string; bg: string; text: string }> = {
  minutes:  { label: 'Minutes',  bg: 'bg-forest/8',      text: 'text-forest'    },
  financial:{ label: 'Financial',bg: 'bg-[#2d8c4e]/10',  text: 'text-[#2d8c4e]' },
  policy:   { label: 'Policy',   bg: 'bg-gold/12',       text: 'text-gold'      },
  legal:    { label: 'Legal',    bg: 'bg-terra/10',      text: 'text-terra'     },
}
const TIER_PILL: Record<string, string> = {
  A: 'bg-[#2d8c4e] text-white',
  B: 'bg-gold text-white',
  C: 'bg-terra text-white',
}
const ROLE_PILL: Record<string, string> = {
  Chairman:  'bg-forest/10 text-forest',
  Secretary: 'bg-gold/12 text-gold',
  Treasurer: 'bg-terra/10 text-terra',
  Member:    'bg-muted/8 text-muted',
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Shared micro-components                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
function Bar({ pct, color = 'bg-forest', h = 'h-1.5' }: { pct: number; color?: string; h?: string }) {
  return (
    <div className={`${h} rounded-full bg-black/[0.06] overflow-hidden w-full`}>
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-forest/[0.06] flex items-center justify-between gap-3">
      <div>
        <h4 className="font-bold text-forest text-[14px] leading-none">{title}</h4>
        {sub && <p className="text-[11px] text-muted mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

function Pill({ label, bg, text, dot }: { label: string; bg: string; text: string; dot?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Vote Modal                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function VoteModal({ poll, onClose, onVote }: {
  poll: Poll; onClose: () => void
  onVote: (pollId: string, optionId: string) => void
}) {
  const [sel, setSel]   = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const cat = POLL_CAT[poll.category]
  const total = poll.options.reduce((s, o) => s + o.votes, 0)

  const submit = () => { if (!sel) return; onVote(poll.id, sel); setDone(true) }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-forest/[0.07] flex-shrink-0 bg-cream/40 rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <Pill label={cat.label} bg={cat.bg} text={cat.text} />
                {poll.urgent && <Pill label="Urgent" bg="bg-terra/10" text="text-terra" dot="bg-terra animate-pulse" />}
              </div>
              <h3 className="font-playfair text-[16px] font-black text-forest leading-snug">{poll.title}</h3>
              <p className="text-[11px] text-muted mt-1">Closes {poll.deadline} · {poll.daysLeft} days left</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-forest/10 flex items-center justify-center text-muted hover:text-forest transition-colors flex-shrink-0 text-sm">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[#2d8c4e]/10 flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
              <h4 className="font-playfair text-[20px] font-black text-forest mb-2">Vote Recorded</h4>
              <p className="text-[12px] text-muted leading-relaxed max-w-xs mx-auto">Your vote is encrypted and cannot be changed. Results will be published after the deadline.</p>
              <button onClick={onClose} className="mt-6 bg-forest text-white font-bold text-[13px] px-8 py-3 rounded-xl hover:bg-forest/90 transition-colors">Done</button>
            </div>
          ) : (
            <>
              {/* Context */}
              <div className="bg-cream/60 rounded-xl p-4 border border-forest/[0.06]">
                <p className="text-[12px] text-muted leading-relaxed">{poll.description}</p>
              </div>

              {/* Quorum */}
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-muted">{poll.votesCast} of {poll.totalVoters} members voted</span>
                  <span className="font-bold text-forest">{Math.round((poll.votesCast/poll.totalVoters)*100)}% · needs {poll.quorum}%</span>
                </div>
                <Bar pct={(poll.votesCast/poll.totalVoters)*100} color={(poll.votesCast/poll.totalVoters)*100 >= poll.quorum ? 'bg-[#2d8c4e]' : 'bg-gold'} h="h-2" />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Select your vote</p>
                {poll.options.map(opt => (
                  <button key={opt.id} onClick={() => setSel(opt.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group ${
                      sel === opt.id ? 'border-forest bg-forest/[0.04]' : 'border-forest/10 hover:border-forest/25 bg-cream/30'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                      sel === opt.id ? 'border-forest bg-forest' : 'border-muted/30 group-hover:border-forest/40'
                    }`} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-forest">{opt.label}</p>
                      <p className="text-[10px] text-muted">{opt.votes} vote{opt.votes !== 1 ? 's' : ''} so far</p>
                    </div>
                    {total > 0 && <span className="text-[11px] font-bold text-muted/60">{Math.round((opt.votes/total)*100)}%</span>}
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="flex gap-3 bg-gold/[0.06] border border-gold/20 rounded-xl p-3.5">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-[11px] text-muted leading-relaxed">Your vote is anonymous and encrypted. Once submitted it cannot be changed or retracted.</p>
              </div>

              <button onClick={submit} disabled={!sel}
                className="w-full py-3.5 bg-forest text-white font-bold text-[13px] rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                Submit Vote →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RSVP Modal                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function RSVPModal({ meeting, onClose, onRsvp }: {
  meeting: Meeting; onClose: () => void
  onRsvp: (id: string, v: 'yes' | 'no' | 'maybe') => void
}) {
  const mt = MEET_TYPE[meeting.type]
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-forest/[0.07] bg-cream/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill label={mt.label} bg={mt.pill.split(' ')[0]} text={mt.pill.split(' ')[1]} />
              <h3 className="font-playfair text-[17px] font-black text-forest mt-2 leading-tight">{meeting.title}</h3>
              <p className="text-[12px] text-muted mt-0.5">{meeting.date}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-forest/10 flex items-center justify-center text-muted hover:text-forest transition-colors text-sm">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-cream/60 rounded-xl border border-forest/[0.06] divide-y divide-forest/[0.05]">
            {[
              { icon: '🕙', label: 'Time',   val: meeting.time },
              { icon: '📍', label: 'Venue',  val: meeting.venue },
              { icon: meeting.virtual ? '💻' : '🏢', label: 'Format', val: meeting.virtual ? 'Hybrid — in-person & Zoom' : 'In-person only' },
              { icon: '👥', label: 'Confirmed', val: `${meeting.attendees} of ${meeting.totalMembers} members` },
            ].map(d => (
              <div key={d.label} className="flex gap-3 items-center px-4 py-3">
                <span className="text-base flex-shrink-0">{d.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted font-medium">{d.label}</p>
                  <p className="text-[12px] font-semibold text-forest">{d.val}</p>
                </div>
              </div>
            ))}
          </div>
          {meeting.notes && (
            <div className="flex gap-2.5 bg-gold/[0.06] border border-gold/20 rounded-xl p-3.5">
              <span>💡</span>
              <p className="text-[11px] text-muted">{meeting.notes}</p>
            </div>
          )}
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Will you attend?</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: 'yes'   as const, label: '✓ Going',  cls: 'bg-[#2d8c4e] text-white hover:bg-[#2d8c4e]/90' },
              { val: 'maybe' as const, label: '? Maybe',  cls: 'bg-gold text-white hover:bg-gold/90' },
              { val: 'no'    as const, label: '✕ No',     cls: 'bg-cream border border-forest/15 text-forest hover:border-forest/30' },
            ].map(o => (
              <button key={o.val} onClick={() => { onRsvp(meeting.id, o.val); onClose() }}
                className={`py-3.5 font-bold text-[13px] rounded-xl transition-all ${o.cls}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Page                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function SaccoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [activeTab,    setActiveTab]    = useState<'feed'|'votes'|'meetings'|'investments'|'members'|'documents'>('feed')
  const [polls,        setPolls]        = useState<Poll[]>(POLLS)
  const [meetings,     setMeetings]     = useState<Meeting[]>(MEETINGS)
  const [announcements,setAnnouncements]= useState<Announcement[]>(ANNOUNCEMENTS)
  const [activePoll,   setActivePoll]   = useState<Poll | null>(null)
  const [activeMeet,   setActiveMeet]   = useState<Meeting | null>(null)
  const [docFilter,    setDocFilter]    = useState<string>('all')
  const [expandedAnn,  setExpandedAnn]  = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#ede8de]">
      <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
    </div>
  )

  /* Handlers */
  const handleVote = (id: string, opt: string) =>
    setPolls(p => p.map(x => x.id !== id ? x : {
      ...x, userVote: opt, votesCast: x.votesCast + 1,
      options: x.options.map(o => o.id === opt ? { ...o, votes: o.votes + 1 } : o),
    }))

  const handleRsvp = (id: string, rsvp: 'yes'|'no'|'maybe') =>
    setMeetings(m => m.map(x => x.id === id ? { ...x, rsvp } : x))

  const markRead = (id: string) =>
    setAnnouncements(a => a.map(x => x.id === id ? { ...x, read: true } : x))

  /* Derived */
  const openPolls    = polls.filter(p => p.status === 'open')
  const pendingVotes = openPolls.filter(p => !p.userVote).length
  const unreadAnn    = announcements.filter(a => !a.read).length
  const needsRsvp    = meetings.filter(m => m.rsvp === null).length
  const portfolio    = INVESTMENTS.filter(i => i.status === 'active').reduce((s, i) => s + i.currentValue, 0)
  const totalGain    = INVESTMENTS.reduce((s, i) => s + (i.currentValue - i.amount), 0)
  const totalPool    = MEMBERS.reduce((s, m) => s + m.contributions, 0)
  const maxContrib   = Math.max(...MEMBERS.map(m => m.contributions))
  const filteredDocs = docFilter === 'all' ? DOCUMENTS : DOCUMENTS.filter(d => d.category === docFilter)

  const TABS = [
    { id: 'feed',        label: 'Activity',    badge: unreadAnn + needsRsvp },
    { id: 'votes',       label: 'Votes',       badge: pendingVotes },
    { id: 'meetings',    label: 'Meetings',    badge: needsRsvp },
    { id: 'investments', label: 'Investments', badge: 0 },
    { id: 'members',     label: 'Members',     badge: 0 },
    { id: 'documents',   label: 'Documents',   badge: 0 },
  ] as const

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DashboardShell>
      {activePoll && <VoteModal poll={activePoll} onClose={() => setActivePoll(null)} onVote={handleVote} />}
      {activeMeet && <RSVPModal meeting={activeMeet} onClose={() => setActiveMeet(null)} onRsvp={handleRsvp} />}

      <div className="w-full space-y-5">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#1a3c2b 0%,#1e4a32 55%,#162f22 100%)' }}>
          {/* Decorative layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(200,153,42,0.12) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(45,140,78,0.10) 0%, transparent 70%)' }} />
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.018]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(255,255,255,1) 27px,rgba(255,255,255,1) 28px),repeating-linear-gradient(90deg,transparent,transparent 27px,rgba(255,255,255,1) 27px,rgba(255,255,255,1) 28px)' }} />
          </div>

          <div className="relative px-6 sm:px-8 py-7">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: SACCO identity */}
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Your SACCO</p>
                <h1 className="font-playfair text-[28px] sm:text-[38px] font-black text-white leading-none tracking-tight">
                  {user.sacco}
                </h1>
                <p className="text-white/40 text-[12px] mt-1.5">
                  {MEMBERS.length} members · Est. 2020 · Member since {user.memberSince}
                </p>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {pendingVotes > 0 && (
                    <button onClick={() => setActiveTab('votes')}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-terra text-white px-3 py-1.5 rounded-full hover:bg-terra/90 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {pendingVotes} vote{pendingVotes > 1 ? 's' : ''} pending
                    </button>
                  )}
                  {needsRsvp > 0 && (
                    <button onClick={() => setActiveTab('meetings')}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 text-white/75 px-3 py-1.5 rounded-full hover:bg-white/15 transition-colors">
                      📅 {needsRsvp} meeting RSVP needed
                    </button>
                  )}
                  {unreadAnn > 0 && (
                    <button onClick={() => setActiveTab('feed')}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-gold/20 text-gold px-3 py-1.5 rounded-full hover:bg-gold/30 transition-colors">
                      🔔 {unreadAnn} unread
                    </button>
                  )}
                </div>
              </div>

              {/* Right: snapshot stats */}
              <div className="flex gap-6 sm:gap-10">
                <div>
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.15em] font-medium mb-1">Pool Total</p>
                  <p className="font-playfair text-[26px] sm:text-[30px] font-black text-white leading-none">
                    KES {(totalPool/1000).toFixed(0)}k
                  </p>
                  <p className="text-[#2d8c4e] text-[11px] font-semibold mt-1">↑ +KES 8k this month</p>
                </div>
                <div className="border-l border-white/10 pl-6 sm:pl-10">
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.15em] font-medium mb-1">Portfolio</p>
                  <p className="font-playfair text-[26px] sm:text-[30px] font-black text-white leading-none">
                    KES {(portfolio/1000).toFixed(0)}k
                  </p>
                  <p className="text-[#2d8c4e] text-[11px] font-semibold mt-1">
                    ↑ +KES {(totalGain/1000).toFixed(1)}k gain
                  </p>
                </div>
                <div className="border-l border-white/10 pl-6 sm:pl-10 hidden sm:block">
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.15em] font-medium mb-1">Health Score</p>
                  <p className="font-playfair text-[26px] sm:text-[30px] font-black text-white leading-none">92%</p>
                  <p className="text-white/40 text-[11px] mt-1">repayment rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ TABS ══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-1.5 border border-black/[0.05] shadow-sm flex gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`relative flex-1 min-w-max py-2.5 px-3.5 rounded-xl text-[12px] font-semibold transition-all duration-200 ${
                activeTab === t.id ? 'bg-forest text-white shadow-sm' : 'text-muted hover:text-forest'
              }`}>
              {t.label}
              {t.badge > 0 && (
                <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? 'bg-white/20 text-white' : 'bg-terra text-white'
                }`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: FEED                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'feed' && (
          <div className="space-y-5">

            {/* Action items row */}
            {(pendingVotes > 0 || needsRsvp > 0) && (
              <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                <SectionHeader title="Action Required" sub="Items needing your attention"
                  right={<span className="w-2 h-2 rounded-full bg-terra animate-pulse" />} />
                <div className="divide-y divide-forest/[0.05]">
                  {polls.filter(p => p.status === 'open' && !p.userVote).slice(0,2).map(p => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/40 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-terra/10 flex items-center justify-center text-lg flex-shrink-0">🗳️</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-forest line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">Closes {p.deadline} · {p.daysLeft} days left</p>
                      </div>
                      <button onClick={() => setActivePoll(p)}
                        className="flex-shrink-0 text-[11px] font-bold bg-forest text-white px-3.5 py-2 rounded-xl hover:bg-forest/90 transition-colors">
                        Vote
                      </button>
                    </div>
                  ))}
                  {meetings.filter(m => m.rsvp === null).slice(0,2).map(m => (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/40 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-lg flex-shrink-0">📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-forest line-clamp-1">{m.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">{m.date} · RSVP needed</p>
                      </div>
                      <button onClick={() => setActiveMeet(m)}
                        className="flex-shrink-0 text-[11px] font-bold bg-gold text-white px-3.5 py-2 rounded-xl hover:bg-gold/90 transition-colors">
                        RSVP
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two-column layout on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Announcements — takes 2/3 */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                <SectionHeader title="Announcements" sub={unreadAnn > 0 ? `${unreadAnn} unread` : 'All caught up ✓'} />
                <div className="divide-y divide-forest/[0.05]">
                  {announcements.map(ann => {
                    const pri = ANN_PRI[ann.priority]
                    const cat = ANN_CAT[ann.category]
                    const expanded = expandedAnn === ann.id
                    return (
                      <div key={ann.id}
                        className={`px-5 py-4 transition-colors cursor-pointer ${!ann.read ? 'bg-cream/25' : 'hover:bg-cream/40'}`}
                        onClick={() => { markRead(ann.id); setExpandedAnn(expanded ? null : ann.id) }}>
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                            ann.read ? 'bg-cream' : 'bg-[#2d8c4e]/8'
                          }`}>{cat.icon}</div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              {!ann.read && <span className="w-2 h-2 rounded-full bg-[#2d8c4e] flex-shrink-0 mt-1.5" />}
                              <p className={`text-[13px] font-bold text-forest leading-snug ${ann.read ? 'opacity-75' : ''}`}>
                                {ann.pinned && <span className="text-[11px] mr-1">📌</span>}{ann.title}
                              </p>
                            </div>
                            <p className={`text-[11px] text-muted leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{ann.body}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Pill label={pri.label} bg={pri.bg} text={pri.text} />
                              <Pill label={cat.label} bg="bg-forest/6" text="text-forest" />
                              <span className="text-[10px] text-muted ml-auto">{ann.date} · {ann.author}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right column: activity + quick stats */}
              <div className="space-y-5">
                {/* Quick group stats */}
                <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                  <SectionHeader title="Group at a Glance" />
                  <div className="p-4 space-y-3">
                    {[
                      { label: 'Pool Total',     val: `KES ${(totalPool/1000).toFixed(0)}k`,    color: 'text-forest'    },
                      { label: 'Active Votes',   val: `${openPolls.length} open`,               color: 'text-terra'     },
                      { label: 'Repayment Rate', val: '92%',                                    color: 'text-[#2d8c4e]' },
                      { label: 'Next Meeting',   val: MEETINGS[0].date.split(',')[1]?.trim(),   color: 'text-gold'      },
                      { label: 'Dividend ETA',   val: 'Nov 15, 2025',                           color: 'text-forest'    },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-forest/[0.04] last:border-0">
                        <span className="text-[11px] text-muted">{s.label}</span>
                        <span className={`text-[12px] font-bold ${s.color}`}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity log */}
                <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
                  <SectionHeader title="Recent Activity" />
                  <div className="divide-y divide-forest/[0.05]">
                    {ACTIVITY_LOG.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream/40 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${item.color}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11.5px] font-semibold text-forest line-clamp-1">{item.text}</p>
                          <p className="text-[9px] text-muted">{item.sub} · {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: VOTES                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'votes' && (
          <div className="space-y-5">
            {/* Open polls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {openPolls.map(poll => {
                const cat        = POLL_CAT[poll.category]
                const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0)
                const quorumPct  = (poll.votesCast / poll.totalVoters) * 100
                const voted      = !!poll.userVote
                return (
                  <div key={poll.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                      poll.urgent ? 'border-terra/25' : 'border-black/[0.05]'
                    }`}>
                    {/* Urgent strip */}
                    {poll.urgent && (
                      <div className="bg-terra/8 border-b border-terra/15 px-5 py-2 flex items-center gap-2">
                        <span className="text-[11px]">⚠️</span>
                        <span className="text-[10px] font-bold text-terra">
                          Closes in {poll.daysLeft} days — your vote is needed for quorum
                        </span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col gap-4">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <Pill label={cat.label} bg={cat.bg} text={cat.text} />
                            {voted && <Pill label="✓ Voted" bg="bg-[#2d8c4e]/10" text="text-[#2d8c4e]" />}
                          </div>
                          <h4 className="font-playfair text-[15px] font-black text-forest leading-snug">{poll.title}</h4>
                          <p className="text-[11px] text-muted mt-1.5 line-clamp-2 leading-relaxed">{poll.description}</p>
                        </div>
                        {/* Days countdown */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${
                          poll.daysLeft <= 5 ? 'border-terra/30 bg-terra/5' : 'border-forest/10 bg-cream/60'
                        }`}>
                          <span className={`font-mono text-[20px] font-black leading-none ${poll.daysLeft <= 5 ? 'text-terra' : 'text-forest'}`}>{poll.daysLeft}</span>
                          <span className="text-[8px] text-muted font-medium">days</span>
                        </div>
                      </div>

                      {/* Quorum progress */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-1.5">
                          <span className="text-muted">{poll.votesCast}/{poll.totalVoters} voted</span>
                          <span className={`font-bold ${quorumPct >= poll.quorum ? 'text-[#2d8c4e]' : 'text-gold'}`}>
                            {quorumPct.toFixed(0)}% · need {poll.quorum}%
                          </span>
                        </div>
                        <Bar pct={quorumPct} color={quorumPct >= poll.quorum ? 'bg-[#2d8c4e]' : 'bg-gold'} h="h-1.5" />
                      </div>

                      {/* Options — results if voted, tease if not */}
                      <div className="space-y-2">
                        {poll.options.map(opt => {
                          const pct = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0
                          const isChosen = poll.userVote === opt.id
                          return (
                            <div key={opt.id}
                              className={`rounded-xl p-3 border ${isChosen ? 'bg-forest/[0.04] border-forest/25' : 'bg-cream/50 border-forest/[0.05]'}`}>
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                  {isChosen && <span className="text-forest text-[10px] font-bold">✓</span>}
                                  <span className="text-[12px] font-semibold text-forest">{opt.label}</span>
                                </div>
                                <span className="text-[11px] font-bold text-muted">
                                  {voted ? `${pct.toFixed(0)}%` : `${opt.votes} votes`}
                                </span>
                              </div>
                              {voted && <Bar pct={pct} color={isChosen ? 'bg-forest' : 'bg-forest/25'} h="h-1" />}
                            </div>
                          )
                        })}
                      </div>

                      {/* CTA */}
                      <div className="mt-auto">
                        {!voted ? (
                          <button onClick={() => setActivePoll(poll)}
                            className="w-full py-3 bg-forest text-white font-bold text-[13px] rounded-xl hover:bg-forest/90 transition-colors">
                            Cast Your Vote →
                          </button>
                        ) : (
                          <p className="text-center text-[11px] text-muted py-2">
                            Results published after {poll.deadline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Vote history table */}
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
              <SectionHeader title="Voting History" sub="Closed & decided motions" />
              <div className="divide-y divide-forest/[0.05]">
                {[
                  { title: 'Approve 2024 Audited Financial Statements', result: 'Passed',   date: 'Sep 5, 2025',  turnout: '5/5', myVote: 'Yes' },
                  { title: 'Invest in Sanlam Money Market Fund',        result: 'Passed',   date: 'Mar 12, 2025', turnout: '4/5', myVote: 'Yes' },
                  { title: 'Raise Monthly Contribution to KES 8,000',   result: 'Passed',   date: 'Jan 8, 2025',  turnout: '5/5', myVote: 'Yes' },
                  { title: 'Disinvest from Equity REIT Pool',           result: 'Rejected', date: 'Nov 20, 2024', turnout: '5/5', myVote: 'No' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/40 transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      v.result === 'Passed' ? 'bg-[#2d8c4e]/10 text-[#2d8c4e]' : 'bg-terra/10 text-terra'
                    }`}>{v.result === 'Passed' ? '✓' : '✕'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-forest line-clamp-1">{v.title}</p>
                      <p className="text-[10px] text-muted">{v.date} · {v.turnout} voted · your vote: <span className="font-bold">{v.myVote}</span></p>
                    </div>
                    <Pill label={v.result}
                      bg={v.result === 'Passed' ? 'bg-[#2d8c4e]/10' : 'bg-terra/10'}
                      text={v.result === 'Passed' ? 'text-[#2d8c4e]' : 'text-terra'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: MEETINGS                                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            {meetings.map(m => {
              const mt = MEET_TYPE[m.type]
              const rsvpMeta: Record<string, string> = {
                yes:   'bg-[#2d8c4e]/10 text-[#2d8c4e]',
                no:    'bg-terra/10 text-terra',
                maybe: 'bg-gold/12 text-gold',
              }
              const rsvpLabel: Record<string, string> = { yes: '✓ Going', no: '✕ Not going', maybe: '? Maybe' }

              return (
                <div key={m.id} className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className={`px-5 py-4 border-b border-forest/[0.06] flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between ${
                    m.type === 'emergency' ? 'bg-terra/[0.04]' : 'bg-cream/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      {/* Calendar icon */}
                      <div className={`w-14 h-14 rounded-2xl ${mt.calBg} flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                        <span className="text-[10px] font-bold uppercase opacity-70 leading-none">
                          {m.date.split(' ')[1]?.slice(0,3)}
                        </span>
                        <span className="text-[22px] font-black leading-tight">
                          {m.date.split(' ')[2]?.replace(',','')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-bold text-forest text-[14px]">{m.title}</h4>
                          <Pill label={mt.label} bg={mt.pill.split(' ')[0]} text={mt.pill.split(' ')[1]} />
                        </div>
                        <p className="text-[11px] text-muted">{m.date} · {m.time}</p>
                      </div>
                    </div>

                    {/* RSVP controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.rsvp ? (
                        <>
                          <span className={`text-[11px] font-bold px-3 py-1.5 rounded-xl ${rsvpMeta[m.rsvp]}`}>
                            {rsvpLabel[m.rsvp]}
                          </span>
                          <button onClick={() => setActiveMeet(m)}
                            className="text-[11px] font-semibold text-muted hover:text-forest transition-colors border border-forest/15 px-3 py-1.5 rounded-xl hover:border-forest/30">
                            Change
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setActiveMeet(m)}
                          className="text-[12px] font-bold bg-forest text-white px-5 py-2.5 rounded-xl hover:bg-forest/90 transition-colors">
                          RSVP Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meeting body */}
                  <div className="p-5">
                    {/* Meta row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                      {[
                        { icon: '📍', label: 'Venue',    val: m.venue },
                        { icon: m.virtual ? '💻' : '🏢', label: 'Format', val: m.virtual ? 'Hybrid (in-person + Zoom)' : 'In-person only' },
                        { icon: '👥', label: 'Attending', val: `${m.attendees}/${m.totalMembers} confirmed` },
                      ].map(d => (
                        <div key={d.label} className="flex gap-3 items-start bg-cream/40 rounded-xl px-3.5 py-3 border border-forest/[0.04]">
                          <span className="text-lg flex-shrink-0 mt-0.5">{d.icon}</span>
                          <div>
                            <p className="text-[10px] text-muted font-medium">{d.label}</p>
                            <p className="text-[12px] font-semibold text-forest">{d.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agenda */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Agenda</p>
                      <ol className="space-y-2">
                        {m.agenda.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-forest/8 text-forest flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-[12px] text-forest/75 leading-normal">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Notes */}
                    {m.notes && (
                      <div className="flex gap-2.5 bg-gold/[0.06] border border-gold/20 rounded-xl p-3.5 mb-4">
                        <span className="flex-shrink-0">💡</span>
                        <p className="text-[11px] text-muted leading-relaxed">{m.notes}</p>
                      </div>
                    )}

                    {/* Attendance bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-muted mb-1.5">
                        <span>Attendance confirmation</span>
                        <span className="font-bold text-forest">{m.attendees}/{m.totalMembers}</span>
                      </div>
                      <Bar pct={(m.attendees / m.totalMembers) * 100} h="h-1.5" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: INVESTMENTS                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'investments' && (
          <div className="space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Portfolio Value',   val: `KES ${(portfolio/1000).toFixed(0)}k`,                               icon: '📊', color: 'text-forest'    },
                { label: 'Total Gain',        val: `+KES ${(totalGain/1000).toFixed(1)}k`,                              icon: '📈', color: 'text-[#2d8c4e]' },
                { label: 'Active Positions',  val: `${INVESTMENTS.filter(i=>i.status==='active').length}`,               icon: '💼', color: 'text-gold'      },
                { label: 'Your Share (est.)', val: `KES ${(portfolio/MEMBERS.length/1000).toFixed(1)}k`,                icon: '👤', color: 'text-forest'    },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[17px] sm:text-[19px] font-black mt-2 leading-tight ${s.color}`}>{s.val}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Portfolio allocation bar */}
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm p-5">
              <h4 className="font-bold text-forest text-[14px] mb-4">Portfolio Allocation</h4>
              <div className="flex h-3 rounded-full overflow-hidden mb-3">
                {[
                  { pct: 48, color: 'bg-forest'    },
                  { pct: 26, color: 'bg-[#2d8c4e]' },
                  { pct: 15, color: 'bg-gold'      },
                  { pct: 11, color: 'bg-muted/60'  },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} h-full`} style={{ width: `${s.pct}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Real Estate', pct: 48, val: 'KES 381k', color: 'bg-forest'    },
                  { label: 'Money Market',pct: 26, val: 'KES 164k', color: 'bg-[#2d8c4e]' },
                  { label: 'Agriculture', pct: 15, val: 'KES 74k',  color: 'bg-gold'      },
                  { label: 'Bonds (idle)',pct: 11, val: 'KES 68k',  color: 'bg-muted/60'  },
                ].map(a => (
                  <div key={a.label} className="flex items-start gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${a.color}`} />
                    <div>
                      <p className="text-[11px] font-semibold text-forest">{a.label}</p>
                      <p className="text-[10px] text-muted">{a.val} · {a.pct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INVESTMENTS.map(inv => {
                const cat   = INV_CAT[inv.category]
                const gain  = inv.currentValue - inv.amount
                const isPos = inv.returnPct >= 0
                return (
                  <div key={inv.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                      inv.status === 'matured' ? 'border-black/[0.04] opacity-65' : 'border-black/[0.05]'
                    }`}>
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl flex-shrink-0">
                          {inv.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <Pill label={cat.label} bg={cat.bg} text={cat.text} />
                            <Pill
                              label={inv.status === 'active' ? 'Active' : inv.status === 'matured' ? 'Matured' : 'Divested'}
                              bg={inv.status === 'active' ? 'bg-[#2d8c4e]/10' : 'bg-muted/10'}
                              text={inv.status === 'active' ? 'text-[#2d8c4e]' : 'text-muted'} />
                          </div>
                          <h4 className="font-bold text-forest text-[13px] leading-tight">{inv.name}</h4>
                        </div>
                        {/* Return badge */}
                        <div className={`flex-shrink-0 text-right px-2.5 py-1.5 rounded-xl ${isPos ? 'bg-[#2d8c4e]/8' : 'bg-terra/8'}`}>
                          <p className={`font-playfair text-[18px] font-black leading-none ${isPos ? 'text-[#2d8c4e]' : 'text-terra'}`}>
                            {isPos ? '+' : ''}{inv.returnPct}%
                          </p>
                          <p className="text-[9px] text-muted">return</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted leading-relaxed mb-4">{inv.description}</p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Invested',  val: `KES ${(inv.amount/1000).toFixed(0)}k` },
                          { label: 'Value Now', val: `KES ${(inv.currentValue/1000).toFixed(0)}k` },
                          { label: 'Gain/Loss', val: `${isPos?'+':''}KES ${(Math.abs(gain)/1000).toFixed(1)}k` },
                        ].map(d => (
                          <div key={d.label} className="bg-cream/60 rounded-xl p-2.5 border border-forest/[0.04] text-center">
                            <p className="text-[9px] text-muted font-medium">{d.label}</p>
                            <p className="text-[12px] font-bold text-forest mt-0.5">{d.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Progress bar representing gain magnitude */}
                      <Bar pct={Math.min(Math.abs(inv.returnPct) / 30 * 100, 100)} color={isPos ? 'bg-[#2d8c4e]' : 'bg-terra'} h="h-1" />

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-forest/[0.05]">
                        <div>
                          <p className="text-[9px] text-muted">Started {inv.startDate}{inv.maturityDate ? ` · matures ${inv.maturityDate}` : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted">Your share</p>
                          <p className={`text-[12px] font-bold ${inv.memberReturn >= 0 ? 'text-[#2d8c4e]' : 'text-terra'}`}>
                            {inv.memberReturn >= 0 ? '+' : ''}KES {inv.memberReturn.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Upcoming: Phase 2 proposal */}
            <div className="rounded-2xl overflow-hidden border border-gold/25 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#1e4530 0%,#1a3c2b 100%)' }}>
              <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 85% 50%, rgba(200,153,42,0.14) 0%, transparent 55%)' }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill label="Proposed" bg="bg-gold/20" text="text-gold" />
                    <Pill label="Vote Open" bg="bg-terra/80" text="text-white" dot="bg-white animate-pulse" />
                  </div>
                  <h4 className="font-playfair text-[18px] font-black text-white leading-tight">
                    Acacia Ridge Phase 2 — KES 500,000
                  </h4>
                  <p className="text-white/50 text-[11px] mt-1">Projected 14.5% p.a. · 3-year horizon · Vote closes Oct 20</p>
                </div>
                <button onClick={() => { setActiveTab('votes'); setActivePoll(polls[0]) }}
                  className="relative flex-shrink-0 bg-gold text-white font-bold text-[12px] px-5 py-3 rounded-xl hover:bg-gold/90 transition-colors">
                  View & Vote →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: MEMBERS                                                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'members' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Members',    val: `${MEMBERS.length}`,                             icon: '👥', col: 'text-forest'    },
                { label: 'Combined Savings', val: `KES ${(totalPool/1000).toFixed(0)}k`,           icon: '💰', col: 'text-[#2d8c4e]' },
                { label: 'Avg. Streak',      val: `${Math.round(MEMBERS.reduce((s,m)=>s+m.streak,0)/MEMBERS.length)} mo`, icon: '🔥', col: 'text-gold'      },
                { label: 'Active Since',     val: '2020',                                          icon: '📅', col: 'text-forest'    },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-black/[0.05] shadow-sm">
                  <span className="text-xl">{s.icon}</span>
                  <p className={`font-playfair text-[17px] sm:text-[19px] font-black mt-2 ${s.col}`}>{s.val}</p>
                  <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Member cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MEMBERS.map(member => (
                <div key={member.id}
                  className="bg-white rounded-2xl border border-black/[0.05] shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  {/* Top row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl">
                        {member.avatar}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${TIER_PILL[member.tier]}`}>
                        {member.tier}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-forest text-[14px] leading-tight">{member.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_PILL[member.role]}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-cream/60 rounded-xl p-2.5 border border-forest/[0.04]">
                      <p className="text-[9px] text-muted font-medium">Contributions</p>
                      <p className="text-[13px] font-bold text-forest mt-0.5">KES {(member.contributions/1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-cream/60 rounded-xl p-2.5 border border-forest/[0.04]">
                      <p className="text-[9px] text-muted font-medium">Streak</p>
                      <p className="text-[13px] font-bold text-gold mt-0.5">🔥 {member.streak} months</p>
                    </div>
                  </div>

                  {/* Contribution share bar */}
                  <div>
                    <div className="flex justify-between text-[9px] text-muted mb-1">
                      <span>Contribution share</span>
                      <span className="font-bold">{Math.round((member.contributions/totalPool)*100)}%</span>
                    </div>
                    <Bar pct={(member.contributions/maxContrib)*100} color="bg-forest" h="h-1" />
                  </div>

                  <p className="text-[10px] text-muted mt-3">Member since {member.since}</p>
                </div>
              ))}
            </div>

            {/* Officials banner */}
            <div className="rounded-2xl overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg,#1a3c2b 0%,#1e4530 100%)' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(200,153,42,0.10) 0%, transparent 55%)' }} />
              <div className="relative p-6">
                <h4 className="font-bold text-white text-[14px] mb-4 flex items-center gap-2">
                  <span className="text-gold">✦</span> Group Officials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MEMBERS.filter(m => m.role !== 'Member').map(m => (
                    <div key={m.id} className="bg-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/15 transition-colors">
                      <span className="text-2xl">{m.avatar}</span>
                      <div>
                        <p className="text-[13px] font-bold text-white leading-tight">{m.name}</p>
                        <p className="text-[10px] text-white/45">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB: DOCUMENTS                                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'documents' && (
          <div className="space-y-5">
            {/* Filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {['all','minutes','financial','policy','legal'].map(f => (
                <button key={f} onClick={() => setDocFilter(f)}
                  className={`text-[11px] font-semibold px-3.5 py-2 rounded-xl transition-all ${
                    docFilter === f
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-white border border-black/[0.06] text-muted hover:text-forest hover:border-forest/20'
                  }`}>
                  {f === 'all' ? 'All Documents' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Document vault */}
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-sm overflow-hidden">
              <SectionHeader
                title="Document Vault"
                sub={`${filteredDocs.length} document${filteredDocs.length !== 1 ? 's' : ''}`}
                right={
                  <button className="text-[11px] font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/5 transition-colors">
                    Upload
                  </button>
                }
              />
              <div className="divide-y divide-forest/[0.05]">
                {filteredDocs.map(doc => {
                  const cat = DOC_CAT[doc.category] ?? DOC_CAT.minutes
                  return (
                    <div key={doc.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-cream/40 transition-colors group cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">
                        {doc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-forest">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Pill label={cat.label} bg={cat.bg} text={cat.text} />
                          <span className="text-[10px] text-muted">{doc.date} · {doc.size}</span>
                        </div>
                      </div>
                      {/* Download — reveal on hover */}
                      <button className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-forest bg-cream border border-forest/15 px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:border-forest/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                        </svg>
                        Download
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upload drop zone */}
            <button className="w-full py-8 border-2 border-dashed border-forest/20 rounded-2xl flex flex-col items-center gap-2 hover:border-forest/40 hover:bg-white/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-forest/8 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📎
              </div>
              <p className="text-[13px] font-semibold text-forest/60 group-hover:text-forest transition-colors">
                Upload a document
              </p>
              <p className="text-[11px] text-muted">PDF, DOCX, XLSX — max 10 MB</p>
            </button>
          </div>
        )}

      </div>
    </DashboardShell>
  )
}