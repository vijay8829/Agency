"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, Zap, BarChart3, Bot, ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    icon: Sparkles,
    color: "from-violet-500 to-indigo-600",
    title: "Welcome to AgencyOS",
    subtitle: "Your AI Employee is ready",
    body: "AgencyOS runs your agency like a digital employee — handling leads, clients, invoices, content, and automations while you focus on growth.",
    highlight: "First-time setup takes under 60 seconds.",
  },
  {
    icon: Bot,
    color: "from-violet-600 to-purple-700",
    title: "Meet Your AI Employee",
    subtitle: "It knows your entire business",
    body: "Tell your AI anything in plain English: 'Follow up with warm leads', 'Send invoice reminders', or 'Generate my weekly report'. It executes across all modules instantly.",
    highlight: "Try the AI Command Center on your Dashboard.",
  },
  {
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    title: "Automations Run 24/7",
    subtitle: "7 workflows already active",
    body: "Lead follow-ups, invoice reminders, client updates, meeting recaps — your AI handles them automatically using trigger → condition → action logic.",
    highlight: "Saving you ~14 hours every week.",
  },
  {
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
    title: "Business Health Score",
    subtitle: "Your agency's vital signs",
    body: "AI scans your entire operation and scores it out of 100. It finds inefficiencies, spots risks, and shows exactly which 3 actions will boost your score the most.",
    highlight: "Your current score: 78/100 — 3 quick wins available.",
  },
  {
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    title: "You're Ready to Launch",
    subtitle: "Everything is set up",
    body: "Your leads, clients, invoices, and automations are loaded. Start by asking your AI employee a question or exploring your Business Health Score.",
    highlight: "Let's make your agency run itself.",
  },
];

interface OnboardingProps {
  onDismiss: () => void;
}

export function Onboarding({ onDismiss }: OnboardingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onDismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative"
      >
        {/* Card */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "#151b2e", borderColor: "rgba(255,255,255,0.08)" }}>

          {/* Progress bar */}
          <div className="h-0.5 bg-white/[0.06]">
            <motion.div
              className="h-full bg-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <div className="p-8">
            {/* Step dots */}
            <div className="flex items-center gap-1.5 mb-8">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-violet-500" : i < step ? "w-3 bg-violet-500/40" : "w-3 bg-white/[0.08]"
                }`} />
              ))}
              <button onClick={onDismiss} className="ml-auto w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-[#4a4a5a] hover:text-zinc-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-6 glow-purple`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <div className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-2">{current.subtitle}</div>
                <h2 className="text-2xl font-black text-zinc-100 tracking-tight mb-3">{current.title}</h2>
                <p className="text-sm text-[#8b8b9a] leading-relaxed mb-4">{current.body}</p>

                <div className="flex items-center gap-2 bg-violet-500/[0.08] border border-violet-500/[0.18] rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm text-violet-300 font-medium">{current.highlight}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className={`text-sm text-[#4a4a5a] hover:text-zinc-400 transition-colors ${step === 0 ? "invisible" : ""}`}
              >
                ← Back
              </button>

              <Button
                variant="primary"
                size="md"
                onClick={() => isLast ? onDismiss() : setStep(s => s + 1)}
                iconRight={!isLast ? <ArrowRight className="w-4 h-4" /> : undefined}
                icon={isLast ? <Sparkles className="w-4 h-4" /> : undefined}
              >
                {isLast ? "Enter AgencyOS" : "Next"}
              </Button>
            </div>
          </div>
        </div>

        {/* Step counter */}
        <div className="text-center mt-4 text-[11px] text-[#3a3a4a]">
          Step {step + 1} of {steps.length}
        </div>
      </motion.div>
    </div>
  );
}
