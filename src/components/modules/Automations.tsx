"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Play, Pause, Plus, ArrowRight, Bot } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { automations } from "@/lib/data";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { useLocalStorage } from "@/lib/useLocalStorage";

const TEMPLATES = [
  { name: "New lead → Qualify → Follow-up",          category: "Sales",      color: clr.info,    trigger: "New lead added"           },
  { name: "Invoice overdue → Reminder → Escalate",   category: "Finance",    color: clr.danger,  trigger: "Invoice overdue 7 days"   },
  { name: "Meeting ends → Recap → Tasks",             category: "Operations", color: "#2dd4bf",   trigger: "Meeting ends"             },
  { name: "Content approved → Schedule → Publish",   category: "Content",    color: "#f472b6",   trigger: "Content approved"         },
  { name: "Client onboarded → Welcome sequence",     category: "Client",     color: clr.accent,  trigger: "Client onboarded"         },
  { name: "Weekly pulse → Reports → Review",         category: "Reports",    color: clr.warning, trigger: "Every Sunday 11:59 PM"    },
];

const EMPTY_FORM = { name: "", trigger: "" };

export function Automations() {
  const [autoList, setAutoList] = useLocalStorage("agencyos_automations", [...automations]);
  const [states, setStates] = useLocalStorage<Record<string, boolean>>(
    "agencyos_automation_states",
    Object.fromEntries(automations.map(a => [a.id, a.status === "active"]))
  );
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const builderRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => setStates(p => ({ ...p, [id]: !p[id] }));
  const activeCount = Object.values(states).filter(Boolean).length;
  const totalRuns = autoList.reduce((s, a) => s + a.runs, 0);

  const handleAddTemplate = (t: typeof TEMPLATES[0]) => {
    const newId = String(Date.now());
    const newAuto = {
      id: newId,
      name: t.name.split("→")[0].trim(),
      trigger: t.trigger,
      status: "paused" as const,
      runs: 0,
      lastRun: "Never",
    };
    setAutoList(prev => [...prev, newAuto]);
    setStates(p => ({ ...p, [newId]: false }));
  };

  const handleAddAutomation = () => {
    if (!form.name.trim()) { setFormError("Name is required"); return; }
    if (!form.trigger.trim()) { setFormError("Trigger is required"); return; }
    const newId = String(Date.now());
    const newAuto = {
      id: newId,
      name: form.name.trim(),
      trigger: form.trigger.trim(),
      status: "paused" as const,
      runs: 0,
      lastRun: "Never",
    };
    setAutoList(prev => [...prev, newAuto]);
    setStates(p => ({ ...p, [newId]: false }));
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(false);
  };

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Automations</h2>
          <p style={PAGE_SUB}>Build trigger-based AI workflows that run 24/7</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
          onClick={() => { setShowAdd(true); setFormError(""); }}>
          New Automation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Active",      value: activeCount,  color: clr.success, bg: "rgba(52,211,153,0.08)",   bord: "rgba(52,211,153,0.15)"   },
          { label: "Total Runs",  value: totalRuns,    color: clr.info,    bg: "rgba(96,165,250,0.08)",   bord: "rgba(96,165,250,0.15)"   },
          { label: "Hours Saved", value: "~14/wk",     color: "#a78bfa",   bg: "rgba(167,139,250,0.08)",  bord: "rgba(167,139,250,0.15)"  },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.bord}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: clr.text2, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Your automations */}
      <div style={SECTION_LABEL}>Your Automations — {autoList.length}</div>
      {autoList.length === 0 && (
        <EmptyState icon={Zap} title="No automations yet" description="Create your first workflow or use a template below." action="New Automation" onAction={() => { setShowAdd(true); setFormError(""); }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 32 }}>
        {autoList.map((auto, i) => {
          const isActive = states[auto.id];
          return (
            <motion.div key={auto.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ background: clr.card, border: `1px solid ${isActive ? "rgba(52,211,153,0.14)" : clr.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = clr.cardHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = clr.card; }}>

                <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? "rgba(52,211,153,0.1)" : "var(--clr-card-hover)", border: `1px solid ${isActive ? "rgba(52,211,153,0.2)" : clr.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Zap style={{ width: 15, height: 15, color: isActive ? clr.success : clr.text4 }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{auto.name}</div>
                  <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>
                    <span style={{ color: clr.text4 }}>Trigger:</span> {auto.trigger}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{auto.runs}</div>
                    <div style={{ fontSize: 11, color: clr.text4 }}>runs</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: clr.text3 }}>{auto.lastRun}</div>
                    <div style={{ fontSize: 10, color: clr.text4 }}>last run</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Badge variant={isActive ? "success" : "default"} dot={isActive}>
                    {isActive ? "Active" : "Paused"}
                  </Badge>
                  <button
                    onClick={() => toggle(auto.id)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${isActive ? "rgba(52,211,153,0.25)" : clr.border}`, background: isActive ? "rgba(52,211,153,0.08)" : "var(--clr-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", color: isActive ? clr.success : clr.text4 }}
                  >
                    {isActive ? <Pause style={{ width: 13, height: 13 }} /> : <Play style={{ width: 13, height: 13 }} />}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Automation Builder preview */}
      <div ref={builderRef} style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Bot style={{ width: 14, height: 14, color: "#a78bfa" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>Automation Builder</span>
          <Badge variant="purple" className="ml-2">Visual Editor</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {["New Lead Added", "→", "AI Qualifies Lead", "→", "Draft Follow-up", "→", "Send Email", "→", "Update CRM"].map((step, i) => (
            step === "→"
              ? <ArrowRight key={i} style={{ width: 13, height: 13, color: clr.text4, flexShrink: 0 }} />
              : <div key={i} style={{ fontSize: 12, fontWeight: 500, color: clr.text2, background: "var(--clr-card-hover)", border: `1px solid ${clr.border}`, borderRadius: 8, padding: "5px 10px" }}>{step}</div>
          ))}
        </div>
        <Button variant="primary" size="sm" className="mt-4"
          onClick={() => { setShowAdd(true); setFormError(""); }}>
          Open Builder
        </Button>
      </div>

      {/* Templates */}
      <div style={SECTION_LABEL}>Automation Templates</div>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => handleAddTemplate(t)}
            style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${clr.border}`, background: clr.card, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s", width: "100%" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = clr.cardHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; (e.currentTarget as HTMLButtonElement).style.background = clr.card; }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: clr.text1 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: clr.text4, marginTop: 3 }}>{t.category}</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${t.color}14`, border: `1px solid ${t.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Plus style={{ width: 13, height: 13, color: t.color }} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* New Automation Modal */}
      {showAdd && (
        <Modal title="New Automation" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>AUTOMATION NAME *</label>
              <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Lead Follow-Up Sequence" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>TRIGGER *</label>
              <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="New lead added" value={form.trigger} onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))} />
            </div>
            <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: "#a78bfa", lineHeight: 1.6 }}>
                Automation will be created in <strong>paused</strong> state. Activate it from the list when ready.
              </div>
            </div>
            {formError && <p style={{ fontSize: 12, color: clr.danger }}>{formError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>Cancel</Button>
              <Button variant="primary" icon={<Zap style={{ width: 13, height: 13 }} />} onClick={handleAddAutomation}>Create Automation</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
