"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, Eye,
  ChevronRight, CheckCircle, Target, FileCheck,
  AlertCircle, DollarSign, TrendingUp, Users, Zap,
  Activity, ArrowUpRight, Shield, Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { metrics, recentActivity, aiSuggestions, leads, clients } from "@/lib/data";
import { clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";
import { NeuralBackground } from "@/components/NeuralBackground";

interface AIOutput { summary: string; actions: string[]; confidence: number; }

const aiResponses: Record<string, AIOutput> = {
  "follow up": {
    summary: "Found 4 leads requiring follow-up. Drafting personalised outreach for each.",
    actions: [
      "📧 Drafting email to Marcus Rivera (Grow Media) — last contact 5h ago, $14.2k deal",
      "📧 Drafting email to Jordan Lee (Flux Creative) — warm lead, $6.8k deal",
      "📧 Scheduling nudge for Sarah Chen (Pinnacle Digital) — warm, $8.5k deal",
      "⏳ Queuing follow-up for Priya Patel — cold lead, re-engagement sequence starting",
    ],
    confidence: 94,
  },
  "invoice": {
    summary: "Identified $16,250 in outstanding invoices. Generating targeted reminders.",
    actions: [
      "🚨 Escalation email → Apex Digital ($4,500 · 12 days overdue)",
      "⚠️  Firm reminder → Vanta Labs ($8,750 · 7 days overdue)",
      "📩 Gentle reminder → Meridian Group ($2,800 · 3 days)",
      "📩 First notice → Nova Commerce ($1,200 · due today)",
    ],
    confidence: 98,
  },
  "report": {
    summary: "Weekly business summary compiled from all modules.",
    actions: [
      "📊 12 new leads captured (+3 vs last week) · Pipeline: $55.7k",
      "✅ 47 tasks completed · 7 automations saved ~14 hours",
      "💰 $9,200 revenue collected · $16.3k still outstanding",
      "⚠️  Meridian Group (45% health) needs urgent attention",
    ],
    confidence: 100,
  },
  "proposal": {
    summary: "Generating custom proposal for your highest-value lead.",
    actions: [
      "📄 Target: Alex Thompson, NextWave Studios ($22k scope)",
      "🔍 Pulling: Company data, project requirements, timeline",
      "✍️  Writing: Executive summary, scope, deliverables, pricing",
      "📬 Ready to review in ~30 seconds — will email on approval",
    ],
    confidence: 87,
  },
};

function getAIOutput(prompt: string): AIOutput {
  const lower = prompt.toLowerCase();
  const key = Object.keys(aiResponses).find(k => lower.includes(k));
  return key ? aiResponses[key] : {
    summary: `Analysing "${prompt}" across all business modules.`,
    actions: [
      "🔍 Scanning leads, clients, invoices, and automations",
      "🤖 AI Employee processing your request",
      "📋 Preparing action plan and recommendations",
      "⚡ Will execute automatically upon confirmation",
    ],
    confidence: 82,
  };
}

const activityIcons: Record<string, React.ReactNode> = {
  bot:     <Bot style={{ width: 12, height: 12, color: "#00d4ff" }} />,
  invoice: <DollarSign style={{ width: 12, height: 12, color: "#f5a623" }} />,
  report:  <TrendingUp style={{ width: 12, height: 12, color: "#06ffd3" }} />,
  lead:    <Users style={{ width: 12, height: 12, color: "#00ff9d" }} />,
  content: <Sparkles style={{ width: 12, height: 12, color: "#a78bfa" }} />,
};

/* Animated counter hook */
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

/* Metric card */
function MetricCard({ label, value, suffix = "", change, changePositive = true, icon: Icon, color, delay = 0 }:
  { label: string; value: number; suffix?: string; change?: string; changePositive?: boolean; icon: typeof Activity; color: string; delay?: number }) {
  const count = useCounter(value, 1200);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16,1,0.3,1] }}
      style={{
        background: "var(--clr-card)",
        border: "1px solid var(--clr-border)",
        borderRadius: 14, padding: "16px 18px",
        position: "relative", overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.18s, background 0.2s",
      }}
      whileHover={{
        borderColor: `${color}40`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${color}12`,
        y: -2,
      }}
    >
      {/* Ambient top glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60,
        background: `radial-gradient(ellipse 80% 100% at 50% -20%, ${color}12 0%, transparent 70%)`,
        pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--clr-text4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--clr-text1)", letterSpacing: "-0.035em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {suffix === "$" ? "$" : ""}{count.toLocaleString()}{suffix !== "$" ? suffix : ""}
          </div>
          {change && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowUpRight style={{ width: 10, height: 10, color: changePositive ? "#00ff9d" : "#ff3366", transform: changePositive ? "none" : "rotate(90deg)" }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: changePositive ? "#00ff9d" : "#ff3366" }}>{change}</span>
            </div>
          )}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${color}20`,
        }}>
          <Icon style={{ width: 15, height: 15, color }} />
        </div>
      </div>

      {/* Bottom scan accent */}
      <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1,
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
    </motion.div>
  );
}

export function Dashboard() {
  const [prompt, setPrompt]         = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [aiOutput, setAiOutput]     = useState<AIOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simMode, setSimMode]       = useState(false);
  const [greeting, setGreeting]     = useState("Good morning");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setLastPrompt(prompt);
    setIsProcessing(true);
    setAiOutput(null);
    await new Promise(r => setTimeout(r, simMode ? 600 : 1000));
    setAiOutput(getAIOutput(prompt));
    setIsProcessing(false);
    setPrompt("");
  };

  const handleConfirm = () => {
    setAiOutput(null);
    showToast("Actions queued — AI Employee is executing…", "success");
  };

  const hotLeads     = leads.filter(l => l.status === "hot").length;
  const activeClients = clients.filter(c => c.status === "active").length;

  const metricCards = [
    { label: "Pipeline Value",    value: 55700, suffix: "$",  change: "+12% this week",  changePositive: true,  icon: TrendingUp, color: "#00d4ff", delay: 0.05 },
    { label: "Unpaid Invoices",   value: 16300, suffix: "$",  change: "3 overdue",        changePositive: false, icon: DollarSign, color: "#f5a623", delay: 0.10 },
    { label: "Active Automations",value: metrics.activeAutomations, suffix: "",  change: "14h saved/week",  changePositive: true,  icon: Zap,         color: "#06ffd3", delay: 0.15 },
    { label: "Client Tasks",      value: metrics.clientTasks, suffix: "",  change: `${hotLeads} hot leads`, changePositive: true, icon: Activity,    color: "#8b5cf6", delay: 0.20 },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1080, margin: "0 auto" }}>

      {/* ── Greeting bar ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--clr-text1)", letterSpacing: "-0.025em", marginBottom: 4 }}>
            {greeting}, <span style={{ background: "linear-gradient(90deg,#00d4ff,#06ffd3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Vijay</span>
          </h2>
          <p style={{ fontSize: 12.5, color: "var(--clr-text4)" }}>
            {metrics.activeAutomations} automations running · {hotLeads} hot leads · {activeClients} active clients
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { label: "$55.7k Pipeline", color: "#00d4ff" },
            { label: "$16.3k Unpaid",   color: "#f5a623" },
            { label: `${metrics.pendingFollowUps} Follow-ups`, color: "#8b5cf6" },
          ].map(s => (
            <span key={s.label} style={{
              fontSize: 11, fontWeight: 600, color: s.color,
              background: `${s.color}10`, border: `1px solid ${s.color}22`,
              borderRadius: 20, padding: "3px 10px",
              boxShadow: `0 0 8px ${s.color}10`,
            }}>{s.label}</span>
          ))}
          <span style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
            color: "#00ff9d", background: "rgba(0,255,157,0.07)", border: "1px solid rgba(0,255,157,0.18)",
            borderRadius: 20, padding: "3px 12px",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff9d", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" }} />
            AI Online
          </span>
        </div>
      </motion.div>

      {/* ── Metric cards ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}
        className="grid-cols-4">
        {metricCards.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── AI Command Center — HERO ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        style={{
          borderRadius: 20, padding: "26px 26px 20px",
          marginBottom: 22,
          position: "relative", overflow: "hidden",
          background: "rgba(0,212,255,0.03)",
          border: "1px solid rgba(0,212,255,0.16)",
          boxShadow: "0 0 40px rgba(0,212,255,0.04), inset 0 1px 0 rgba(0,212,255,0.06)",
        }}
      >
        {/* Neural canvas background */}
        <NeuralBackground />

        {/* Radial glow top-left */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(0,212,255,0.07) 0%, transparent 60%)" }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, position: "relative" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: "linear-gradient(135deg,#00d4ff 0%,#8b5cf6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)",
            }}>
              <Bot style={{ width: 19, height: 19, color: "white" }} />
            </div>
            {/* Orbital ring */}
            <div style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              border: "1px dashed rgba(0,212,255,0.25)",
              animation: "spin-slow 8s linear infinite",
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--clr-text1)", letterSpacing: "-0.02em" }}>
              AI Command Center
            </div>
            <div style={{ fontSize: 11.5, color: "var(--clr-text4)", marginTop: 2 }}>
              Tell your AI employee what to do — it plans, drafts, and executes
            </div>
          </div>
          <button
            onClick={() => setSimMode(!simMode)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 9,
              cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
              background: simMode ? "rgba(245,166,35,0.10)" : "rgba(0,212,255,0.05)",
              border: `1px solid ${simMode ? "rgba(245,166,35,0.28)" : "rgba(0,212,255,0.14)"}`,
              color: simMode ? "#f5a623" : "var(--clr-text4)",
            }}
          >
            <Eye style={{ width: 12, height: 12 }} />
            {simMode ? "Simulate ON" : "Simulate"}
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleExecute(); } }}
          placeholder={simMode
            ? "Preview what AI will do… e.g. 'Follow up with all warm leads'"
            : "Tell me what to do… e.g. 'Send invoice reminders' or 'Generate weekly report'"}
          rows={3}
          style={{
            width: "100%", fontSize: 13.5, color: "var(--clr-text1)",
            resize: "none", outline: "none", fontFamily: "inherit",
            fontWeight: 450, lineHeight: 1.65,
            background: "rgba(0,212,255,0.03)",
            border: "1px solid rgba(0,212,255,0.12)",
            borderRadius: 13, padding: "13px 15px",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxSizing: "border-box", position: "relative",
          }}
          onFocus={e => {
            e.target.style.borderColor = "rgba(0,212,255,0.38)";
            e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.07), 0 0 20px rgba(0,212,255,0.08)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(0,212,255,0.12)";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* Action row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, position: "relative" }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {aiSuggestions.slice(0, 3).map((s, i) => (
              <button key={i} onClick={() => { setPrompt(s); textareaRef.current?.focus(); }}
                style={{
                  fontSize: 11, color: "var(--clr-text4)",
                  background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.10)",
                  borderRadius: 20, padding: "4px 11px", cursor: "pointer",
                  transition: "all 0.14s", fontFamily: "inherit",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.10)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.28)";
                  e.currentTarget.style.color = "#00d4ff";
                  e.currentTarget.style.boxShadow = "0 0 8px rgba(0,212,255,0.10)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.10)";
                  e.currentTarget.style.color = "var(--clr-text4)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >{s}</button>
            ))}
          </div>
          <button
            onClick={handleExecute}
            disabled={isProcessing || !prompt.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 18px",
              borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              background: isProcessing ? "rgba(0,212,255,0.10)" : "linear-gradient(135deg, #00d4ff, #06b6d4)",
              border: "1px solid rgba(0,212,255,0.35)",
              color: isProcessing ? "#00d4ff" : "#020510",
              boxShadow: isProcessing ? "none" : "0 4px 16px rgba(0,212,255,0.25), 0 0 32px rgba(0,212,255,0.10)",
              transition: "all 0.18s",
              opacity: !prompt.trim() ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              if (!isProcessing && prompt.trim()) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(0,212,255,0.35), 0 0 48px rgba(0,212,255,0.15)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,212,255,0.25), 0 0 32px rgba(0,212,255,0.10)";
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
          >
            {isProcessing ? (
              <><Cpu style={{ width: 12, height: 12, animation: "spin 0.7s linear infinite" }} />Processing…</>
            ) : (
              <>{simMode ? <Eye style={{ width: 12, height: 12 }} /> : <Send style={{ width: 12, height: 12 }} />}{simMode ? "Preview" : "Execute"}</>
            )}
          </button>
        </div>

        {/* AI output panel */}
        <AnimatePresence>
          {aiOutput && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 14, overflow: "hidden" }}
            >
              <div style={{
                background: "rgba(0,212,255,0.03)",
                border: "1px solid rgba(0,212,255,0.18)",
                borderRadius: 14, padding: "16px 18px",
                position: "relative", overflow: "hidden",
              }}>
                {/* Scan line */}
                <div className="scan-line" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7,
                      background: "rgba(0,212,255,0.14)", border: "1px solid rgba(0,212,255,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 8px rgba(0,212,255,0.20)" }}>
                      <Bot style={{ width: 11, height: 11, color: "#00d4ff" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff", letterSpacing: "0.02em" }}>
                      {simMode ? "SIMULATION PREVIEW" : "AI EMPLOYEE RESPONSE"}
                    </span>
                    {simMode && <Badge variant="warning">Preview</Badge>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--clr-text4)" }}>
                    <Shield style={{ width: 10, height: 10, color: "#00ff9d" }} />
                    <span style={{ color: "#00ff9d", fontWeight: 600 }}>{aiOutput.confidence}%</span>
                    <span>confidence</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--clr-text2)", fontWeight: 500, marginBottom: 12, lineHeight: 1.6 }}>{aiOutput.summary}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {aiOutput.actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--clr-text3)", lineHeight: 1.6 }}
                    >
                      <ChevronRight style={{ width: 11, height: 11, color: "#00d4ff", flexShrink: 0, marginTop: 2 }} />
                      {action}
                    </motion.div>
                  ))}
                </div>
                {!simMode && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                    <button
                      onClick={handleConfirm}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                        borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        background: "linear-gradient(135deg,#00d4ff,#06b6d4)",
                        border: "1px solid rgba(0,212,255,0.4)", color: "#020510",
                        boxShadow: "0 2px 12px rgba(0,212,255,0.22)",
                      }}>
                      <CheckCircle style={{ width: 12, height: 12 }} />Confirm & Execute
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => { setPrompt(lastPrompt); setAiOutput(null); }}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setAiOutput(null)}>Cancel</Button>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--clr-text4)" }}>
                      <FileCheck style={{ width: 10, height: 10 }} />
                      Audit logged
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Two-column lower section ──────────────────────── */}
      <div className="two-col-grid">

        {/* Live Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          style={{
            background: "var(--clr-card)", border: "1px solid var(--clr-border)",
            borderRadius: 16, padding: "18px 18px", overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--clr-text4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Live Activity</span>
            <span style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700,
              color: "#00d4ff", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)",
              borderRadius: 5, padding: "2px 7px",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4ff", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              LIVE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.27 + i * 0.055 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 8px", borderRadius: 9, cursor: "pointer",
                  transition: "background 0.12s",
                  borderBottom: i < recentActivity.length - 1 ? "1px solid var(--clr-border)" : "none",
                }}
                whileHover={{ backgroundColor: "var(--clr-card-hover)" }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {activityIcons[a.icon] ?? activityIcons.bot}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: "var(--clr-text2)", lineHeight: 1.5 }}>{a.message}</p>
                  <p style={{ fontSize: 10, color: "var(--clr-text4)", marginTop: 2 }}>{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4 }}
          style={{
            background: "var(--clr-card)", border: "1px solid var(--clr-border)",
            borderRadius: 16, padding: "18px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--clr-text4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Needs Attention</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#ff3366",
              background: "rgba(255,51,102,0.09)", border: "1px solid rgba(255,51,102,0.22)",
              borderRadius: 5, padding: "2px 7px",
            }}>4 items</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              { label: "Meridian Group",          detail: "Client health 45% — project at risk",        type: "danger",  action: "Recover",    color: "#ff3366" },
              { label: "Apex Digital invoice",    detail: "Overdue 12 days — $4,500 unpaid",             type: "warning", action: "Remind",     color: "#f5a623" },
              { label: "Alex Thompson follow-up", detail: "Hot lead — no response in 30 minutes",        type: "warning", action: "Follow up",  color: "#f5a623" },
              { label: "Weekly reports",          detail: "3 clients haven't received status updates",   type: "default", action: "Generate",   color: "var(--clr-text4)" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30 + i * 0.06 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 8px", borderRadius: 9, cursor: "pointer", transition: "background 0.12s",
                }}
                whileHover={{ backgroundColor: "var(--clr-card-hover)" }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: `${item.color}10`, border: `1px solid ${item.color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AlertCircle style={{ width: 10, height: 10, color: item.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text2)" }}>{item.label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--clr-text4)", marginTop: 2 }}>{item.detail}</div>
                </div>
                <button
                  style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 7,
                    background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.14)",
                    color: "#00d4ff", cursor: "pointer", flexShrink: 0, transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px rgba(0,212,255,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  }}
                  onClick={() => showToast(`${item.action} — processing…`, "info")}
                >
                  {item.action}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
