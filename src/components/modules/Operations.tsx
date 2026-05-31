"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, FileText, Plus, X, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { invoices } from "@/lib/data";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { useLocalStorage } from "@/lib/useLocalStorage";

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

const EMPTY_FORM = { client: "", project: "", amount: "", dueDate: "" };

export function Operations() {
  const [allInvoices, setAllInvoices] = useLocalStorage("agencyos_invoices", [...invoices]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<typeof invoices[0] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [aiActions, setAiActions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleAction = async (invoiceId: string, action: string) => {
    const key = `${invoiceId}-${action}`;
    setLoading(key);
    await new Promise(r => setTimeout(r, 1000));
    const inv = allInvoices.find(i => i.id === invoiceId);
    const msgs: Record<string, string> = {
      reminder: `Payment reminder sent to ${inv?.client}. Includes invoice ${inv?.id} (${inv?.amount}), due date, and a secure payment link. Auto-follow-up scheduled in 3 days.`,
      escalate: `Escalation drafted for ${inv?.client} — ${inv?.amount} overdue ${inv?.daysOverdue} days. Mentions project pause risk and requests urgent response within 48 hours.`,
    };
    setAiActions(prev => ({ ...prev, [key]: msgs[action] || "Done." }));
    setLoading(null);
  };

  const handleAddInvoice = () => {
    if (!form.client.trim()) { setFormError("Client name is required"); return; }
    if (!form.amount.trim()) { setFormError("Amount is required"); return; }
    const nextId = `INV-2024-${String(100 + allInvoices.length).padStart(3, "0")}`;
    const newInvoice = {
      id: nextId,
      client: form.client.trim(),
      project: form.project.trim() || "General Services",
      amount: form.amount.trim().startsWith("$") ? form.amount.trim() : `$${form.amount.trim()}`,
      status: "pending" as const,
      daysOverdue: 0,
    };
    setAllInvoices(prev => [newInvoice, ...prev]);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(false);
  };

  const totalOverdue = allInvoices.filter(i => i.status === "overdue").reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);
  const totalPending = allInvoices.filter(i => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Operations Manager</h2>
          <p style={PAGE_SUB}>Invoices, payments, and business workflows</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
          onClick={() => { setShowAdd(true); setFormError(""); }}>
          New Invoice
        </Button>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Overdue",           value: `$${totalOverdue.toLocaleString()}`, sub: `${allInvoices.filter(i=>i.status==="overdue").length} invoices`,  color: clr.danger,  bg: "rgba(248,113,113,0.08)", bord: "rgba(248,113,113,0.2)" },
          { label: "Pending",           value: `$${totalPending.toLocaleString()}`, sub: `${allInvoices.filter(i=>i.status==="pending").length} invoices`,  color: clr.warning, bg: "rgba(251,191,36,0.08)",  bord: "rgba(251,191,36,0.2)"  },
          { label: "Total Outstanding", value: `$${(totalOverdue+totalPending).toLocaleString()}`, sub: `Across ${allInvoices.length} invoices`, color: clr.text1, bg: clr.card, bord: clr.border },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.bord}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: clr.text4, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* AI action bar */}
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 14, padding: "14px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot style={{ width: 16, height: 16, color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AI Operations Manager</div>
          <div style={{ fontSize: 11, color: clr.text3, marginTop: 1 }}>Automate invoice reminders, payment follow-ups, and escalations</div>
        </div>
        <Button variant="danger" size="sm" icon={<Send style={{ width: 13, height: 13 }} />} loading={bulkLoading}
          onClick={async () => { setBulkLoading(true); await new Promise(r => setTimeout(r, 1600)); setBulkLoading(false); }}>
          Send All Reminders
        </Button>
      </div>

      {/* Invoice list */}
      <div style={SECTION_LABEL}>Invoices — {allInvoices.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {allInvoices.map((inv, i) => {
          const isOverdue = inv.status === "overdue";
          return (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ background: clr.card, border: `1px solid ${isOverdue ? "rgba(248,113,113,0.16)" : clr.border}`, borderRadius: 12, padding: "14px 18px", transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = clr.cardHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = clr.card; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: isOverdue ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isOverdue
                      ? <AlertTriangle style={{ width: 15, height: 15, color: clr.danger }} />
                      : <Clock style={{ width: 15, height: 15, color: clr.warning }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{inv.client}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? clr.danger : clr.warning, background: isOverdue ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)", borderRadius: 6, padding: "1px 7px", border: `1px solid ${isOverdue ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}` }}>
                        {isOverdue ? `Overdue ${inv.daysOverdue}d` : "Pending"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>{inv.id} · {inv.project}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: clr.text1, letterSpacing: "-0.02em", flexShrink: 0 }}>{inv.amount}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <Button variant="ghost" size="sm" icon={<Send style={{ width: 12, height: 12 }} />}
                      loading={loading === `${inv.id}-reminder`} onClick={() => handleAction(inv.id, "reminder")}>
                      Remind
                    </Button>
                    {isOverdue && (
                      <Button variant="danger" size="sm" icon={<AlertTriangle style={{ width: 12, height: 12 }} />}
                        loading={loading === `${inv.id}-escalate`} onClick={() => handleAction(inv.id, "escalate")}>
                        Escalate
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" icon={<FileText style={{ width: 12, height: 12 }} />}
                      onClick={() => setViewInvoice(inv)}>
                      View
                    </Button>
                  </div>
                </div>
                <AnimatePresence>
                  {Object.entries(aiActions).filter(([k]) => k.startsWith(inv.id)).map(([k, msg]) => (
                    <AIOutput key={k} text={msg} onClose={() => setAiActions(p => { const n = { ...p }; delete n[k]; return n; })} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recurring workflows */}
      <div style={{ marginTop: 32 }}>
        <div style={SECTION_LABEL}>Recurring Workflows</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Monthly invoicing",       schedule: "1st of month",   status: "active", next: "Dec 1"   },
            { name: "Weekly client updates",   schedule: "Every Monday",   status: "active", next: "Monday"  },
            { name: "Quarterly reports",       schedule: "End of quarter", status: "active", next: "Dec 31"  },
            { name: "Contract renewals check", schedule: "Monthly",        status: "paused", next: "Paused"  },
          ].map((task, i) => (
            <div key={i} style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.status === "active" ? clr.success : clr.text4, flexShrink: 0 }} className={task.status === "active" ? "pulse-dot" : ""} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{task.name}</div>
                <div style={{ fontSize: 11, color: clr.text3, marginTop: 2 }}>{task.schedule}</div>
              </div>
              <div style={{ fontSize: 11, color: clr.text4, flexShrink: 0 }}>Next: {task.next}</div>
            </div>
          ))}
        </div>
      </div>

      {/* New Invoice Modal */}
      {showAdd && (
        <Modal title="New Invoice" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>CLIENT *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Apex Digital" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddInvoice(); }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>AMOUNT *</label>
                <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="$5,000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddInvoice(); }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>PROJECT / DESCRIPTION</label>
              <input style={INPUT_STYLE} {...INPUT_FOCUS} placeholder="Brand Refresh Phase 3" value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") handleAddInvoice(); }} />
            </div>
            {formError && <p style={{ fontSize: 12, color: clr.danger, marginTop: -6 }}>{formError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }}>Cancel</Button>
              <Button variant="primary" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={handleAddInvoice}>Create Invoice</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && (
        <Modal title={`Invoice ${viewInvoice.id}`} onClose={() => setViewInvoice(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Client", value: viewInvoice.client },
                { label: "Amount", value: viewInvoice.amount },
                { label: "Project", value: viewInvoice.project },
                { label: "Status", value: viewInvoice.status === "overdue" ? `Overdue ${viewInvoice.daysOverdue} days` : "Pending" },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: clr.text4, letterSpacing: "0.06em", marginBottom: 4 }}>{row.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: row.label === "Amount" ? clr.text1 : clr.text2 }}>{row.value}</div>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 16, borderTop: `1px solid ${clr.border}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" icon={<Send style={{ width: 12, height: 12 }} />}
                onClick={() => { handleAction(viewInvoice.id, "reminder"); setViewInvoice(null); }}>
                Send Reminder
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewInvoice(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
