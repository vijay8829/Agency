"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mail, FileText, Plus, X, AlertCircle, CheckCircle, Activity, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { clients } from "@/lib/data";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { useLocalStorage } from "@/lib/useLocalStorage";

function HealthBar({ value }: { value: number }) {
  const color = value >= 80 ? clr.success : value >= 60 ? clr.warning : clr.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--clr-border)", borderRadius: 4, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, minWidth: 28, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function AIOutput({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 10, padding: "12px 14px", marginTop: 10 }}>
        <div className="flex items-start gap-2.5">
          <Bot style={{ width: 14, height: 14, color: "#a78bfa", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.65, flex: 1 }}>{text}</p>
          <button onClick={onClose} style={{ padding: 4, cursor: "pointer", borderRadius: 4, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: clr.text4, flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text2; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; }}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const EMPTY_FORM = { name: "", contact: "", project: "", health: "80", status: "active" };

export function Clients() {
  const [allClients, setAllClients] = useLocalStorage("agencyos_clients", [...clients]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [aiActions, setAiActions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setAllClients(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const handleAction = async (clientId: string, action: string) => {
    const key = `${clientId}-${action}`;
    setLoading(key);
    await new Promise(r => setTimeout(r, 1100));
    const client = allClients.find(c => c.id === clientId);
    const msgs: Record<string, string> = {
      update: `Project update drafted for ${client?.name}. Summarises progress on "${client?.project}", completed milestones, next steps, and upcoming deliverables.`,
      report: `Status report for ${client?.name}: "${client?.project}" is ${client?.health}% on track. ${(client?.health ?? 0) < 70 ? "⚠️ At risk — check-in call recommended." : "All milestones on schedule."}`,
      followup: `Follow-up sequence activated for ${client?.contact} at ${client?.name}: check-in today, task reminder in 2 days, progress update by end of week.`,
    };
    setAiActions(prev => ({ ...prev, [key]: msgs[action] || "Done." }));
    setLoading(null);
  };

  const handleAddClient = () => {
    if (!form.name.trim()) { setFormError("Company name is required"); return; }
    if (!form.contact.trim()) { setFormError("Contact name is required"); return; }
    const newClient = {
      id: String(Date.now()),
      name: form.name.trim(),
      contact: form.contact.trim(),
      project: form.project.trim() || "New Project",
      status: form.status as "active" | "at-risk",
      health: Math.min(100, Math.max(0, parseInt(form.health) || 80)),
      nextTask: "Schedule kickoff call",
      dueDate: "This week",
    };
    setAllClients(prev => [newClient, ...prev]);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(false);
  };

  const healthy = allClients.filter(c => c.health >= 80).length;
  const atRisk  = allClients.filter(c => c.health < 70).length;
  const monitor = allClients.filter(c => c.health >= 70 && c.health < 80).length;

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Client Manager</h2>
          <p style={PAGE_SUB}>AI-powered client relationships and project health tracking</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
          onClick={() => { setShowAdd(true); setFormError(""); }}>
          Add Client
        </Button>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Healthy", count: healthy, color: clr.success, bg: "rgba(52,211,153,0.08)",  icon: CheckCircle, desc: "On track"       },
          { label: "Monitor", count: monitor, color: clr.warning, bg: "rgba(251,191,36,0.08)",  icon: Activity,   desc: "Needs check-in" },
          { label: "At Risk", count: atRisk,  color: clr.danger,  bg: "rgba(248,113,113,0.08)", icon: AlertCircle, desc: "Immediate action"},
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: clr.text2, marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: clr.text4, marginTop: 1 }}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI bulk */}
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 14, padding: "14px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot style={{ width: 16, height: 16, color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AI Client Manager</div>
          <div style={{ fontSize: 11, color: clr.text3, marginTop: 1 }}>Automate status updates, reports, and at-risk client recovery</div>
        </div>
        <Button variant="primary" size="sm" loading={bulkLoading}
          onClick={async () => { setBulkLoading(true); await new Promise(r => setTimeout(r, 1600)); setBulkLoading(false); }}>
          Update All Clients
        </Button>
      </div>

      {/* Clients */}
      <div style={SECTION_LABEL}>Active Clients — {allClients.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {allClients.map((client, i) => (
          <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 12, padding: "16px 18px", transition: "background 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = clr.cardHover; (e.currentTarget as HTMLDivElement).style.borderColor = clr.borderHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = clr.card; (e.currentTarget as HTMLDivElement).style.borderColor = clr.border; }}>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{client.name}</div>
                    <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>{client.contact} · {client.project}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: client.status === "active" ? clr.success : clr.danger, background: client.status === "active" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${client.status === "active" ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 6, padding: "2px 8px" }}>
                  {client.status === "active" ? "Active" : "At Risk"}
                </span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: clr.text4 }}>Client Health</span>
                  <span style={{ fontSize: 11, color: clr.text3 }}>Next: <span style={{ color: clr.text2, fontWeight: 500 }}>{client.nextTask}</span> · Due {client.dueDate}</span>
                </div>
                <HealthBar value={client.health} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: "1px solid var(--clr-border)" }}>
                <Button variant="ghost" size="sm" icon={<Mail style={{ width: 12, height: 12 }} />}
                  loading={loading === `${client.id}-update`} onClick={() => handleAction(client.id, "update")}>
                  Send Update
                </Button>
                <Button variant="ghost" size="sm" icon={<FileText style={{ width: 12, height: 12 }} />}
                  loading={loading === `${client.id}-report`} onClick={() => handleAction(client.id, "report")}>
                  Report
                </Button>
                <Button variant="ghost" size="sm" icon={<Bot style={{ width: 12, height: 12 }} />}
                  loading={loading === `${client.id}-followup`} onClick={() => handleAction(client.id, "followup")}>
                  AI Follow-up
                </Button>
                <div style={{ marginLeft: "auto" }}>
                  {deleteConfirm === client.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleDelete(client.id)} style={{ fontSize: 11, fontWeight: 600, color: clr.danger, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, borderRadius: 7, padding: "4px 8px", cursor: "pointer" }}>Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, color: clr.text3, background: "rgba(255,255,255,0.04)", border: `1px solid ${clr.border}`, borderRadius: 7, padding: "4px 8px", cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(client.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, color: clr.text4, background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, transition: "color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.danger; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {Object.entries(aiActions)
                  .filter(([k]) => k.startsWith(client.id))
                  .map(([k, msg]) => (
                    <AIOutput key={k} text={msg} onClose={() => setAiActions(p => { const n = { ...p }; delete n[k]; return n; })} />
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <Modal title="Add New Client" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>COMPANY NAME *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Acme Corp" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddClient(); }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>CONTACT NAME *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Jane Smith" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddClient(); }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>PROJECT</label>
              <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Brand Refresh" value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddClient(); }} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>HEALTH SCORE (0–100)</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} type="number" min="0" max="100" placeholder="80" value={form.health} onChange={e => setForm(p => ({ ...p, health: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddClient(); }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>STATUS</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ ...INPUT_STYLE, appearance: "none" as const }}>
                  <option value="active">Active</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>
            </div>
            {formError && <p style={{ fontSize: 12, color: clr.danger, marginTop: -6 }}>{formError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>Cancel</Button>
              <Button variant="primary" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={handleAddClient}>Add Client</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
