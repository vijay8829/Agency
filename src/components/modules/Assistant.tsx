"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, User, RotateCcw, Target,
  CheckCircle, ArrowRight, Zap, Copy, ThumbsUp, Gauge
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { aiSuggestions } from "@/lib/data";

type OutputMode = "fast" | "detail" | "executive";

interface ActionItem { text: string; type: "success" | "warning" | "info" | "action" }
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: ActionItem[];
  confidence?: number;
  executionSteps?: string[];
  outputMode?: OutputMode;
}

const OUTPUT_MODES: { id: OutputMode; label: string; desc: string }[] = [
  { id: "fast",      label: "⚡ Fast",      desc: "Top action only, no fluff" },
  { id: "detail",    label: "Detail",       desc: "Full breakdown with execution plan" },
  { id: "executive", label: "Executive",    desc: "Board-level numbers, no jargon" },
];

const aiKnowledge: Array<{ keywords: string[]; content: string; actions: ActionItem[]; confidence: number; executionSteps?: string[]; executiveSummary?: string }> = [
  {
    keywords: ["lead", "leads", "follow", "warm", "hot", "pipeline"],
    content: "I've analysed your full lead pipeline. Here's the situation and my recommended actions:",
    executiveSummary: "Pipeline: $46.2k at risk. 2 hot leads need action within 2 hours to avoid drop-off. Conversion forecast: +23% with AI follow-up.",
    confidence: 94,
    actions: [
      { text: "🔥 Alex Thompson (NextWave, $22k) — hot lead, contacted 30min ago. Draft proposal NOW before they shop around.", type: "warning" },
      { text: "🔥 Marcus Rivera (Grow Media, $14.2k) — hot, last contact 5h ago. Personalised follow-up drafted and ready.", type: "warning" },
      { text: "🌡️ Jordan Lee (Flux Creative, $6.8k) — warm. Gentle nudge email scheduled for tomorrow 9am.", type: "info" },
      { text: "❄️  Priya Patel (Bloom Agency, $3.2k) — cold. Re-engagement sequence activated (5-email drip).", type: "info" },
    ],
    executionSteps: ["Pull lead data from CRM", "Score each lead by recency + value", "Draft personalised emails", "Queue send schedule", "Create CRM follow-up tasks"],
  },
  {
    keywords: ["invoice", "payment", "overdue", "unpaid", "money", "revenue"],
    content: "Outstanding invoice analysis complete. $16,250 across 4 clients. Here's what I'm doing:",
    executiveSummary: "$16,250 outstanding. 2 accounts overdue 7–12 days. Recovery probability: 87%. Expected cash recovery this week: $13,250.",
    confidence: 98,
    actions: [
      { text: "🚨 Apex Digital — $4,500 overdue 12 days. Escalation email drafted with payment link + interest notice.", type: "warning" },
      { text: "⚠️  Vanta Labs — $8,750 overdue 7 days. Firm second reminder with project pause warning drafted.", type: "warning" },
      { text: "📩 Meridian Group — $2,800 due in 3 days. Polite first reminder sent automatically.", type: "success" },
      { text: "📩 Nova Commerce — $1,200 due today. Friendly reminder delivered at 9am.", type: "success" },
    ],
    executionSteps: ["Scan all invoices for status", "Age each invoice", "Tier message by urgency", "Personalise per client relationship", "Log all sends to audit trail"],
  },
  {
    keywords: ["client", "clients", "health", "status", "risk", "retention"],
    content: "Client portfolio health scan complete. Here's your full picture:",
    executiveSummary: "Portfolio: 4 clients. 2 healthy, 1 at risk, 1 CRITICAL (Meridian Group). Churn risk: $3,200 MRR. Recommended: emergency call today.",
    confidence: 96,
    actions: [
      { text: "✅ Nova Commerce — 95% health. On track. Monthly report auto-generating.", type: "success" },
      { text: "✅ Apex Digital — 90% health. Strong. Design review call booked for tomorrow.", type: "success" },
      { text: "⚠️  Vanta Labs — 78% health. Monitor. Wireframe delivery reminder sent.", type: "info" },
      { text: "🚨 Meridian Group — 45% health. CRITICAL. Recovery plan drafted. Call scheduling now.", type: "warning" },
    ],
    executionSteps: ["Pull latest task completion rates", "Measure communication frequency", "Score satisfaction signals", "Generate health index", "Flag at-risk accounts"],
  },
  {
    keywords: ["report", "summary", "week", "weekly", "overview", "analytics"],
    content: "Weekly business summary ready. Executive snapshot:",
    executiveSummary: "WoW: Leads +3 · Revenue $9.2k collected · 14h of work automated · 1 client at critical risk. Net outlook: caution on cash flow.",
    confidence: 100,
    actions: [
      { text: "📊 Leads: 12 new (+3 vs last week) · Pipeline value: $55,700 · 2 hot needing action", type: "info" },
      { text: "💰 Revenue: $9,200 collected · $16,250 outstanding · Overdue ratio: 29%", type: "warning" },
      { text: "⚡ AI: 47 tasks completed · 7 automations · ~14 hours of work saved this week", type: "success" },
      { text: "🎯 Priority: Meridian Group (client risk) + invoice recovery ($13.25k overdue)", type: "warning" },
    ],
    executionSteps: ["Aggregate all module data", "Calculate week-over-week deltas", "Identify top 3 risks", "Format executive summary", "Prepare PDF export"],
  },
  {
    keywords: ["content", "social", "post", "campaign", "email", "copy"],
    content: "Content audit complete. Here's your content pipeline status:",
    executiveSummary: "2 pieces ready to publish. 1 pending your approval. 1 AI generating now. Suggest: batch October wrap-ups for all clients in 60s.",
    confidence: 89,
    actions: [
      { text: "✅ 2 content pieces READY — Q4 calendar (Nova Commerce) + LinkedIn posts (Apex Digital).", type: "success" },
      { text: "⚠️  1 in REVIEW — Vanta Labs landing page copy. Needs your approval.", type: "warning" },
      { text: "📝 1 in DRAFT — Meridian Group email newsletter. AI completing now.", type: "info" },
      { text: "💡 Suggestion: Create October wrap-up posts for all 4 clients — I can generate all in 60 seconds.", type: "action" },
    ],
    executionSteps: ["Audit content library", "Check scheduled posts", "Review approval queue", "Identify gaps", "Generate suggestions"],
  },
  {
    keywords: ["automation", "workflow", "automate", "automatic", "trigger"],
    content: "Automation system overview — all active flows and performance:",
    executiveSummary: "7 automations active. 360 total executions. 14 hrs/month saved. Top ROI: Lead Follow-Up (+23% conversion). 1 paused — needs calendar reconnect.",
    confidence: 92,
    actions: [
      { text: "⚡ 7 automations running · 360 total executions · 14 hrs saved this month", type: "success" },
      { text: "🔄 Top performer: Lead Follow-Up Sequence (142 runs, 23% conversion lift)", type: "success" },
      { text: "⏸️  Paused: Meeting Recap Generator — reconnect your calendar to re-enable", type: "warning" },
      { text: "💡 Recommended new flow: 'Project milestone hit → Client celebration email' (~2 hrs saved/week)", type: "action" },
    ],
    executionSteps: ["Check all automation statuses", "Pull execution counts", "Calculate time saved", "Identify bottlenecks", "Recommend new flows"],
  },
  {
    keywords: ["proposal", "generate", "create", "draft", "quote"],
    content: "Proposal generation initiated. Here's what I'm building:",
    executiveSummary: "Generating: Alex Thompson (NextWave, $22k). Est. completion 45s. Includes exec summary, scoped deliverables, 3 pricing tiers, ROI projections.",
    confidence: 87,
    actions: [
      { text: "📄 Target: Alex Thompson, NextWave Studios — best match based on recent hot signal.", type: "info" },
      { text: "🔍 Pulling: Company profile, industry benchmarks, your past similar projects.", type: "info" },
      { text: "✍️  Writing: Executive summary, detailed scope, 3 pricing tiers, ROI projections.", type: "info" },
      { text: "📬 Estimated completion: 45 seconds. I'll alert you to review before sending.", type: "action" },
    ],
    executionSteps: ["Identify best target lead", "Pull company intelligence", "Match against service catalogue", "Generate tiered pricing", "Format professional PDF"],
  },
  {
    keywords: ["health", "score", "business", "performance", "kpi"],
    content: "Business health analysis complete. Your AI-scored performance index:",
    executiveSummary: "Health Score: 78/100 (benchmark: 65). Revenue flow dragging (-12 pts). Fix invoices + stabilise Meridian → 90+ score in 2 weeks.",
    confidence: 95,
    actions: [
      { text: "🏆 Overall Score: 78/100 — Above industry average (benchmark: 65)", type: "info" },
      { text: "💪 Strengths: Automation coverage (90) + Response time (88) + Lead volume (82)", type: "success" },
      { text: "⚠️  Weaknesses: Revenue flow (58) dragged by overdue invoices — fix = +12 pts", type: "warning" },
      { text: "🎯 To hit 90+: Recover invoices + stabilise Meridian + add 2 automations", type: "action" },
    ],
    executionSteps: ["Score 6 business dimensions", "Weight by business impact", "Compare to benchmarks", "Identify improvement paths", "Project score after fixes"],
  },
];

function getAIResponse(input: string) {
  const lower = input.toLowerCase();
  const match = aiKnowledge.find(k => k.keywords.some(kw => lower.includes(kw)));
  return match ?? {
    content: "I'm scanning your full business context to find the best answer...",
    executiveSummary: "Context loaded. Ask me about leads, invoices, clients, automations, or reports.",
    confidence: 75,
    actions: [
      { text: "🔍 Checking leads, clients, invoices, content, and automations", type: "info" as const },
      { text: "🤖 AI Employee processing — I handle leads, clients, invoices, content, reports, automations", type: "info" as const },
      { text: "💡 Try: 'follow up leads', 'invoice reminders', 'client health', 'weekly report'", type: "action" as const },
    ],
    executionSteps: undefined,
  };
}

function AIMessage({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const mode = msg.outputMode ?? "detail";

  const copyText = () => {
    const text = [msg.content, ...(msg.actions?.map(a => a.text) || [])].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const visibleActions = mode === "fast" ? msg.actions?.slice(0, 1) : msg.actions;
  const showSteps = mode === "detail" && msg.executionSteps;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      {/* Avatar */}
      <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}>
        <Bot style={{ width: 14, height: 14, color: "white" }} />
      </div>

      {/* Content — flows freely, no box */}
      <div style={{ flex: 1, maxWidth: "88%" }}>
        {/* Mode / confidence line */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          {mode === "fast" && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 20, padding: "2px 8px" }}>⚡ Fast</span>
          )}
          {mode === "executive" && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 20, padding: "2px 8px" }}>Executive</span>
          )}
          {msg.confidence && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Target style={{ width: 11, height: 11, color: "#7c3aed" }} />
              <div style={{ width: 60, height: 3, background: "var(--clr-card-hover)", borderRadius: 3, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${msg.confidence}%` }}
                  transition={{ duration: 0.6 }}
                  style={{ height: "100%", background: "#7c3aed", borderRadius: 3 }}
                />
              </div>
              <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600 }}>{msg.confidence}%</span>
            </div>
          )}
        </div>

        {/* Main content */}
        {mode === "executive" && (msg as Message & { executiveSummary?: string }).executiveSummary ? (
          <p style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd", borderLeft: "2px solid rgba(96,165,250,0.4)", paddingLeft: 12, lineHeight: 1.65, marginBottom: 12 }}>
            {(msg as Message & { executiveSummary?: string }).executiveSummary}
          </p>
        ) : (
          <p style={{ fontSize: 14, color: "var(--clr-text2)", lineHeight: 1.7, marginBottom: 12, fontWeight: 400 }}>{msg.content}</p>
        )}

        {/* Fast mode — single line */}
        {mode === "fast" && visibleActions && visibleActions.length > 0 && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.6, padding: "10px 14px", borderRadius: 10, borderLeft: "3px solid",
            borderLeftColor: visibleActions[0].type === "warning" ? "rgba(251,191,36,0.5)" : visibleActions[0].type === "success" ? "rgba(52,211,153,0.5)" : "rgba(124,58,237,0.5)",
            background: visibleActions[0].type === "warning" ? "rgba(251,191,36,0.05)" : visibleActions[0].type === "success" ? "rgba(52,211,153,0.05)" : "rgba(124,58,237,0.05)",
            color: visibleActions[0].type === "warning" ? "#fde68a" : visibleActions[0].type === "success" ? "#6ee7b7" : "#c4b5fd",
          }}>
            <Zap style={{ width: 13, height: 13, flexShrink: 0, marginTop: 2, opacity: 0.7 }} />
            <span style={{ fontWeight: 500 }}>{visibleActions[0].text}</span>
          </div>
        )}

        {/* Detail / Executive — action list */}
        {mode !== "fast" && visibleActions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {visibleActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, lineHeight: 1.6, padding: "8px 12px", borderRadius: 9, borderLeft: "2px solid",
                  borderLeftColor: action.type === "warning" ? "rgba(251,191,36,0.4)" : action.type === "success" ? "rgba(52,211,153,0.4)" : action.type === "action" ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                  background: action.type === "warning" ? "rgba(251,191,36,0.04)" : action.type === "success" ? "rgba(52,211,153,0.04)" : action.type === "action" ? "rgba(124,58,237,0.04)" : "var(--clr-card)",
                  color: action.type === "warning" ? "#fde68a" : action.type === "success" ? "#6ee7b7" : action.type === "action" ? "#c4b5fd" : "#a1a1aa",
                }}
              >
                <ArrowRight style={{ width: 12, height: 12, flexShrink: 0, marginTop: 3, opacity: 0.6 }} />
                <span>{action.text}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Execution steps — detail only */}
        {showSteps && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--clr-border)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--clr-text4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Execution Plan</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {msg.executionSteps!.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--clr-text4)", background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 20, padding: "2px 9px" }}>{step}</span>
                  {i < msg.executionSteps!.length - 1 && <ArrowRight style={{ width: 10, height: 10, color: "var(--clr-text4)" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 10, color: "var(--clr-text4)" }}>{msg.timestamp}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            <button onClick={copyText} style={{ width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--clr-text4)", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text4)"; }}>
              {copied ? <CheckCircle style={{ width: 12, height: 12, color: "#34d399" }} /> : <Copy style={{ width: 12, height: 12 }} />}
            </button>
            <button onClick={() => setLiked(!liked)} style={{ width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: liked ? "#a78bfa" : "#3f3f46", transition: "color 0.15s" }}>
              <ThumbsUp style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Assistant() {
  const [outputMode, setOutputMode] = useState<OutputMode>("detail");
  const [messages, setMessages] = useState<Message[]>([{
    id: "0",
    role: "assistant",
    outputMode: "detail",
    content: "Hello, I'm your AI Employee. I have full context of your business — 5 leads, 4 clients, 4 invoices, 7 automations. I can analyse, draft, send, and execute tasks across every module. What should I handle first?",
    timestamp: "Just now",
    actions: [
      { text: "💡 Try: 'Follow up with all warm leads'", type: "action" },
      { text: "💡 Try: 'Show me my weekly business summary'", type: "action" },
      { text: "💡 Try: 'Send invoice reminders to overdue clients'", type: "action" },
    ],
    confidence: 100,
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || isTyping) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content, timestamp: "Just now" }]);
    setInput("");
    setIsTyping(true);
    const delay = outputMode === "fast" ? 500 : outputMode === "executive" ? 900 : 1100;
    await new Promise(r => setTimeout(r, delay + Math.random() * 400));
    setIsTyping(false);
    const resp = getAIResponse(content);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: resp.content,
      timestamp: "Just now",
      actions: resp.actions,
      confidence: resp.confidence,
      executionSteps: resp.executionSteps,
      outputMode,
      executiveSummary: (resp as typeof resp & { executiveSummary?: string }).executiveSummary,
    } as Message & { executiveSummary?: string }]);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0" style={{ borderColor: "var(--clr-border)", background: "var(--clr-panel-bg)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center glow-purple">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 tracking-tight">AI Employee</div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b7b]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-dot" />
              Online · Full business context loaded
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Output mode switcher */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-lg p-0.5">
            <Gauge className="w-3 h-3 text-[#4a4a5a] ml-1.5 mr-0.5" />
            {OUTPUT_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setOutputMode(m.id)}
                title={m.desc}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                  outputMode === m.id
                    ? m.id === "fast"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : m.id === "executive"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-[#4a4a5a] hover:text-zinc-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Badge variant="purple">GPT-4 Turbo</Badge>
          <Badge variant="success" dot>Live Data</Badge>
          <button
            onClick={() => setMessages([{
              id: "0", role: "assistant", timestamp: "Just now", confidence: 100, outputMode,
              content: "Conversation cleared. I still have full context of your business. What would you like me to handle?",
              actions: [{ text: "💡 Ask me anything about your leads, clients, invoices, or automations", type: "action" }],
            }])}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-[#4a4a5a] hover:text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode context bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={outputMode}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`px-6 py-1.5 border-b flex items-center gap-2 flex-shrink-0 ${
            outputMode === "fast"
              ? "bg-amber-500/[0.04] border-amber-500/[0.08]"
              : outputMode === "executive"
              ? "bg-sky-500/[0.04] border-sky-500/[0.08]"
              : "bg-violet-500/[0.03] border-white/[0.04]"
          }`}
        >
          <span className={`text-[11px] font-medium ${
            outputMode === "fast" ? "text-amber-400" : outputMode === "executive" ? "text-sky-400" : "text-violet-400"
          }`}>
            {outputMode === "fast" && "⚡ Fast mode — top priority action only, instant response"}
            {outputMode === "detail" && "Detail mode — full breakdown with execution plan"}
            {outputMode === "executive" && "Executive mode — board-level TL;DR, key numbers only"}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {msg.role === "assistant" ? (
                <AIMessage msg={msg} />
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: "row-reverse" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User style={{ width: 14, height: 14, color: "var(--clr-text2)" }} />
                  </div>
                  <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ background: "rgba(124,58,237,0.85)", color: "white", padding: "9px 14px", borderRadius: "16px 4px 16px 16px", fontSize: 14, fontWeight: 400, lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: "var(--clr-text4)", paddingRight: 2 }}>{msg.timestamp}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed" }}
                />
              ))}
              <span style={{ fontSize: 12, color: "var(--clr-text3)", marginLeft: 4 }}>
                {outputMode === "fast" ? "AI processing..." : outputMode === "executive" ? "Generating executive summary..." : "AI analysing..."}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-6 py-2 flex items-center gap-1.5 flex-wrap border-t flex-shrink-0" style={{ borderColor: "var(--clr-border)" }}>
        {aiSuggestions.slice(0, 4).map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            className="text-[11px] text-[#6b6b7b] hover:text-violet-400 bg-white/[0.03] hover:bg-violet-500/[0.08] border border-white/[0.06] hover:border-violet-500/[0.2] px-2.5 py-1 rounded-full transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "8px 24px 20px", flexShrink: 0 }}>
        <div
          style={{ display: "flex", alignItems: "flex-end", gap: 12, background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 16, padding: "12px 14px", transition: "border-color 0.15s" }}
          onFocusCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.4)"; }}
          onBlurCapture={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--clr-border)"; }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask your AI employee anything — it has full business context..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 14, color: "var(--clr-text1)", fontFamily: "inherit", fontWeight: 400, lineHeight: 1.6, maxHeight: 120, minHeight: 38 }}
            rows={1}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            icon={<Send style={{ width: 13, height: 13 }} />}
          >
            Send
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingLeft: 4 }}>
          <Zap style={{ width: 11, height: 11, color: "var(--clr-text4)" }} />
          <span style={{ fontSize: 10, color: "var(--clr-text4)" }}>Enter to send · Shift+Enter for new line · AI has full context of your business</span>
        </div>
      </div>
    </div>
  );
}
