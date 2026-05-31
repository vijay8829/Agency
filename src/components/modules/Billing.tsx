"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Download, CheckCircle, Zap, Users, BarChart2, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    color: clr.info,
    features: ["5 AI Tasks/day", "3 Automations", "1 Team member", "Basic reports", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    color: clr.accent,
    current: true,
    features: ["50 AI Tasks/day", "20 Automations", "5 Team members", "Advanced reports", "Priority support"],
  },
  {
    id: "agency",
    name: "Agency",
    price: 149,
    color: "#f472b6",
    features: ["Unlimited AI Tasks", "Unlimited Automations", "25 Team members", "Custom reports", "Dedicated support"],
  },
];

const INITIAL_INVOICES = [
  { id: "INV-2024-011", date: "Nov 21, 2024", amount: 49, status: "paid"    as const },
  { id: "INV-2024-010", date: "Oct 21, 2024", amount: 49, status: "paid"    as const },
  { id: "INV-2024-009", date: "Sep 21, 2024", amount: 49, status: "paid"    as const },
  { id: "INV-2024-008", date: "Aug 21, 2024", amount: 29, status: "paid"    as const },
  { id: "INV-2024-007", date: "Jul 21, 2024", amount: 29, status: "paid"    as const },
];

const USAGE = [
  { label: "AI Tasks",      used: 847,  max: 1500,  icon: Zap,      color: clr.accent  },
  { label: "Automations",   used: 5,    max: 20,    icon: BarChart2, color: clr.info   },
  { label: "Team Members",  used: 1,    max: 5,     icon: Users,    color: "#2dd4bf"   },
  { label: "Storage",       used: 2.4,  max: 10,    icon: Shield,   color: clr.warning, unit: "GB" },
];

export function Billing() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [invoices] = useState(INITIAL_INVOICES);
  const [billing] = useState({ card: "•••• •••• •••• 4242", expiry: "08/27", brand: "Visa" });

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setShowUpgrade(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;
    setCurrentPlan(selectedPlan.id);
    setShowUpgrade(false);
    showToast(`Upgraded to ${selectedPlan.name} plan — takes effect immediately`, "success");
  };

  const handleDownload = (invoice: typeof INITIAL_INVOICES[0]) => {
    showToast(`Downloading ${invoice.id}…`, "info");
  };

  const handleUpdateCard = () => {
    showToast("Redirecting to billing portal…", "info");
  };

  return (
    <div style={{ ...SHELL, maxWidth: 820 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={PAGE_TITLE}>Billing</h2>
        <p style={PAGE_SUB}>Manage your plan, payment method, and invoices</p>
      </div>

      {/* Current plan summary */}
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: "22px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: clr.text4, letterSpacing: "0.05em", marginBottom: 4 }}>CURRENT PLAN</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: clr.text1, letterSpacing: "-0.03em" }}>Pro · $49/mo</div>
          <div style={{ fontSize: 12, color: clr.text3, marginTop: 4 }}>Renews Dec 21, 2024 · billed monthly</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => showToast("Cancellation flow — contact support@agencyos.ai", "info")}>Cancel plan</Button>
          <Button variant="primary" size="sm" icon={<ArrowRight style={{ width: 13, height: 13 }} />} onClick={() => handleSelectPlan(PLANS[2])}>Upgrade to Agency</Button>
        </div>
      </div>

      {/* Usage */}
      <div style={SECTION_LABEL}>Usage This Cycle</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
        {USAGE.map(u => {
          const pct = Math.round((u.used / u.max) * 100);
          const Icon = u.icon;
          return (
            <motion.div key={u.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${u.color}12`, border: `1px solid ${u.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 14, height: 14, color: u.color }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: clr.text2 }}>{u.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: pct > 80 ? clr.warning : clr.text1 }}>
                  {u.used}{u.unit ?? ""} / {u.max}{u.unit ?? ""}
                </span>
              </div>
              <div style={{ height: 5, background: "var(--clr-border)", borderRadius: 4, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ height: "100%", background: pct > 80 ? clr.warning : u.color, borderRadius: 4 }}
                />
              </div>
              <div style={{ fontSize: 10, color: clr.text4, marginTop: 6 }}>{pct}% used</div>
            </motion.div>
          );
        })}
      </div>

      {/* Plan comparison */}
      <div style={SECTION_LABEL}>Plans</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {PLANS.map((plan, i) => {
          const active = currentPlan === plan.id;
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: active ? "rgba(124,58,237,0.06)" : "var(--clr-card)", border: `1px solid ${active ? "rgba(124,58,237,0.35)" : "var(--clr-border)"}`, borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: clr.text1, letterSpacing: "-0.04em", marginBottom: 2 }}>${plan.price}<span style={{ fontSize: 13, fontWeight: 500, color: clr.text4 }}>/mo</span></div>
              <div style={{ borderTop: "1px solid var(--clr-border)", margin: "14px 0", height: 1 }} />
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: clr.text2 }}>
                    <CheckCircle style={{ width: 12, height: 12, color: plan.color, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={active ? "ghost" : "secondary"}
                size="sm"
                style={{ marginTop: 16, width: "100%" }}
                onClick={() => handleSelectPlan(plan)}
              >
                {active ? "Current plan" : "Switch to " + plan.name}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Payment method */}
      <div style={SECTION_LABEL}>Payment Method</div>
      <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CreditCard style={{ width: 16, height: 16, color: clr.text3 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{billing.brand} {billing.card}</div>
          <div style={{ fontSize: 11, color: clr.text3, marginTop: 2 }}>Expires {billing.expiry}</div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleUpdateCard}>Update card</Button>
      </div>

      {/* Invoice history */}
      <div style={SECTION_LABEL}>Invoice History</div>
      <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, overflow: "hidden" }}>
        {invoices.map((inv, i) => (
          <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderTop: i === 0 ? "none" : "1px solid var(--clr-border)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{inv.id}</div>
              <div style={{ fontSize: 11, color: clr.text3, marginTop: 2 }}>{inv.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: clr.text2 }}>${inv.amount}</div>
            <Badge variant="success">{inv.status}</Badge>
            <button
              onClick={() => handleDownload(inv)}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: clr.text3, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", borderRadius: 7, padding: "5px 10px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text1; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text3; }}
            >
              <Download style={{ width: 12, height: 12 }} /> PDF
            </button>
          </div>
        ))}
      </div>

      {/* Upgrade confirmation modal */}
      {showUpgrade && selectedPlan && (
        <Modal title={`Switch to ${selectedPlan.name}`} onClose={() => setShowUpgrade(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, color: clr.text1, fontWeight: 500, marginBottom: 4 }}>
                {PLANS.find(p => p.id === currentPlan)?.name} → {selectedPlan.name}
              </div>
              <div style={{ fontSize: 12, color: clr.text3 }}>
                New billing: <strong style={{ color: clr.text1 }}>${selectedPlan.price}/month</strong> · Change takes effect immediately
              </div>
            </div>
            <div style={{ fontSize: 12, color: clr.text3, lineHeight: 1.6 }}>
              Your card ending in 4242 will be charged the new amount on your next billing date.
              You&apos;ll receive a confirmation email.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setShowUpgrade(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmUpgrade}>Confirm Switch</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
