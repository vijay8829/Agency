"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Download, Bot, Sparkles, Calendar, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, clr } from "@/lib/ds";

const weeklyData = [
  { day: "Mon", leads: 3, tasks: 8  },
  { day: "Tue", leads: 5, tasks: 12 },
  { day: "Wed", leads: 2, tasks: 7  },
  { day: "Thu", leads: 8, tasks: 15 },
  { day: "Fri", leads: 6, tasks: 11 },
  { day: "Sat", leads: 1, tasks: 3  },
  { day: "Sun", leads: 0, tasks: 1  },
];
const maxLeads = Math.max(...weeklyData.map(d => d.leads));
const maxTasks = Math.max(...weeklyData.map(d => d.tasks));

const PERIODS = ["This Week", "Last Week", "This Month", "Last Month"];

const REPORTS: Record<string, string> = {
  "This Week": `WEEKLY BUSINESS SUMMARY — Week of Nov 18–24, 2024

LEADS & SALES
• 12 new leads captured (+3 from last week)
• 2 hot leads (Alex Thompson $22k, Marcus Rivera $14.2k) — follow-up recommended
• Pipeline value this week: $55,700
• Conversion rate: 18% (up from 14%)

CLIENT HEALTH
• Nova Commerce: 95% — Excellent
• Apex Digital: 90% — On track
• Vanta Labs: 78% — Monitor closely
• Meridian Group: 45% — Immediate attention needed

REVENUE & INVOICES
• $16,250 in outstanding invoices (4 invoices)
• 2 overdue: Apex Digital ($4,500 · 12 days), Vanta Labs ($8,750 · 7 days)
• Revenue collected this week: $9,200

AI PRODUCTIVITY
• 47 tasks completed automatically
• 18 AI-generated emails sent
• 7 automations running
• Estimated time saved: 14 hours

RECOMMENDED ACTIONS
1. Follow up with Marcus Rivera (Grow Media) — hot lead
2. Schedule check-in with Meridian Group immediately
3. Send escalation to Apex Digital for overdue invoice
4. Generate Q4 content calendar for Nova Commerce`,

  "Last Week": `WEEKLY BUSINESS SUMMARY — Week of Nov 11–17, 2024

LEADS & SALES
• 9 new leads captured (-2 from prior week)
• 1 hot lead (James Liu $18k) — closed during week
• Pipeline value: $43,200
• Conversion rate: 14%

CLIENT HEALTH
• Nova Commerce: 92% — On track
• Apex Digital: 88% — Minor delays
• Vanta Labs: 72% — Needs attention
• Meridian Group: 58% — At risk

REVENUE & INVOICES
• $12,800 in outstanding invoices (3 invoices)
• 1 overdue: Vanta Labs ($8,750 · 0 days)
• Revenue collected: $14,500

AI PRODUCTIVITY
• 39 tasks completed automatically
• 14 AI-generated emails sent
• 7 automations running
• Estimated time saved: 11 hours`,

  "This Month": `MONTHLY BUSINESS SUMMARY — November 2024

LEADS & SALES
• 48 new leads captured
• Pipeline value: $212,000
• 6 deals closed — $67,500 revenue
• Conversion rate: 16%

CLIENT HEALTH
• 3/4 clients healthy (75% rate)
• Average health score: 77/100
• 1 at-risk client (Meridian Group)

REVENUE & INVOICES
• $29,050 outstanding
• Revenue collected: $38,700
• Month-over-month growth: +23%

AI PRODUCTIVITY
• 183 tasks automated
• 72 AI-generated emails
• 7 active automations
• Time saved: 52 hours`,

  "Last Month": `MONTHLY BUSINESS SUMMARY — October 2024

LEADS & SALES
• 41 new leads captured
• Pipeline value: $178,000
• 5 deals closed — $54,800 revenue
• Conversion rate: 14%

CLIENT HEALTH
• 4/4 clients healthy (100% rate)
• Average health score: 84/100

REVENUE & INVOICES
• $21,200 outstanding
• Revenue collected: $31,500
• Month-over-month growth: +8%

AI PRODUCTIVITY
• 156 tasks automated
• 61 AI-generated emails
• 6 active automations
• Time saved: 44 hours`,
};

const TEMPLATES = [
  { name: "Weekly Business Summary",  icon: BarChart3,  desc: "Leads, revenue, tasks, health", period: "This Week"   },
  { name: "Client Status Report",     icon: TrendingUp, desc: "All clients in one view",       period: "This Month"  },
  { name: "Sales Pipeline Report",    icon: TrendingUp, desc: "Lead funnel and conversions",   period: "This Week"   },
  { name: "Invoice & Revenue Report", icon: TrendingUp, desc: "Outstanding and collected",     period: "This Month"  },
  { name: "Content Performance",      icon: BarChart3,  desc: "Posts, engagement, reach",      period: "Last Week"   },
  { name: "Automation Report",        icon: BarChart3,  desc: "Workflows and time saved",      period: "Last Month"  },
];

export function Reports() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [period, setPeriod] = useState("This Week");
  const [showPeriods, setShowPeriods] = useState(false);

  const handleGenerate = async (p = period) => {
    setGenerating(true);
    setReport(null);
    await new Promise(r => setTimeout(r, 1800));
    setReport(REPORTS[p] || REPORTS["This Week"]);
    setGenerating(false);
  };

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agency-report-${period.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReport = () => {
    if (report) { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Reports & Analytics</h2>
          <p style={PAGE_SUB}>AI-generated business intelligence and actionable insights</p>
        </div>
        <div className="flex items-center gap-2" style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Button variant="outline" size="sm" icon={<Calendar style={{ width: 13, height: 13 }} />}
              onClick={() => setShowPeriods(v => !v)}>
              {period}
            </Button>
            {showPeriods && (
              <div style={{ position: "absolute", top: 36, right: 0, zIndex: 100, background: "var(--clr-panel-bg)", border: `1px solid ${clr.border}`, borderRadius: 10, overflow: "hidden", minWidth: 140 }}>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => { setPeriod(p); setShowPeriods(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 13, color: p === period ? clr.accentLight : clr.text2, background: p === period ? "rgba(124,58,237,0.08)" : "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={e => { if (p !== period) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (p !== period) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="primary" size="sm" icon={<Sparkles style={{ width: 13, height: 13 }} />} loading={generating} onClick={() => handleGenerate(period)}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Leads",        value: "25",     change: "+20%", up: true  },
          { label: "Revenue Pipeline",   value: "$55.7k", change: "+12%", up: true  },
          { label: "Tasks Completed",    value: "47",     change: "+8%",  up: true  },
          { label: "Client Health Avg",  value: "77%",    change: "−5%",  up: false },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: clr.text3, marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: clr.text1, letterSpacing: "-0.03em", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, marginTop: 6, color: kpi.up ? clr.success : clr.danger, fontWeight: 500 }}>
                {kpi.up ? <TrendingUp style={{ width: 12, height: 12 }} /> : <TrendingDown style={{ width: 12, height: 12 }} />}
                {kpi.change} vs last week
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 14, padding: "20px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>Weekly Activity</span>
          <div style={{ display: "flex", gap: 14 }}>
            {[{ color: "#7c3aed", label: "Leads" }, { color: clr.success, label: "Tasks" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: clr.text3 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          {weeklyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
                {[
                  { value: d.leads, max: maxLeads, color: "#7c3aed" },
                  { value: d.tasks, max: maxTasks, color: clr.success },
                ].map((bar, j) => (
                  <div key={j} style={{ width: 12, height: 60, background: "var(--clr-card-hover)", borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(bar.value / bar.max) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 + j * 0.08, ease: "easeOut" }}
                      style={{ width: "100%", background: bar.color, borderRadius: 4 }}
                    />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 10, color: clr.text4 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Generated Report */}
      <AnimatePresence>
        {(generating || report) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: 28 }}>
            <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 14, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bot style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AI Report — {period}</span>
                  {report && <Badge variant="purple" dot>Generated</Badge>}
                </div>
                {report && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button variant="ghost" size="sm" icon={copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />} onClick={copyReport}>
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="secondary" size="sm" icon={<Download style={{ width: 12, height: 12 }} />} onClick={handleExport}>
                      Export
                    </Button>
                  </div>
                )}
              </div>
              {generating ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: clr.text3, fontSize: 13 }}>
                  <div style={{ width: 14, height: 14, border: "1.5px solid rgba(124,58,237,0.3)", borderTopColor: clr.accent, borderRadius: "50%" }} className="spin" />
                  AI compiling business data…
                </div>
              ) : (
                <pre style={{ fontSize: 12, color: clr.text2, whiteSpace: "pre-wrap", fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace", lineHeight: 1.75, margin: 0, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "14px 16px", border: `1px solid ${clr.border}` }}>
                  {report}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates */}
      <div style={SECTION_LABEL}>Report Templates</div>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t, i) => {
          const Icon = t.icon;
          return (
            <button key={i} onClick={() => handleGenerate(t.period)}
              style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${clr.border}`, background: clr.card, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = clr.cardHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; (e.currentTarget as HTMLButtonElement).style.background = clr.card; }}>
              <Icon style={{ width: 15, height: 15, color: clr.text4, marginBottom: 8 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: clr.text2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: clr.text4, marginTop: 3 }}>{t.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
