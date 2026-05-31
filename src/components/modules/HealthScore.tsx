"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Zap, Bot, ArrowRight, Target, Clock,
  DollarSign, Users, Lightbulb, ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const dimensions = [
  { label: "Lead Pipeline",      score: 82, weight: 20, icon: Users,       trend: +5, insight: "2 hot leads need follow-up within 24h to avoid cooling down" },
  { label: "Client Retention",   score: 71, weight: 25, icon: CheckCircle, trend: -4, insight: "Meridian Group at 45% health — schedule recovery call today" },
  { label: "Revenue Flow",       score: 58, weight: 25, icon: DollarSign,  trend: -8, insight: "$16.3k outstanding — overdue invoices dragging score down" },
  { label: "Automation Coverage",score: 90, weight: 15, icon: Zap,         trend: +2, insight: "7 automations saving ~14hrs/week — add meeting recap flow" },
  { label: "Content Consistency",score: 74, weight: 10, icon: Activity,    trend: +1, insight: "Nova Commerce and Apex Digital due for monthly content" },
  { label: "Response Time",      score: 88, weight: 5,  icon: Clock,       trend: 0,  insight: "Average lead response time: 18 min — industry best is <5 min" },
];

const overallScore = Math.round(
  dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
);

const opportunities = [
  {
    id: "1",
    title: "Invoice Recovery Sequence",
    impact: "High",
    timeSaved: "3 hrs/week",
    revenueSaved: "$16,300",
    effort: "5 min to set up",
    description: "Auto-send escalating reminders to 2 overdue clients. Historically recovers 80% of late payments within 7 days.",
    simulation: "Day 1: Friendly reminder → Day 4: Firm reminder + interest notice → Day 7: Final notice + payment link",
    roi: "340%",
  },
  {
    id: "2",
    title: "Meridian Group Recovery Plan",
    impact: "Critical",
    timeSaved: "2 hrs",
    revenueSaved: "$8,400",
    effort: "AI-generated",
    description: "Client health dropped 23% in 30 days. AI recommends: status call + re-scope + satisfaction survey.",
    simulation: "AI drafts recovery email → Books check-in call → Generates revised timeline → Sends satisfaction survey",
    roi: "∞",
  },
  {
    id: "3",
    title: "Hot Lead 24h Blitz",
    impact: "High",
    timeSaved: "4 hrs/week",
    revenueSaved: "$36,200",
    effort: "1-click",
    description: "Alex Thompson ($22k) and Marcus Rivera ($14.2k) are hot — AI closes faster when contacted within 1 hour.",
    simulation: "AI personalises intro → Books discovery call → Sends proposal draft → Creates CRM entry automatically",
    roi: "220%",
  },
];

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="6" style={{ stroke: "var(--clr-border)" }} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  );
}

export function HealthScore() {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<Record<string, string>>({});
  const [activating, setActivating] = useState<string | null>(null);
  const [activated, setActivated] = useState<Set<string>>(new Set());

  const runSimulation = async (id: string) => {
    setSimulating(id);
    await new Promise(r => setTimeout(r, 1600));
    const opp = opportunities.find(o => o.id === id);
    setSimulationResult(prev => ({ ...prev, [id]: opp?.simulation || "" }));
    setSimulating(null);
  };

  const activate = async (id: string) => {
    setActivating(id);
    await new Promise(r => setTimeout(r, 1000));
    setActivated(prev => new Set([...prev, id]));
    setActivating(null);
  };

  const scoreColor = overallScore >= 80 ? "text-emerald-400" : overallScore >= 60 ? "text-amber-400" : "text-red-400";
  const scoreLabel = overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Needs Attention" : "Critical";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Business Health Score</h2>
          <p className="text-sm text-[#8b8b9a] mt-0.5">AI-powered analysis of your entire agency operation</p>
        </div>
        <Badge variant="purple" dot pulse>AI Scanning Live</Badge>
      </div>

      {/* Hero Score */}
      <Card gradient className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-indigo-600/[0.02] pointer-events-none" />
        <div className="flex items-center gap-8">
          <div className="relative flex-shrink-0">
            <ScoreRing score={overallScore} size={112} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor}`}>{overallScore}</span>
              <span className="text-[10px] text-[#4a4a5a] font-bold">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className={`text-lg font-bold ${scoreColor} mb-1`}>{scoreLabel}</div>
            <p className="text-sm text-[#8b8b9a] leading-relaxed">
              Your business is <strong className="text-zinc-200">performing above average</strong> with strong automation coverage.
              Revenue collection and client retention need immediate attention to hit 85+.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+3 pts this week</span>
              </div>
              <div className="text-[#3a3a4a]">·</div>
              <div className="text-xs text-[#8b8b9a]">Last scan: 2 min ago</div>
              <div className="text-[#3a3a4a]">·</div>
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                3 critical actions
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-[#4a4a5a] mb-0.5">Potential score</div>
              <div className="text-xl font-black text-violet-400">94</div>
            </div>
            <div className="text-xs text-[#8b8b9a] text-right">+16 pts available<br/>from 3 quick fixes</div>
          </div>
        </div>
      </Card>

      {/* Score Dimensions */}
      <div>
        <div className="text-sm font-semibold text-zinc-200 mb-3 tracking-tight">Score Breakdown</div>
        <div className="space-y-2">
          {dimensions.map((d, i) => {
            const Icon = d.icon;
            const barColor = d.score >= 80 ? "bg-emerald-500" : d.score >= 60 ? "bg-amber-500" : "bg-red-500";
            return (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card hover className="group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-zinc-200">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                            d.trend > 0 ? "text-emerald-400" : d.trend < 0 ? "text-red-400" : "text-zinc-500"
                          }`}>
                            {d.trend > 0 ? "↑" : d.trend < 0 ? "↓" : "→"}{Math.abs(d.trend)}
                          </span>
                          <span className={`text-sm font-black ${
                            d.score >= 80 ? "text-emerald-400" : d.score >= 60 ? "text-amber-400" : "text-red-400"
                          }`}>{d.score}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.score}%` }}
                          transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${barColor}`}
                          style={{ boxShadow: d.score >= 80 ? "0 0 6px rgba(16,185,129,0.4)" : undefined }}
                        />
                      </div>
                      <p className="text-[10px] text-[#6b6b7b] mt-1.5 leading-relaxed group-hover:text-[#8b8b9a] transition-colors">{d.insight}</p>
                    </div>
                    <div className="text-[10px] text-[#3a3a4a] flex-shrink-0">×{d.weight}%</div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Automation Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-zinc-200 tracking-tight">AI Opportunity Scanner</div>
          <Badge variant="purple">
            <Lightbulb className="w-3 h-3 mr-1" />
            3 found
          </Badge>
        </div>
        <div className="space-y-3">
          {opportunities.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <Card gradient className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={opp.impact === "Critical" ? "danger" : "warning"}>
                      {opp.impact}
                    </Badge>
                    <span className="text-sm font-semibold text-zinc-100 tracking-tight">{opp.title}</span>
                  </div>
                  {activated.has(opp.id) && <Badge variant="success" dot>Active</Badge>}
                </div>

                <p className="text-xs text-[#8b8b9a] leading-relaxed mb-3">{opp.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Revenue Impact", value: opp.revenueSaved, color: "text-emerald-400" },
                    { label: "Time Saved",     value: opp.timeSaved,    color: "text-blue-400" },
                    { label: "ROI",             value: opp.roi,          color: "text-violet-400" },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-white/[0.02] rounded-lg py-2 border border-white/[0.05]">
                      <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[10px] text-[#4a4a5a] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* AI Simulation */}
                <AnimatePresence>
                  {simulationResult[opp.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.15]"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] font-semibold text-violet-400">AI Simulation Preview</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{simulationResult[opp.id]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={simulating === opp.id}
                    icon={<Target className="w-3.5 h-3.5" />}
                    onClick={() => runSimulation(opp.id)}
                  >
                    {simulationResult[opp.id] ? "Re-simulate" : "Preview AI Simulation"}
                  </Button>
                  <Button
                    variant={activated.has(opp.id) ? "success" : "primary"}
                    size="sm"
                    loading={activating === opp.id}
                    icon={activated.has(opp.id) ? <CheckCircle className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    onClick={() => !activated.has(opp.id) && activate(opp.id)}
                  >
                    {activated.has(opp.id) ? "Running" : `Activate · ${opp.effort}`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ROI Dashboard */}
      <Card className="border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div className="text-sm font-semibold text-zinc-200">AI Cost vs Time Saved</div>
          <Badge variant="success" className="ml-auto">This Month</Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Hours Saved",      value: "56 hrs",  sub: "By 7 automations",     color: "text-emerald-400", bar: 76 },
            { label: "Equiv. Labour Cost", value: "$4,200", sub: "At $75/hr rate",       color: "text-blue-400",   bar: 55 },
            { label: "Revenue Protected", value: "$9,200",  sub: "Invoices collected",   color: "text-violet-400", bar: 62 },
            { label: "Leads Nurtured",   value: "47",       sub: "Auto follow-ups sent", color: "text-amber-400",  bar: 89 },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
              <div className={`text-xl font-black ${s.color} mb-0.5`}>{s.value}</div>
              <div className="text-xs font-semibold text-zinc-300">{s.label}</div>
              <div className="text-[10px] text-[#4a4a5a] mb-2">{s.sub}</div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.bar}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                  className={`h-full rounded-full ${
                    s.color === "text-emerald-400" ? "bg-emerald-500" :
                    s.color === "text-blue-400"    ? "bg-blue-500" :
                    s.color === "text-violet-400"  ? "bg-violet-500" : "bg-amber-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
