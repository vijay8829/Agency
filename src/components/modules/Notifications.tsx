"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, Filter, Zap, DollarSign, Users, TrendingUp, AlertCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";
import { useLocalStorage } from "@/lib/useLocalStorage";

type NotifType = "ai" | "lead" | "invoice" | "client" | "system" | "report";
type FilterType = "all" | NotifType;

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notif[] = [
  { id: "1",  type: "ai",      title: "AI Task Completed",         body: "Follow-up emails sent to 4 warm leads successfully.",         time: "2m ago",   read: false },
  { id: "2",  type: "lead",    title: "New Hot Lead",              body: "Alex Thompson from NextWave Studios — $22k potential deal.",  time: "11m ago",  read: false },
  { id: "3",  type: "invoice", title: "Invoice Overdue",           body: "Apex Digital INV-2024-008 — $4,500 · 12 days overdue.",      time: "1h ago",   read: false },
  { id: "4",  type: "client",  title: "Client Health Alert",       body: "Meridian Group dropped to 45% health score — action needed.", time: "2h ago",   read: false },
  { id: "5",  type: "ai",      title: "Automation Triggered",      body: "Invoice Reminder flow executed — 3 reminders sent.",         time: "3h ago",   read: true  },
  { id: "6",  type: "report",  title: "Weekly Report Ready",       body: "Your Nov 11–17 business summary is ready to review.",        time: "5h ago",   read: true  },
  { id: "7",  type: "lead",    title: "Lead Status Updated",       body: "Jordan Lee (Flux Creative) moved from warm → hot.",          time: "8h ago",   read: true  },
  { id: "8",  type: "system",  title: "Plan Usage Warning",        body: "You've used 847/1000 AI tasks this cycle (85%).",            time: "1d ago",   read: true  },
  { id: "9",  type: "invoice", title: "Payment Received",          body: "Vanta Labs paid INV-2024-009 — $8,750 received.",           time: "2d ago",   read: true  },
  { id: "10", type: "client",  title: "New Client Onboarded",     body: "Nova Commerce onboarded — welcome sequence triggered.",      time: "3d ago",   read: true  },
];

const PREF_DEFAULTS: Record<NotifType, boolean> = {
  ai: true, lead: true, invoice: true, client: true, system: true, report: true,
};

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; label: string }> = {
  ai:      { icon: Bot,         color: "#a78bfa", label: "AI"      },
  lead:    { icon: Users,       color: clr.info,   label: "Leads"   },
  invoice: { icon: DollarSign,  color: clr.warning,label: "Invoices"},
  client:  { icon: AlertCircle, color: clr.danger,  label: "Clients" },
  system:  { icon: Zap,         color: clr.text3,   label: "System"  },
  report:  { icon: TrendingUp,  color: "#2dd4bf",  label: "Reports" },
};

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all",     label: "All"      },
  { id: "ai",      label: "AI"       },
  { id: "lead",    label: "Leads"    },
  { id: "invoice", label: "Invoices" },
  { id: "client",  label: "Clients"  },
  { id: "system",  label: "System"   },
];

export function Notifications() {
  const [notifs, setNotifs] = useLocalStorage<Notif[]>("agencyos_notifications", INITIAL_NOTIFS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [prefs, setPrefs] = useState({ ...PREF_DEFAULTS });
  const [showPrefs, setShowPrefs] = useState(false);

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => filter === "all" || n.type === filter);

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };

  const deleteNotif = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifs([]);
    showToast("All notifications cleared", "info");
  };

  const togglePref = (type: NotifType) => {
    setPrefs(p => ({ ...p, [type]: !p[type] }));
  };

  const savePrefss = () => {
    setShowPrefs(false);
    showToast("Notification preferences saved", "success");
  };

  return (
    <div style={{ ...SHELL, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h2 style={PAGE_TITLE}>Notifications</h2>
          <p style={PAGE_SUB}>Stay updated on leads, clients, invoices, and AI activity</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" icon={<CheckCheck style={{ width: 13, height: 13 }} />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" icon={<Filter style={{ width: 13, height: 13 }} />} onClick={() => setShowPrefs(!showPrefs)}>
            Preferences
          </Button>
          {notifs.length > 0 && (
            <Button variant="ghost" size="sm" icon={<Trash2 style={{ width: 13, height: 13 }} />} onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Preferences panel */}
      <AnimatePresence>
        {showPrefs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "16px 18px", marginBottom: 20, overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: clr.text2, marginBottom: 14, letterSpacing: "0.04em" }}>NOTIFICATION PREFERENCES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {(Object.keys(TYPE_META) as NotifType[]).map(type => {
                const meta = TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <button key={type} onClick={() => togglePref(type)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 9, border: `1px solid ${prefs[type] ? meta.color + "33" : "var(--clr-border)"}`, background: prefs[type] ? `${meta.color}0d` : "var(--clr-card-hover)", cursor: "pointer", transition: "all 0.15s" }}>
                    <Icon style={{ width: 13, height: 13, color: prefs[type] ? meta.color : clr.text4 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: prefs[type] ? clr.text1 : clr.text4 }}>{meta.label}</span>
                    {prefs[type] && <Check style={{ width: 11, height: 11, color: meta.color, marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Button variant="primary" size="sm" onClick={savePrefss}>Save Preferences</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {unreadCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#a78bfa", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, padding: "4px 12px" }}>
            <Bell style={{ width: 12, height: 12 }} />
            {unreadCount} unread
          </div>
        )}
        <div style={{ fontSize: 12, color: clr.text4 }}>{notifs.length} total notifications</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", background: filter === f.id ? clr.accent : "var(--clr-card)", border: `1px solid ${filter === f.id ? "rgba(124,58,237,0.4)" : "var(--clr-border)"}`, color: filter === f.id ? "white" : clr.text3 }}>
            {f.label}
            {f.id !== "all" && notifs.filter(n => n.type === f.id && !n.read).length > 0 && (
              <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: filter === f.id ? "white" : "#a78bfa" }}>
                {notifs.filter(n => n.type === f.id && !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={SECTION_LABEL}>
        {filter === "all" ? "All Notifications" : TYPE_META[filter as NotifType]?.label} — {filtered.length}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! New alerts will appear here." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence>
          {filtered.map((n, i) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}
                onClick={() => markRead(n.id)}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, background: n.read ? "var(--clr-card)" : "rgba(124,58,237,0.04)", border: `1px solid ${n.read ? "var(--clr-border)" : "rgba(124,58,237,0.2)"}`, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--clr-card-hover)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "var(--clr-card)" : "rgba(124,58,237,0.04)"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${meta.color}12`, border: `1px solid ${meta.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Icon style={{ width: 14, height: 14, color: meta.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{n.title}</span>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />}
                    <Badge variant="default" className="ml-auto">{meta.label}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: clr.text3, lineHeight: 1.5, margin: 0 }}>{n.body}</p>
                  <div style={{ fontSize: 10, color: clr.text4, marginTop: 5 }}>{n.time}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                  style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid transparent", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", color: clr.text4, flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.danger; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.25)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.06)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
