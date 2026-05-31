"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Users, DollarSign, Bot,
  CheckCircle, TrendingUp, Play, Zap,
  ChevronDown, Star, Activity
} from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;
const BG   = "#050509";
const CARD  = "rgba(255,255,255,0.028)";
const BORD  = "rgba(255,255,255,0.08)";

const C_STYLE: React.CSSProperties = {
  width: "100%",
  maxWidth: 1400,
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft:  "clamp(20px, 5vw, 80px)",
  paddingRight: "clamp(20px, 5vw, 80px)",
};

function C({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div style={C_STYLE} className={className}>
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0, y = 24, className = "" }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, delay, ease: E }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a78bfa", marginBottom: 16 }}>
      {children}
    </p>
  );
}

/* ── Hero Visual ── */
const AI_TASKS = [
  "Analyzing 47 new inbound leads…",
  "Drafting follow-up for Jason M…",
  "Generating Q3 performance report…",
  "Scheduling discovery calls for 6 leads…",
  "Flagging at-risk client: Apex Studio…",
];
const AI_ACTIONS = [
  { label: "Lead qualified",   sub: "Ryan Chen · 2m ago",    dot: "#10b981" },
  { label: "Invoice sent",     sub: "$4,200 · Orbit Agency", dot: "#a78bfa" },
  { label: "Follow-up queued", sub: "3 replies pending",      dot: "#f59e0b" },
];

function HeroVisual() {
  const [task, setTask]     = useState(0);
  const [action, setAction] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTask(p   => (p + 1) % AI_TASKS.length),   2800);
    const a = setInterval(() => setAction(p => (p + 1) % AI_ACTIONS.length), 2800);
    return () => { clearInterval(t); clearInterval(a); };
  }, []);

  const chips = [
    { label: "Health Score", value: "94",   unit: "/100", color: "#10b981", x: "6%",  y: "10%", delay: 0   },
    { label: "Avg Response", value: "11",   unit: "min",  color: "#3b82f6", x: "62%", y: "2%",  delay: 0.7 },
    { label: "Revenue",      value: "+$28k",unit: "MoM",  color: "#a78bfa", x: "70%", y: "72%", delay: 1.4 },
  ];

  return (
    <div className="relative w-full" style={{ height: 480, maxWidth: 560 }}>
      <div style={{ position: "absolute", top: "20%", left: "28%", width: 320, height: 320, background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(2px)", pointerEvents: "none" }} />

      {chips.map(chip => (
        <motion.div key={chip.label}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
          style={{ position: "absolute", left: chip.x, top: chip.y, background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(12px)", zIndex: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#71717a", marginBottom: 2 }}>{chip.label}</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: chip.color, lineHeight: 1 }}>
            {chip.value}<span style={{ fontSize: 11, fontWeight: 500, color: "#52525b", marginLeft: 2 }}>{chip.unit}</span>
          </p>
        </motion.div>
      ))}

      <div style={{ position: "absolute", left: "14%", top: "18%", width: "72%", background: "rgba(10,10,18,0.94)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 20, padding: "24px", backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.08)", zIndex: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#f4f4f6" }}>AgencyOS AI</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <p style={{ fontSize: 10, color: "#52525b" }}>Active · 3 tasks running</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16, minHeight: 40 }}>
          <AnimatePresence mode="wait">
            <motion.p key={task} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: E }}
              style={{ fontSize: 13, color: "#a78bfa", fontWeight: 500, lineHeight: 1.5 }}>
              {AI_TASKS[task]}
            </motion.p>
          </AnimatePresence>
          <motion.div animate={{ scaleX: [0, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            style={{ height: 2, background: "linear-gradient(90deg,#7c3aed,#4f46e5,transparent)", borderRadius: 1, marginTop: 10, transformOrigin: "left" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[["Leads", "47"], ["Open", "12"], ["Won", "$82k"]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
              <p style={{ fontSize: 10, color: "#52525b", marginBottom: 2 }}>{l}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f6" }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
          <p style={{ fontSize: 10, color: "#3f3f46", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Latest Action</p>
          <AnimatePresence mode="wait">
            <motion.div key={action} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.35, ease: E }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: AI_ACTIONS[action].dot, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7" }}>{AI_ACTIONS[action].label}</p>
                <p style={{ fontSize: 11, color: "#52525b" }}>{AI_ACTIONS[action].sub}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Demo ── */
type DemoTab = "leads" | "invoices" | "clients" | "reports";
const DEMO_TABS: { id: DemoTab; label: string; icon: React.ReactNode; rows: string[][] }[] = [
  { id: "leads",    label: "Lead Pipeline", icon: <Users className="w-3.5 h-3.5" />,    rows: [["Ryan Chen","Orbit Studio","$4,800","Hot"],["Priya Mehta","Flux Agency","$12,000","Warm"],["Jake Torres","Nova Creative","$6,500","Hot"],["Lena Wu","Apex Digital","$9,200","Cold"]] },
  { id: "invoices", label: "Invoices",      icon: <DollarSign className="w-3.5 h-3.5" />,rows: [["INV-0041","Orbit Studio","$4,800","Paid"],["INV-0040","Nova Creative","$6,500","Sent"],["INV-0039","Flux Agency","$12,000","Draft"],["INV-0038","Apex Digital","$9,200","Overdue"]] },
  { id: "clients",  label: "Clients",       icon: <Activity className="w-3.5 h-3.5" />,  rows: [["Orbit Studio","Active","Score 94","2 open"],["Nova Creative","Active","Score 88","1 open"],["Flux Agency","At Risk","Score 62","4 open"],["Apex Digital","Active","Score 91","0 open"]] },
  { id: "reports",  label: "Reports",       icon: <TrendingUp className="w-3.5 h-3.5" />, rows: [["Q3 Revenue","↑ +24%","$82,400","Delivered"],["Lead Conv.","↑ +18%","34% rate","Delivered"],["Avg Response","↓ -72%","11 min","Live"],["Client NPS","↑ +12pts","NPS 78","Delivered"]] },
];

/* ── FAQ ── */
const FAQS = [
  { q: "How does AgencyOS AI work?",          a: "AgencyOS connects to your existing tools and data. Its AI continuously analyzes your leads, clients, and operations — then acts: writing follow-ups, generating invoices, flagging risks, and surfacing insights. No manual prompting required." },
  { q: "Can I keep using my current tools?",  a: "Yes. AgencyOS integrates with Gmail, Slack, HubSpot, Stripe, Notion, and 40+ other tools. It works alongside your existing stack, not against it." },
  { q: "How long does setup take?",           a: "Most agencies are fully operational within one business day. Our guided onboarding connects your tools, imports your client data, and trains the AI on your specific workflows." },
  { q: "What if I don't like it?",            a: "Cancel anytime. No contracts, no lock-in. We offer a 14-day free trial and a 30-day money-back guarantee — no questions asked." },
  { q: "Is my data secure?",                  a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never train on your data, never share it, and you can export or delete everything at any time." },
  { q: "Do I need technical skills?",         a: "None. AgencyOS is built for agency owners and operators, not engineers. If you can use Gmail, you can run AgencyOS." },
];

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function Landing() {
  const [demoTab, setDemoTab] = useState<DemoTab>("leads");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const activeTab = DEMO_TABS.find(t => t.id === demoTab)!;

  const STATUS_COLOR: Record<string, string> = {
    Hot: "#ef4444", Warm: "#f59e0b", Cold: "#3b82f6",
    Paid: "#10b981", Sent: "#a78bfa", Draft: "#52525b", Overdue: "#ef4444",
    Active: "#10b981", "At Risk": "#f59e0b",
    Delivered: "#10b981", Live: "#a78bfa",
  };

  return (
    <div style={{ background: BG, color: "#f4f4f6", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh" }}>

      {/* ── 1. NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 60, background: "rgba(5,5,9,0.84)", backdropFilter: "blur(24px) saturate(200%)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <C className="h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#f4f4f6", letterSpacing: "-0.02em" }}>AgencyOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8" style={{ fontSize: 13, fontWeight: 500, color: "#52525b" }}>
            {["Product", "Pricing", "Docs", "Blog"].map(l => (
              <button key={l} className="hover:text-zinc-300 transition-colors duration-150">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="hidden md:block hover:text-zinc-200 transition-colors" style={{ fontSize: 13, fontWeight: 500, color: "#71717a" }}>Sign in</Link>
            <Link href="/app" className="hover:opacity-90 transition-opacity" style={{ fontSize: 13, fontWeight: 600, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "8px 18px", borderRadius: 8 }}>
              Start free →
            </Link>
          </div>
        </C>
      </nav>

      {/* ── 2. HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 60, position: "relative", overflow: "hidden", width: "100%" }}>
        <div style={{ position: "absolute", top: "8%", right: "0%", width: 560, height: 560, background: "radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "12%", left: "0%", width: 360, height: 360, background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />

        <C className="relative w-full py-28">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(40px, 5vw, 100px)", alignItems: "center" }}>
            <div>
              <Reveal delay={0}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 99, padding: "6px 14px", marginBottom: 32 }}>
                  <Sparkles className="w-3 h-3" style={{ color: "#a78bfa" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", letterSpacing: "0.02em" }}>The AI employee for agencies</span>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 style={{ fontSize: "clamp(46px,6vw,92px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.98, color: "#f4f4f6", marginBottom: 32 }}>
                  Your agency,<br />
                  <span style={{ background: "linear-gradient(135deg,#e2d9ff 0%,#c4b5fd 30%,#a78bfa 60%,#7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    on autopilot.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.14}>
                <p style={{ fontSize: 20, lineHeight: 1.7, color: "#6b6b7b", marginBottom: 48, maxWidth: 500 }}>
                  AgencyOS replaces manual operations with an AI that follows up on leads, sends invoices, tracks clients, and delivers weekly reports — without you lifting a finger.
                </p>
              </Reveal>

              <Reveal delay={0.20}>
                <div className="flex items-center gap-4 flex-wrap">
                  <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: E }}>
                    <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 15, fontWeight: 700, padding: "15px 30px", borderRadius: 11, boxShadow: "0 0 0 1px rgba(124,58,237,0.45), 0 8px 32px rgba(124,58,237,0.32), 0 2px 8px rgba(0,0,0,0.3)", letterSpacing: "-0.01em" }}>
                      Start free — 14 days <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: E }}>
                    <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 15, fontWeight: 600, padding: "15px 24px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 11, transition: "color 0.2s, border-color 0.2s" }}>
                      <Play className="w-3.5 h-3.5" /> Watch demo
                    </Link>
                  </motion.div>
                </div>
              </Reveal>

              <Reveal delay={0.26}>
                <div className="flex items-center gap-6 mt-10 flex-wrap">
                  {["No credit card", "Cancel anytime", "14-day trial"].map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                      <span style={{ fontSize: 13, color: "#52525b", fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="flex justify-center">
              <HeroVisual />
            </Reveal>
          </div>
        </C>
      </section>

      {/* ── 3. TRUST BAR ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "40px 0" }}>
        <C>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3f3f46" }}>Trusted by 500+ agencies</p>
            <div className="flex items-center gap-10 flex-wrap justify-center">
              {["Orbit Agency", "Flux Studio", "Nova Creative", "Apex Digital", "Zenith Co"].map(n => (
                <span key={n} style={{ fontSize: 14, fontWeight: 700, color: "#4e4e62", letterSpacing: "-0.01em" }}>{n}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4" style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
              <span style={{ fontSize: 13, fontWeight: 600, color: "#52525b", marginLeft: 6 }}>4.9 / 5</span>
            </div>
          </div>
        </C>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section style={{ padding: "144px 0" }}>
        <C>
          <Reveal className="text-center mb-20">
            <Eyebrow>How it works</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6", marginBottom: 16 }}>Three steps. Zero manual work.</h2>
            <p style={{ fontSize: 18, color: "#71717a", maxWidth: 480, margin: "0 auto" }}>From first contact to closed deal — AgencyOS handles every step automatically.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Lead enters",  body: "A new lead fills your form or lands in your inbox. AgencyOS captures it instantly — no manual entry, no missed opportunities.", icon: <Users className="w-5 h-5" />, color: "#7c3aed" },
              { num: "02", title: "AI takes over", body: "The AI qualifies, enriches, and responds within 2 minutes. It books meetings, sends proposals, and keeps conversations alive — 24/7.", icon: <Bot className="w-5 h-5" />, color: "#a78bfa" },
              { num: "03", title: "Revenue grows", body: "Deals close faster, clients stay longer, and your team reclaims hours every week. Average 3× revenue growth in 90 days.", icon: <TrendingUp className="w-5 h-5" />, color: "#4f46e5" },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.22)" }}
                  transition={{ duration: 0.22, ease: E }}
                  style={{ padding: "44px 36px", background: CARD, border: `1px solid ${BORD}`, borderRadius: 24, height: "100%", cursor: "default" }}>
                  {/* Top accent line */}
                  <div style={{ width: 32, height: 2, background: `linear-gradient(90deg,${step.color},transparent)`, borderRadius: 1, marginBottom: 32 }} />
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(124,58,237,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, color: step.color }}>
                    {step.icon}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#3f3f46", textTransform: "uppercase", marginBottom: 12 }}>{step.num}</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.025em", marginBottom: 16 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: "#6b6b7b", lineHeight: 1.75 }}>{step.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </C>
      </section>

      {/* ── 5. BENTO FEATURES ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>Features</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6", marginBottom: 16 }}>Everything your agency needs.</h2>
            <p style={{ fontSize: 18, color: "#71717a", maxWidth: 440, margin: "0 auto" }}>One AI operating system. Every function covered.</p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: "minmax(260px,auto)", gap: 20 }}>
            {/* col-span-2 */}
            <Reveal delay={0} className="col-span-2">
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, padding: "36px 40px", height: "100%", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users className="w-4 h-4" style={{ color: "#a78bfa" }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.02em" }}>AI Lead Follow-up</h3>
                </div>
                <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7, marginBottom: 24, maxWidth: 400 }}>
                  Responds to every lead within 2 minutes, qualifies them automatically, and books discovery calls — even at 2am on a Sunday.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Ryan Chen — Follow-up sent · 2m ago", "Priya Mehta — Call booked · 14m ago", "Jake Torres — Proposal sent · 1h ago"].map(msg => (
                    <div key={msg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: "#52525b" }}>{msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* col-span-1 row-span-2 */}
            <Reveal delay={0.08} className="row-span-2">
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, padding: "36px 32px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Activity className="w-4 h-4" style={{ color: "#10b981" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.02em", marginBottom: 12 }}>Client Health Score</h3>
                <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.65, marginBottom: 28 }}>Real-time AI score for every client. Flags at-risk accounts before they churn.</p>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: 120, height: 120 }}>
                    <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                      <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <motion.circle cx="60" cy="60" r="48" fill="none" stroke="url(#hg)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="301.6" strokeDashoffset="301.6"
                        animate={{ strokeDashoffset: 301.6 * 0.06 }}
                        transition={{ duration: 1.6, delay: 0.4, ease: E }} />
                      <defs>
                        <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>94</p>
                      <p style={{ fontSize: 11, color: "#52525b" }}>Excellent</p>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  {([["Orbit Studio", 94, "#10b981"], ["Nova Creative", 88, "#a78bfa"], ["Apex Digital", 62, "#f59e0b"]] as const).map(([name, val, color]) => (
                    <div key={name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#52525b" }}>{name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color }}>{val}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3, ease: E }}
                          style={{ height: "100%", background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Card 3 */}
            <Reveal delay={0.12}>
              <motion.div whileHover={{ y: -3, borderColor: "rgba(245,158,11,0.2)" }} transition={{ duration: 0.2, ease: E }}
                style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 24, padding: "36px", height: "100%" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <DollarSign className="w-4 h-4" style={{ color: "#f59e0b" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.02em", marginBottom: 10 }}>Invoice AI</h3>
                <p style={{ fontSize: 14, color: "#6b6b7b", lineHeight: 1.7, marginBottom: 20 }}>Auto-generates, sends, and chases invoices. Reduces late payments by 68%.</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.03em", lineHeight: 1 }}>68%</span>
                  <span style={{ fontSize: 12, color: "#52525b" }}>fewer late payments</span>
                </div>
              </motion.div>
            </Reveal>

            {/* Card 4 */}
            <Reveal delay={0.16}>
              <motion.div whileHover={{ y: -3, borderColor: "rgba(59,130,246,0.2)" }} transition={{ duration: 0.2, ease: E }}
                style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 24, padding: "36px", height: "100%" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Zap className="w-4 h-4" style={{ color: "#3b82f6" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.02em", marginBottom: 10 }}>Smart Automations</h3>
                <p style={{ fontSize: 14, color: "#6b6b7b", lineHeight: 1.7, marginBottom: 20 }}>Build multi-step workflows in plain English. No code, no Zapier.</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#3b82f6", letterSpacing: "-0.03em", lineHeight: 1 }}>14h</span>
                  <span style={{ fontSize: 12, color: "#52525b" }}>saved per week avg</span>
                </div>
              </motion.div>
            </Reveal>

            {/* Full-width card */}
            <Reveal delay={0.2} className="col-span-3">
              <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 20, padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 480 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot className="w-4 h-4" style={{ color: "#a78bfa" }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f6", letterSpacing: "-0.02em" }}>AI Command Center</h3>
                  </div>
                  <p style={{ fontSize: 15, color: "#71717a", lineHeight: 1.7 }}>One dashboard. Every client, lead, invoice, and task — managed by AI. Ask questions in plain English and get instant answers with actionable next steps.</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["Lead scoring", "Auto follow-up", "Invoice AI", "Client health", "Weekly reports", "Smart routing"].map(tag => (
                    <span key={tag} style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 99, padding: "4px 12px" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </C>
      </section>

      {/* ── 6. LIVE DEMO ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>Live demo</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6", marginBottom: 16 }}>See the product in action.</h2>
          </Reveal>

          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORD}`, borderRadius: 14, padding: 6, width: "fit-content", margin: "0 auto 32px" }}>
            {DEMO_TABS.map(tab => (
              <button key={tab.id} onClick={() => setDemoTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 9, transition: "all 0.2s", background: demoTab === tab.id ? "rgba(124,58,237,0.18)" : "transparent", color: demoTab === tab.id ? "#a78bfa" : "#52525b", border: demoTab === tab.id ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent" }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 8 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#3f3f46", display: "inline-block" }} />)}
              <span style={{ fontSize: 12, color: "#3f3f46", marginLeft: 12 }}>AgencyOS — {activeTab.label}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={demoTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: E }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "12px 28px", borderBottom: `1px solid ${BORD}` }}>
                  {["Name", "Company / Detail", "Value", "Status"].map(h => (
                    <p key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3f3f46" }}>{h}</p>
                  ))}
                </div>
                {activeTab.rows.map((row, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3, ease: E }}
                    style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "16px 28px", borderBottom: i < activeTab.rows.length - 1 ? `1px solid ${BORD}` : "none" }}>
                    {row.map((cell, j) => (
                      <p key={j} style={{ fontSize: 13, fontWeight: j === 3 ? 600 : 500, color: j === 3 ? (STATUS_COLOR[cell] ?? "#52525b") : j === 0 ? "#f4f4f6" : "#71717a" }}>{cell}</p>
                    ))}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </C>
      </section>

      {/* ── 7. ROI ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>Results</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6", marginBottom: 16 }}>Before AgencyOS. After AgencyOS.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal>
              <div style={{ background: CARD, border: "1px solid rgba(239,68,68,0.15)", borderRadius: 20, padding: "40px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444", marginBottom: 28 }}>Before</p>
                {[["Lead response time","4–8 hours"],["Leads followed up","40%"],["Time on admin","18 hrs/week"],["Invoice delays","Common"],["Client churn visibility","None"]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 14, color: "#71717a" }}>{l}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ background: CARD, border: "1px solid rgba(16,185,129,0.18)", borderRadius: 20, padding: "40px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981", marginBottom: 28 }}>After AgencyOS</p>
                {[["Lead response time","< 2 min"],["Leads followed up","100%"],["Time on admin","< 2 hrs/week"],["Invoice delays","Eliminated"],["Client churn visibility","Real-time"]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 14, color: "#71717a" }}>{l}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </C>
      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>Testimonials</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6" }}>Agencies love it.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah K.",  role: "Founder, Orbit Agency",   quote: "We used to lose leads because nobody followed up fast enough. AgencyOS fixed that on day one. Our close rate jumped 34% in 60 days." },
              { name: "Marcus T.", role: "CEO, Nova Creative",       quote: "I was skeptical. Now I genuinely can't imagine running the agency without it. It's like having a senior ops person who never sleeps." },
              { name: "Priya R.",  role: "Director, Flux Studio",    quote: "The client health scores alone saved us three accounts that would have churned. ROI was clear in the first week." },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.2)" }} transition={{ duration: 0.22, ease: E }}
                  style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 24, padding: "40px 36px", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 28 }}>
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5" style={{ color: "#f59e0b", fill: "#f59e0b" }} />)}
                  </div>
                  <p style={{ fontSize: 16, color: "#b4b4c4", lineHeight: 1.8, flex: 1, marginBottom: 32, fontStyle: "italic" }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f6" }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: "#52525b" }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </C>
      </section>

      {/* ── 9. PRICING ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>Pricing</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6", marginBottom: 16 }}>Simple, transparent pricing.</h2>
            <p style={{ fontSize: 18, color: "#71717a" }}>14-day free trial. No credit card required.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {[
              { name: "Starter", price: "$79",  tagline: "For solo operators",   features: ["Up to 3 clients","AI lead follow-up","Invoice AI","Weekly reports","Email support"], cta: "Start free trial", highlight: false },
              { name: "Growth",  price: "$199", tagline: "Most popular",          features: ["Up to 20 clients","Everything in Starter","Client health scores","Custom automations","Priority support","Slack integration"], cta: "Start free trial", highlight: true },
              { name: "Agency",  price: "$499", tagline: "For scaling agencies",  features: ["Unlimited clients","Everything in Growth","White-label reports","Dedicated AI training","API access","SLA + dedicated CSM"], cta: "Talk to sales", highlight: false },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div style={{ background: plan.highlight ? "rgba(124,58,237,0.08)" : CARD, border: plan.highlight ? "1px solid rgba(124,58,237,0.35)" : `1px solid ${BORD}`, borderRadius: 20, padding: "40px 36px", position: "relative", boxShadow: plan.highlight ? "0 0 0 1px rgba(124,58,237,0.1), 0 24px 64px rgba(124,58,237,0.12)" : "none" }}>
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 14px", borderRadius: 99 }}>MOST POPULAR</div>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 700, color: plan.highlight ? "#a78bfa" : "#71717a", marginBottom: 4 }}>{plan.name}</p>
                  <p style={{ fontSize: 12, color: "#52525b", marginBottom: 24 }}>{plan.tagline}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 32 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: "#f4f4f6", letterSpacing: "-0.04em", lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: "#52525b" }}>/mo</span>
                  </div>
                  <Link href="/app" className="hover:opacity-90 transition-opacity" style={{ display: "block", textAlign: "center", fontSize: 14, fontWeight: 700, padding: "13px 24px", borderRadius: 10, marginBottom: 32, background: plan.highlight ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)", color: plan.highlight ? "#fff" : "#a1a1aa", border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                    {plan.cta}
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: plan.highlight ? "#a78bfa" : "#10b981" }} />
                        <span style={{ fontSize: 13, color: "#71717a" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </C>
      </section>

      {/* ── 10. FAQ ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal className="text-center mb-16">
            <Eyebrow>FAQ</Eyebrow>
            <h2 style={{ fontSize: "clamp(32px,3.8vw,56px)", fontWeight: 800, letterSpacing: "-0.035em", color: "#f4f4f6" }}>Common questions.</h2>
          </Reveal>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div style={{ background: CARD, border: `1px solid ${faqOpen === i ? "rgba(124,58,237,0.25)" : BORD}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", background: "transparent", cursor: "pointer" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#f4f4f6", textAlign: "left" }}>{faq.q}</span>
                    <motion.div animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#52525b" }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: E }} style={{ overflow: "hidden" }}>
                        <p style={{ fontSize: 15, color: "#6b6b7b", lineHeight: 1.8, padding: "0 32px 28px" }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </C>
      </section>

      {/* ── 11. FINAL CTA ── */}
      <section style={{ padding: "0 0 144px" }}>
        <C>
          <Reveal>
            <div style={{ background: "rgba(124,58,237,0.065)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 32, padding: "120px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              {/* Multi-layer glow */}
              <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse,rgba(124,58,237,0.14) 0%,transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "60%", left: "30%", width: 300, height: 300, background: "radial-gradient(ellipse,rgba(79,70,229,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <Eyebrow>Get started today</Eyebrow>
                <h2 style={{ fontSize: "clamp(36px,4.5vw,72px)", fontWeight: 900, letterSpacing: "-0.045em", color: "#f4f4f6", marginBottom: 24, lineHeight: 1.0 }}>
                  Your agency deserves<br />
                  <span style={{ background: "linear-gradient(135deg,#e2d9ff,#c4b5fd,#a78bfa,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>better than manual.</span>
                </h2>
                <p style={{ fontSize: 19, color: "#6b6b7b", maxWidth: 500, margin: "0 auto 52px", lineHeight: 1.7 }}>
                  Join 500+ agencies using AgencyOS to automate operations, close more deals, and reclaim their time.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                  <motion.div whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: E }}>
                    <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontSize: 16, fontWeight: 700, padding: "17px 38px", borderRadius: 12, boxShadow: "0 0 0 1px rgba(124,58,237,0.45), 0 16px 48px rgba(124,58,237,0.36)", letterSpacing: "-0.01em" }}>
                      Start free — 14 days <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18, ease: E }}>
                    <Link href="/app" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 15, fontWeight: 600, padding: "17px 28px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12 }}>
                      Schedule a demo
                    </Link>
                  </motion.div>
                </div>
                <p style={{ fontSize: 13, color: "#3f3f46", marginTop: 28 }}>No credit card · No contracts · Cancel anytime</p>
              </div>
            </div>
          </Reveal>
        </C>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 0" }}>
        <C className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3f3f46" }}>AgencyOS</span>
          </div>
          <div className="flex items-center gap-8" style={{ fontSize: 13, color: "#3f3f52" }}>
            {["Privacy", "Terms", "Security", "Status"].map(l => (
              <button key={l} className="hover:text-zinc-500 transition-colors">{l}</button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "#3f3f52" }}>© 2025 AgencyOS</p>
        </C>
      </footer>

    </div>
  );
}
