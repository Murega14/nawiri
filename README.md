# Nawiri — Landing Page

A Next.js 14 + Tailwind CSS landing page for the Nawiri SACCO fintech platform.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nawiri/
├── app/
│   ├── globals.css        # Tailwind directives + Google Fonts import
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main page (composes all sections)
├── components/
│   ├── Navbar.tsx         # Sticky nav with scroll effect
│   ├── Hero.tsx           # Hero section + stats
│   ├── DashboardCard.tsx  # Interactive card visual in hero
│   ├── HowItWorks.tsx     # 4-step journey (dark bg)
│   ├── TrustScore.tsx     # Score breakdown + tier cards
│   ├── P2PLending.tsx     # Features + lending example
│   ├── Testimonials.tsx   # Member stories
│   ├── CTA.tsx            # Final call to action
│   └── Footer.tsx         # Links + CBK compliance note
├── tailwind.config.js     # Custom Nawiri color palette & fonts
├── next.config.js
└── package.json
```

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS** — Custom palette (forest, gold, terra, cream)
- **Google Fonts** — Playfair Display + DM Sans + DM Mono

## Next Steps

Pages/screens to build next:
- `/onboarding` — SACCO search & KYC flow
- `/dashboard` — Member dashboard with TrustScore ring
- `/p2p` — Browse & fund P2P loans
- `/score` — Full TrustScore detail & improvement tips
