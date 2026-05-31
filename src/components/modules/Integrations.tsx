"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, CheckCircle, XCircle, Copy, RefreshCw, Eye, EyeOff, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";

type IntegrationStatus = "connected" | "disconnected" | "error";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  status: IntegrationStatus;
  lastSync?: string;
  icon: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: "gmail",    name: "Gmail",          category: "Email",     description: "Send automated emails and receive lead notifications",       color: "#ea4335", status: "connected",    lastSync: "2m ago",   icon: "G" },
  { id: "slack",    name: "Slack",          category: "Messaging", description: "Team notifications, deal alerts, and workflow triggers",      color: "#4a154b", status: "disconnected",               icon: "S" },
  { id: "notion",   name: "Notion",         category: "Docs",      description: "Sync client notes, SOPs, and knowledge base articles",        color: "#000000", status: "connected",    lastSync: "1h ago",   icon: "N" },
  { id: "stripe",   name: "Stripe",         category: "Payments",  description: "Process payments, track revenue, and sync invoice status",    color: "#635bff", status: "disconnected",               icon: "S" },
  { id: "calendar", name: "Google Calendar",category: "Calendar",  description: "Auto-schedule follow-ups and sync meeting recaps",            color: "#4285f4", status: "connected",    lastSync: "5m ago",   icon: "C" },
  { id: "hubspot",  name: "HubSpot",        category: "CRM",       description: "Bi-directional contact and deal sync with your CRM",          color: "#ff7a59", status: "error",        lastSync: "Failed",   icon: "H" },
  { id: "zapier",   name: "Zapier",         category: "Automation",description: "Connect 5,000+ apps via automated Zap workflows",            color: "#ff4a00", status: "disconnected",               icon: "Z" },
  { id: "openai",   name: "OpenAI",         category: "AI",        description: "Power AI tasks with GPT-4 Turbo and vision models",          color: "#00a67e", status: "connected",    lastSync: "Just now", icon: "O" },
];

const STATUS_META: Record<IntegrationStatus, { color: string; label: string }> = {
  connected:    { color: clr.success, label: "Connected"    },
  disconnected: { color: clr.text4,   label: "Not connected" },
  error:        { color: clr.danger,  label: "Error"         },
};

export function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [selectedInt, setSelectedInt] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("sk-agencyos-demo-key-f8a2c4e9d1b7");
  const [showKey, setShowKey] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [syncing, setSyncing] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(integrations.map(i => i.category)))];

  const filtered = filterCat === "All" ? integrations : integrations.filter(i => i.category === filterCat);

  const connectedCount = integrations.filter(i => i.status === "connected").length;

  const toggleConnect = (int: Integration) => {
    if (int.status === "connected") {
      setSelectedInt(int);
    } else {
      setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, status: "connected", lastSync: "Just now" } : i));
      showToast(`${int.name} connected successfully`, "success");
    }
  };

  const confirmDisconnect = () => {
    if (!selectedInt) return;
    setIntegrations(prev => prev.map(i => i.id === selectedInt.id ? { ...i, status: "disconnected", lastSync: undefined } : i));
    showToast(`${selectedInt.name} disconnected`, "info");
    setSelectedInt(null);
  };

  const handleSync = async (id: string, name: string) => {
    setSyncing(id);
    await new Promise(r => setTimeout(r, 1200));
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: "connected", lastSync: "Just now" } : i));
    setSyncing(null);
    showToast(`${name} synced successfully`, "success");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey).then(() => showToast("API key copied", "success"));
  };

  const regenerateKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const rand = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setApiKey(`sk-agencyos-${rand}`);
    showToast("New API key generated — save it now, it won't be shown again", "warning");
  };

  return (
    <div style={{ ...SHELL, maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={PAGE_TITLE}>Integrations</h2>
          <p style={PAGE_SUB}>Connect your tools to automate workflows and sync data</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
          onClick={() => showToast("Integration marketplace coming soon", "info")}>
          Browse all
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Connected", value: connectedCount, color: clr.success, bg: "rgba(52,211,153,0.08)", bord: "rgba(52,211,153,0.15)" },
          { label: "Available", value: integrations.length, color: clr.info, bg: "rgba(96,165,250,0.08)", bord: "rgba(96,165,250,0.15)" },
          { label: "Errors", value: integrations.filter(i => i.status === "error").length, color: clr.danger, bg: "rgba(248,113,113,0.08)", bord: "rgba(248,113,113,0.15)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.bord}`, borderRadius: 12, padding: "14px 18px", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: clr.text3, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", background: filterCat === cat ? clr.accent : "var(--clr-card)", border: `1px solid ${filterCat === cat ? "rgba(124,58,237,0.4)" : "var(--clr-border)"}`, color: filterCat === cat ? "white" : clr.text3 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Integration grid */}
      <div style={SECTION_LABEL}>Integrations — {filtered.length}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 32 }}>
        <AnimatePresence>
          {filtered.map((int, i) => {
            const meta = STATUS_META[int.status];
            const isConnected = int.status === "connected";
            const isError = int.status === "error";
            const isSyncing = syncing === int.id;
            return (
              <motion.div key={int.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: isError ? "rgba(248,113,113,0.03)" : "var(--clr-card)", border: `1px solid ${isError ? "rgba(248,113,113,0.2)" : isConnected ? "rgba(52,211,153,0.12)" : "var(--clr-border)"}`, borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = isError ? "rgba(248,113,113,0.06)" : "var(--clr-card-hover)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isError ? "rgba(248,113,113,0.03)" : "var(--clr-card)"; }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${int.color}15`, border: `1px solid ${int.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: int.color, flexShrink: 0 }}>
                  {int.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: clr.text1 }}>{int.name}</span>
                    <Badge variant="default" className="text-[10px]">{int.category}</Badge>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: meta.color }}>
                      {isConnected ? <CheckCircle style={{ width: 11, height: 11 }} /> : isError ? <XCircle style={{ width: 11, height: 11 }} /> : <Link2 style={{ width: 11, height: 11 }} />}
                      {meta.label}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: clr.text3, lineHeight: 1.5, margin: 0, marginBottom: 12 }}>{int.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {int.lastSync && (
                      <span style={{ fontSize: 10, color: isError ? clr.danger : clr.text4 }}>
                        Last sync: {int.lastSync}
                      </span>
                    )}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      {isConnected && (
                        <button onClick={() => handleSync(int.id, int.name)} disabled={isSyncing}
                          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: clr.text3, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", borderRadius: 7, padding: "4px 9px", cursor: "pointer", transition: "all 0.15s" }}>
                          <RefreshCw style={{ width: 11, height: 11, animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
                          {isSyncing ? "Syncing…" : "Sync"}
                        </button>
                      )}
                      {isError && (
                        <button onClick={() => handleSync(int.id, int.name)} disabled={isSyncing}
                          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: clr.danger, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 7, padding: "4px 9px", cursor: "pointer", transition: "all 0.15s" }}>
                          <RefreshCw style={{ width: 11, height: 11 }} /> Retry
                        </button>
                      )}
                      <Button variant={isConnected ? "ghost" : "secondary"} size="sm" onClick={() => toggleConnect(int)}>
                        {isConnected ? "Disconnect" : isError ? "Reconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* API key */}
      <div style={SECTION_LABEL}>API Access</div>
      <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AgencyOS API Key</div>
            <div style={{ fontSize: 11, color: clr.text3, marginTop: 2 }}>Use this key to connect external tools and webhooks</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: clr.success }}>
            <Zap style={{ width: 11, height: 11 }} /> Active
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, background: "var(--clr-input-bg)", border: "1px solid var(--clr-input-border)", borderRadius: 9, padding: "10px 14px", fontFamily: "monospace", fontSize: 13, color: clr.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {showKey ? apiKey : apiKey.slice(0, 12) + "•".repeat(24)}
          </div>
          <button onClick={() => setShowKey(!showKey)}
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--clr-border)", background: "var(--clr-card-hover)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: clr.text3, flexShrink: 0 }}>
            {showKey ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
          </button>
          <button onClick={copyApiKey}
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--clr-border)", background: "var(--clr-card-hover)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: clr.text3, flexShrink: 0 }}>
            <Copy style={{ width: 14, height: 14 }} />
          </button>
          <Button variant="secondary" size="sm" icon={<RefreshCw style={{ width: 12, height: 12 }} />} onClick={regenerateKey}>
            Regenerate
          </Button>
        </div>
        <div style={{ fontSize: 11, color: clr.text4, marginTop: 10 }}>
          Keep this key secret. Never expose it in client-side code or public repositories.
        </div>
      </div>

      {/* Disconnect confirmation modal */}
      {selectedInt && (
        <Modal title={`Disconnect ${selectedInt.name}`} onClose={() => setSelectedInt(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: clr.text2, lineHeight: 1.6 }}>
              Disconnecting <strong style={{ color: clr.text1 }}>{selectedInt.name}</strong> will stop all syncs and automations using this integration. You can reconnect at any time.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setSelectedInt(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDisconnect}>Disconnect</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
