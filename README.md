# AgencyOS — AI Employee for Agencies

A production-quality SaaS dashboard for digital agencies, featuring an AI employee that manages leads, clients, invoices, automations, reports, and content — 24/7.

## Features

### Core Modules
- **Dashboard** — KPI overview, AI command panel, recent activity feed, quick actions
- **Leads** — Pipeline with status filters (Hot/Warm/Cold), add lead modal, AI follow-up & qualify
- **Clients** — Client health scores, account actions (update, report, follow-up), add client
- **Operations** — Invoice management, send reminders, escalate overdue, view invoice detail
- **Automations** — Toggle active/paused, add from templates, visual builder preview
- **Reports** — Multi-period AI-generated reports (weekly/monthly), bar chart, export as .txt
- **Content** — AI content generation (Social, Email, Web Copy, Calendar), content library with edit
- **Settings** — Profile editor, photo upload, integration toggles, plan management
- **Health Score** — Weighted agency health scoring, AI opportunity scanner with simulation
- **AI Employee** — Full-context conversational assistant with smart suggestions

### UX
- Responsive mobile layout with slide-in sidebar drawer
- Real CRUD across all modules (in-memory state)
- Modal system with Escape key close + body scroll lock
- Toast notification system (singleton pattern)
- Animated transitions (Framer Motion)
- Live global search across leads & clients
- Real file export (Blob API)
- Empty states, loading states, validation errors on all forms

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19.2.4 |
| Styling | Tailwind CSS v4 + inline CSSProperties |
| Animation | Framer Motion v12 |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
| Build | Static export — all 3 routes prerendered |

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build — zero errors
npm run start     # serve production build locally
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (/)
│   ├── app/
│   │   ├── page.tsx          # Dashboard shell (/app)
│   │   ├── layout.tsx        # App route metadata
│   │   └── error.tsx         # App error boundary
│   ├── layout.tsx            # Root layout + SEO metadata
│   ├── globals.css           # Design tokens + responsive overrides
│   ├── error.tsx             # Root error boundary
│   └── not-found.tsx         # 404 page
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Nav + mobile drawer
│   │   └── Header.tsx        # Search, notifications, quick-add, hamburger
│   ├── modules/              # 10 full-featured dashboard modules
│   └── ui/
│       ├── Button.tsx        # Variant system: primary, secondary, ghost, outline
│       ├── Badge.tsx         # Status badges with dot + pulse variants
│       ├── Modal.tsx         # Accessible modal with ESC + scroll lock
│       ├── Card.tsx          # Glass card with hover/gradient variants
│       ├── EmptyState.tsx    # Consistent empty state UI
│       └── ToastContainer.tsx# Fixed toast stack, auto-dismiss
└── lib/
    ├── data.ts               # Static seed data
    ├── ds.ts                 # Design system constants (SHELL, CARD, clr, INPUT_STYLE)
    └── toast.ts              # Toast singleton emitter
```

## Deploy

### Vercel (one command)
```bash
npx vercel --prod
```

### Cloudflare Pages
Connect the GitHub repo in the Cloudflare Pages dashboard. Build command: `npm run build`. Output directory: `.next`.

## Resume Bullets

- Built production-ready agency SaaS in Next.js 16 / React 19 with App Router and Turbopack
- Architected 10-module dashboard with real in-memory CRUD, modal system, and live search
- Implemented responsive mobile layout with CSS transform drawer and body scroll management
- Built AI content generation, multi-period report export (Blob API), and automation workflow system
- Zero TypeScript errors, zero compile warnings — all routes statically prerendered at build time

## License

MIT
