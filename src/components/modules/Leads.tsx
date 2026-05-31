"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mail, Plus, Filter, ChevronRight, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { leads } from "@/lib/data";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { useLocalStorage } from "@/lib/useLocalStorage";

const STATUS: Record<string, { color: string; bg: string; label: string }> = {
  hot:  { color: "#f87171", bg: "rgba(248,113,113,0.1)",  label: "Hot"  },
  warm: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  label: "Warm" },
  cold: { color: "#71717a", bg: "rgba(113,113,122,0.1)", label: "Cold" },
};

function AIOutput({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 10, padding: "12px 14px", marginTop: 10 }}>
        <div className="flex items-start gap-2.5">
          <Bot style={{ width: 14, height: 14, color: clr.accentLight, flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.6, flex: 1 }}>{text}</p>
          <button onClick={onClose} style={{ color: clr.text4, flexShrink: 0, lineHeight: 1, padding: 4, cursor: "pointer", borderRadius: 4, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text2; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; }}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Spinner() {
  return (
    <div className="spin" style={{ width: 12, height: 12, border: "1.5px solid rgba(124,58,237,0.3)", borderTopColor: clr.accent, borderRadius: "50%", flexShrink: 0 }} />
  );
}

const EMPTY_FORM = { name: "", company: "", email: "", value: "", status: "warm" };

export function Leads() {
  const [allLeads, setAllLeads] = useLocalStorage("agencyos_leads", [...leads]);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [aiAction, setAiAction] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredLeads = filter === "all" ? allLeads : allLeads.filter(l => l.status === filter);

  const handleDelete = (id: string) => {
    setAllLeads(prev => prev.filter(l => l.id !== id));
    setDeleteConfirm(null);
  };

  const handleAI = async (leadId: string, action: string) => {
    const key = `${leadId}-${action}`;
    setLoading(key);
    await new Promise(r => setTimeout(r, 1100));
    const lead = allLeads.find(l => l.id === leadId);
    const msgs: Record<string, string> = {
      followup: `Drafted personalised follow-up to ${lead?.name} at ${lead?.company}. Subject: "Following up on our conversation" — includes company context and a clear CTA to schedule a discovery call.`,
      qualify: `Lead qualification complete for ${lead?.name}. Budget: est. ${lead?.value} · Timeline: 2–3 months · Authority: decision-maker confirmed · Need: strong match.`,
      proposal: `Proposal outline ready for ${lead?.company} — executive summary, scope, timeline, ${lead?.value} pricing, and next steps. Ready to customise and send.`,
    };
    setAiAction(prev => ({ ...prev, [key]: msgs[action] || "Action completed." }));
    setLoading(null);
  };

  const handleAddLead = () => {
    if (!form.name.trim()) { setFormError("Name is required"); return; }
    if (!form.company.trim()) { setFormError("Company is required"); return; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setFormError("Invalid email address"); return; }
    if (form.email.trim() && allLeads.some(l => l.email.toLowerCase() === form.email.trim().toLowerCase())) { setFormError("A lead with this email already exists"); return; }
    const newLead = {
      id: String(Date.now()),
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      value: form.value.trim() || "—",
      status: form.status as "hot" | "warm" | "cold",
      lastContact: "Just now",
    };
    setAllLeads(prev => [newLead, ...prev]);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(false);
  };

  const counts = { hot: allLeads.filter(l => l.status === "hot").length, warm: allLeads.filter(l => l.status === "warm").length, cold: allLeads.filter(l => l.status === "cold").length };

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Leads Pipeline</h2>
          <p style={PAGE_SUB}>AI-powered lead management and follow-up</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Filter style={{ width: 13, height: 13 }} />}
            onClick={() => setShowFilter(v => !v)}>
            Filter {filter !== "all" && `· ${filter}`}
          </Button>
          <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
            onClick={() => { setShowAdd(true); setFormError(""); }}>
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[["all", "All", allLeads.length], ["hot", "Hot", counts.hot], ["warm", "Warm", counts.warm], ["cold", "Cold", counts.cold]].map(([val, label, count]) => (
                <button key={val} onClick={() => setFilter(val as string)}
                  style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                    background: filter === val ? clr.accent : "var(--clr-card)",
                    border: `1px solid ${filter === val ? "rgba(124,58,237,0.5)" : clr.border}`,
                    color: filter === val ? "white" : clr.text3 }}>
                  {label} {count}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Hot Leads",  count: counts.hot,  color: clr.danger,  bg: "rgba(248,113,113,0.08)",  desc: "Need response now"   },
          { label: "Warm Leads", count: counts.warm, color: clr.warning, bg: "rgba(251,191,36,0.08)",   desc: "Follow up soon"      },
          { label: "Cold Leads", count: counts.cold, color: clr.text3,   bg: "rgba(113,113,122,0.06)", desc: "Re-engagement ready" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: clr.text2, marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: clr.text4, marginTop: 3 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* AI bulk action bar */}
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 14, padding: "14px 18px", marginBottom: 28 }}
        className="flex items-center gap-3">
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 14px rgba(124,58,237,0.3)" }}>
          <Bot style={{ width: 16, height: 16, color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AI Sales Employee</div>
          <div style={{ fontSize: 11, color: clr.text3, marginTop: 1 }}>Automate follow-ups and qualifications across your pipeline</div>
        </div>
        <Button variant="secondary" size="sm" loading={bulkLoading === "warm"}
          onClick={async () => { setBulkLoading("warm"); await new Promise(r => setTimeout(r, 1400)); setBulkLoading(null); }}>
          Follow Up All Warm
        </Button>
        <Button variant="primary" size="sm" loading={bulkLoading === "sequence"}
          onClick={async () => { setBulkLoading("sequence"); await new Promise(r => setTimeout(r, 1800)); setBulkLoading(null); }}>
          Run Lead Sequence
        </Button>
      </div>

      {/* Lead list */}
      <div style={SECTION_LABEL}>
        {filter === "all" ? `All Leads — ${allLeads.length}` : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Leads — ${filteredLeads.length}`}
      </div>
      {filteredLeads.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 24px", color: clr.text4, fontSize: 13 }}>
          No {filter !== "all" ? filter : ""} leads found.{" "}
          <button onClick={() => setFilter("all")} style={{ color: clr.accentLight, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
            Clear filter
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredLeads.map((lead, i) => {
          const st = STATUS[lead.status as keyof typeof STATUS] || STATUS.cold;
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16,1,0.3,1] }}
            >
              <div
                style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 12, padding: "14px 18px", transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = clr.borderHover; (e.currentTarget as HTMLDivElement).style.background = clr.cardHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = clr.border; (e.currentTarget as HTMLDivElement).style.background = clr.card; }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {lead.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{lead.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, background: st.bg, color: st.color, borderRadius: 6, padding: "1px 7px", border: `1px solid ${st.color}30` }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>{lead.company} · {lead.email}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: clr.text1 }}>{lead.value}</div>
                    <div style={{ fontSize: 11, color: clr.text4, marginTop: 2 }}>Last: {lead.lastContact}</div>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ flexShrink: 0, marginLeft: 8 }}>
                    {loading === `${lead.id}-followup`
                      ? <Spinner />
                      : <button onClick={() => handleAI(lead.id, "followup")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: clr.text3, background: "var(--clr-card)", border: `1px solid ${clr.border}`, borderRadius: 7, padding: "4px 10px", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.accentLight; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text3; (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; }}>
                          <Mail style={{ width: 11, height: 11 }} /> Follow-up
                        </button>
                    }
                    {loading === `${lead.id}-qualify`
                      ? <Spinner />
                      : <button onClick={() => handleAI(lead.id, "qualify")} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: clr.text3, background: "var(--clr-card)", border: `1px solid ${clr.border}`, borderRadius: 7, padding: "4px 10px", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.accentLight; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text3; (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; }}>
                          <Bot style={{ width: 11, height: 11 }} /> Qualify
                        </button>
                    }
                    {deleteConfirm === lead.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button onClick={() => handleDelete(lead.id)} style={{ fontSize: 11, fontWeight: 600, color: clr.danger, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, borderRadius: 7, padding: "4px 8px", cursor: "pointer" }}>
                          Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, color: clr.text3, background: "rgba(255,255,255,0.04)", border: `1px solid ${clr.border}`, borderRadius: 7, padding: "4px 8px", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(lead.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, color: clr.text4, background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, transition: "color 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.danger; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    )}
                    <ChevronRight style={{ width: 14, height: 14, color: clr.text4 }} />
                  </div>
                </div>
                <AnimatePresence>
                  {(aiAction[`${lead.id}-followup`] || aiAction[`${lead.id}-qualify`] || aiAction[`${lead.id}-proposal`]) && (
                    <AIOutput
                      text={aiAction[`${lead.id}-followup`] || aiAction[`${lead.id}-qualify`] || aiAction[`${lead.id}-proposal`]}
                      onClose={() => setAiAction(p => {
                        const next = { ...p };
                        delete next[`${lead.id}-followup`];
                        delete next[`${lead.id}-qualify`];
                        delete next[`${lead.id}-proposal`];
                        return next;
                      })}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAdd && (
        <Modal title="Add New Lead" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>FULL NAME *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Sarah Chen" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddLead(); }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>COMPANY *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Acme Corp" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddLead(); }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL</label>
              <input style={INPUT_STYLE} {...INPUT_FOCUS} type="email" placeholder="sarah@acme.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>DEAL VALUE</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="$5,000" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddLead(); }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>STATUS</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ ...INPUT_STYLE, appearance: "none" as const }}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
            </div>
            {formError && <p style={{ fontSize: 12, color: clr.danger, marginTop: -6 }}>{formError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>Cancel</Button>
              <Button variant="primary" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={handleAddLead}>Add Lead</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
