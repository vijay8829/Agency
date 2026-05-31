"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, Eye,
  ChevronRight, CheckCircle, Target, FileCheck,
  AlertCircle, DollarSign, TrendingUp, Users
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { metrics, recentActivity, aiSuggestions, leads, clients } from "@/lib/data";
import { clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";

interface AIOutput {
  summary: string;
  actions: string[];
  confidence: number;
}

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
  bot:     <Bot style={{ width: 13, height: 13, color: "#a78bfa" }} />,
  invoice: <DollarSign style={{ width: 13, height: 13, color: "#fbbf24" }} />,
  report:  <TrendingUp style={{ width: 13, height: 13, color: "#2dd4bf" }} />,
  lead:    <Users style={{ width: 13, height: 13, color: "#60a5fa" }} />,
  content: <Sparkles style={{ width: 13, height: 13, color: "#f472b6" }} />,
};

export function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setLastPrompt(prompt);
    setIsProcessing(true);
    setAiOutput(null);
    await new Promise(r => setTimeout(r, simMode ? 700 : 1000));
    setAiOutput(getAIOutput(prompt));
    setIsProcessing(false);
    setPrompt("");
  };

  const handleConfirm = () => {
    setAiOutput(null);
    showToast("Actions queued — AI Employee is executing…", "success");
  };

  const handleEditPrompt = () => {
    setPrompt(lastPrompt);
    setAiOutput(null);
  };

  const hotLeads = leads.filter(l => l.status === "hot").length;
  const activeClients = clients.filter(c => c.status === "active").length;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1080, margin: "0 auto" }}>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 28 }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: clr.text1, letterSpacing: "-0.025em", marginBottom: 4 }}>
          {greeting}, Vijay
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13, color: clr.text4 }}>
            {metrics.activeAutomations} automations running · {hotLeads} hot leads · {activeClients} active clients
          </p>
          {/* Compact stat pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Pipeline",   value: "$55.7k", color: "#60a5fa"  },
              { label: "Unpaid",     value: "$16.3k", color: "#fbbf24"  },
              { label: "Tasks",      value: String(metrics.clientTasks), color: "#a78bfa" },
              { label: "Follow-ups", value: String(metrics.pendingFollowUps), color: "#fb923c" },
            ].map(s => (
              <span
                key={s.label}
                style={{ fontSize: 11, fontWeight: 600, color: s.color, background: `${s.color}12`, border: `1px solid ${s.color}22`, borderRadius: 20, padding: "3px 10px" }}
              >
                {s.value} {s.label}
              </span>
            ))}
          </div>
          <div
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: clr.success, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 20, padding: "4px 12px" }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: clr.success }} />
            AI Online
          </div>
        </div>
      </motion.div>

      {/* ── AI Command Center — HERO ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          background: "rgba(124,58,237,0.035)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 18,
          padding: "28px 28px 22px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.08) 0%, transparent 55%)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, position: "relative" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.35)", flexShrink: 0 }}>
            <Bot style={{ width: 18, height: 18, color: "white" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: clr.text1, letterSpacing: "-0.02em" }}>AI Command Center</div>
            <div style={{ fontSize: 12, color: clr.text4, marginTop: 2 }}>Tell your AI employee what to do — it plans, drafts, and executes</div>
          </div>
          <button
            onClick={() => setSimMode(!simMode)}
            style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
              background: simMode ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${simMode ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.08)"}`,
              color: simMode ? "#fbbf24" : clr.text4,
            }}
          >
            <Eye style={{ width: 12, height: 12 }} />
            {simMode ? "Simulate ON" : "Simulate"}
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleExecute(); } }}
          placeholder={simMode
            ? "Preview what AI will do... e.g. 'Follow up with all warm leads'"
            : "Tell me what to do... e.g. 'Send invoice reminders' or 'Generate weekly report'"}
          rows={3}
          style={{
            width: "100%", fontSize: 14, color: clr.text1, resize: "none", outline: "none", fontFamily: "inherit", fontWeight: 500, lineHeight: 1.6,
            background: "var(--clr-input-bg)", border: "1px solid var(--clr-input-border)", borderRadius: 12, padding: "14px 16px",
            transition: "border-color 0.15s, background 0.15s", boxSizing: "border-box", position: "relative",
          }}
          onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,0.45)"; e.target.style.background = "var(--clr-input-bg)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--clr-input-border)"; e.target.style.background = "var(--clr-input-bg)"; }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, position: "relative" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {aiSuggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setPrompt(s)}
                style={{ fontSize: 11, color: clr.text4, background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 20, padding: "4px 12px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.28)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--clr-card)"; e.currentTarget.style.borderColor = "var(--clr-border)"; e.currentTarget.style.color = clr.text4; }}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={isProcessing}
            onClick={handleExecute}
            icon={simMode ? <Eye style={{ width: 13, height: 13 }} /> : <Send style={{ width: 13, height: 13 }} />}
          >
            {simMode ? "Preview" : "Execute"}
          </Button>
        </div>

        <AnimatePresence>
          {aiOutput && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 16, overflow: "hidden" }}
            >
              <div style={{ background: "var(--clr-card)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot style={{ width: 11, height: 11, color: "#a78bfa" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>
                      {simMode ? "Simulation Preview" : "AI Employee Response"}
                    </span>
                    {simMode && <Badge variant="warning">Preview</Badge>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: clr.text4 }}>
                    <Target style={{ width: 11, height: 11 }} />
                    {aiOutput.confidence}% confidence
                  </div>
                </div>
                <p style={{ fontSize: 13, color: clr.text2, fontWeight: 500, marginBottom: 12, lineHeight: 1.6 }}>{aiOutput.summary}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {aiOutput.actions.map((action, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: clr.text3, lineHeight: 1.6 }}
                    >
                      <ChevronRight style={{ width: 12, height: 12, color: "#7c3aed", flexShrink: 0, marginTop: 2 }} />
                      {action}
                    </motion.div>
                  ))}
                </div>
                {!simMode && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--clr-border)" }}>
                    <Button variant="primary" size="sm" icon={<CheckCircle style={{ width: 13, height: 13 }} />} onClick={handleConfirm}>Confirm & Execute</Button>
                    <Button variant="ghost" size="sm" onClick={handleEditPrompt}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => setAiOutput(null)}>Cancel</Button>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: clr.text4 }}>
                      <FileCheck style={{ width: 11, height: 11 }} />
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

        {/* Live AI Activity */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: clr.text2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Live Activity</span>
            <Badge variant="purple" dot pulse>Live</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", transition: "background 0.12s", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--clr-border)" : "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--clr-card)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 8, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {activityIcons[a.icon]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: clr.text2, lineHeight: 1.5 }}>{a.message}</p>
                  <p style={{ fontSize: 10, color: clr.text4, marginTop: 2 }}>{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: clr.text2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Needs Attention</span>
            <Badge variant="warning">4 items</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Meridian Group",          detail: "Client health 45% — project at risk",      type: "danger"  as const, action: "Recover" },
              { label: "Apex Digital invoice",    detail: "Overdue 12 days — $4,500 unpaid",           type: "warning" as const, action: "Remind"  },
              { label: "Alex Thompson follow-up", detail: "Hot lead — no response in 30 minutes",      type: "warning" as const, action: "Follow up" },
              { label: "Weekly reports",          detail: "3 clients haven't received status updates", type: "default" as const, action: "Generate" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.06 }}
                className="group"
                style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", transition: "background 0.12s", background: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--clr-card)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <AlertCircle
                  style={{ width: 13, height: 13, marginTop: 2, flexShrink: 0, color: item.type === "danger" ? clr.danger : item.type === "warning" ? clr.warning : clr.text4 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: clr.text2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: clr.text4, marginTop: 2 }}>{item.detail}</div>
                </div>
                <Button variant="ghost" size="xs" style={{ opacity: 0.6, fontSize: 11, color: "#a78bfa", flexShrink: 0 }}
                  onClick={() => {
                    const toasts: Record<string, string> = {
                      "Recover": "Opening Meridian Group recovery plan…",
                      "Remind": "Sending overdue invoice reminder to Apex Digital…",
                      "Follow up": "Drafting personalised follow-up for Alex Thompson…",
                      "Generate": "Generating status reports for 3 clients…",
                    };
                    showToast(toasts[item.action] || `${item.action} — processing…`, "info");
                  }}>
                  {item.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
