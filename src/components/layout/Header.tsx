"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Search, Plus, Bot, FileText, Users, Zap, Menu, UserPlus, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { leads, clients, recentActivity } from "@/lib/data";

const moduleLabels: Record<string, { label: string; description: string }> = {
  dashboard:     { label: "Dashboard",      description: "Overview & AI command"      },
  leads:         { label: "Leads",          description: "Pipeline · 9 pending"       },
  clients:       { label: "Clients",        description: "Relationships & health"     },
  content:       { label: "Content",        description: "Creation & scheduling"      },
  operations:    { label: "Operations",     description: "Invoices & workflows"       },
  automations:   { label: "Automations",    description: "7 workflows active"         },
  reports:       { label: "Reports",        description: "Business intelligence"      },
  assistant:     { label: "AI Employee",    description: "Full-context assistant"     },
  settings:      { label: "Settings",       description: "Workspace config"           },
  health:        { label: "Health Score",   description: "Agency vital signs"         },
  billing:       { label: "Billing",        description: "Plans, payments & invoices" },
  team:          { label: "Team",           description: "Members & permissions"      },
  notifications: { label: "Notifications",  description: "Alerts & activity feed"     },
  integrations:  { label: "Integrations",   description: "Connected apps & APIs"      },
};

const QUICK_ADD = [
  { label: "New Lead",       icon: UserPlus, module: "leads"      },
  { label: "New Client",     icon: Users,    module: "clients"    },
  { label: "New Invoice",    icon: FileText, module: "operations" },
  { label: "New Automation", icon: Zap,      module: "automations"},
];

const ACTIVITY_ICON: Record<string, { icon: typeof Bot; bg: string; border: string; color: string }> = {
  ai:      { icon: Bot,      bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.22)",  color: "#a78bfa" },
  bot:     { icon: Bot,      bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.22)",  color: "#a78bfa" },
  invoice: { icon: FileText, bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.22)",  color: "#fbbf24" },
  client:  { icon: Users,    bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.22)",   color: "#60a5fa" },
  report:  { icon: Users,    bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.22)",   color: "#60a5fa" },
  lead:    { icon: UserPlus, bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.22)",  color: "#34d399" },
  content: { icon: PenLine,  bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.22)",  color: "#f472b6" },
};

const DEFAULT_ACTIVITY = ACTIVITY_ICON.ai;

interface HeaderProps {
  activeModule: string;
  onNavigate?: (id: string) => void;
  onMenuClick?: () => void;
}

export function Header({ activeModule, onNavigate, onMenuClick }: HeaderProps) {
  const mod = moduleLabels[activeModule] || moduleLabels.dashboard;

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifsRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (newRef.current && !newRef.current.contains(e.target as Node)) setShowNew(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [showSearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchResults = searchQuery.trim().length > 1
    ? [
        ...leads
          .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(l => ({ type: "Lead", name: l.name, sub: l.company, module: "leads" as const })),
        ...clients
          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.contact.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(c => ({ type: "Client", name: c.name, sub: c.contact, module: "clients" as const })),
      ]
    : [];

  return (
    <>
      <header
        className="h-12 flex items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0"
        style={{ background: "var(--app-header-bg)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--app-header-border)" }}
      >
        {/* Left — title + context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg transition-colors flex-shrink-0"
            style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", color: "var(--clr-text3)" }}
            onClick={onMenuClick}
          >
            <Menu className="w-3.5 h-3.5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight leading-none" style={{ color: "var(--clr-text1)" }}>{mod.label}</h1>
              {activeModule === "automations" && <Badge variant="success" dot pulse>Live</Badge>}
              {activeModule === "assistant"   && <Badge variant="purple" dot pulse>AI Online</Badge>}
              {activeModule === "leads"       && <Badge variant="warning">9 pending</Badge>}
            </div>
            <p className="text-[11px] mt-0.5 hidden sm:block leading-none" style={{ color: "var(--clr-text4)" }}>{mod.description}</p>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 h-7 px-3 rounded-lg text-xs transition-all duration-150"
            style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", color: "var(--clr-text3)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--clr-card-hover)"; e.currentTarget.style.borderColor = "var(--clr-border-hover)"; e.currentTarget.style.color = "var(--clr-text1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--clr-card)"; e.currentTarget.style.borderColor = "var(--clr-border)"; e.currentTarget.style.color = "var(--clr-text3)"; }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Search</span>
            <kbd className="hidden sm:flex items-center text-[10px] rounded px-1 py-0.5" style={{ background: "rgba(255,255,255,0.05)", color: "var(--clr-text4)" }}>⌘K</kbd>
          </button>

          {/* Quick add */}
          <div ref={newRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNew(v => !v)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.25)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.22)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.14)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; }}
            >
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline text-violet-300 text-[11px]">New</span>
            </button>
            {showNew && (
              <div style={{ position: "absolute", top: 34, right: 0, zIndex: 100, background: "var(--clr-panel-bg)", border: "1px solid var(--clr-border)", borderRadius: 12, overflow: "hidden", minWidth: 164, boxShadow: "0 8px 32px rgba(0,0,0,0.28)" }}>
                {QUICK_ADD.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={() => { onNavigate?.(item.module); setShowNew(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", fontSize: 13, color: "var(--clr-text2)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text1)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text2)"; }}>
                      <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifsRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifs(v => !v)}
              className="relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{ background: showNotifs ? "var(--clr-card-hover)" : "var(--clr-card)", border: `1px solid ${showNotifs ? "var(--clr-border-hover)" : "var(--clr-border)"}`, color: "var(--clr-text3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--clr-card-hover)"; e.currentTarget.style.borderColor = "var(--clr-border-hover)"; e.currentTarget.style.color = "var(--clr-text1)"; }}
              onMouseLeave={e => { if (!showNotifs) { e.currentTarget.style.background = "var(--clr-card)"; e.currentTarget.style.borderColor = "var(--clr-border)"; e.currentTarget.style.color = "var(--clr-text3)"; } }}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
            </button>
            {showNotifs && (
              <div style={{ position: "absolute", top: 34, right: 0, zIndex: 100, background: "var(--clr-panel-bg)", border: "1px solid var(--clr-border)", borderRadius: 12, width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.28)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text1)" }}>Recent Activity</span>
                  <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>5 new</span>
                </div>
                {recentActivity.map(item => {
                  const def = ACTIVITY_ICON[item.type] ?? ACTIVITY_ICON[item.icon] ?? DEFAULT_ACTIVITY;
                  const Icon = def.icon;
                  return (
                    <div key={item.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--clr-border)", cursor: "default" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--clr-card-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: def.bg, border: `1px solid ${def.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <Icon style={{ width: 12, height: 12, color: def.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "var(--clr-text2)", lineHeight: 1.5 }}>{item.message}</div>
                          <div style={{ fontSize: 11, color: "var(--clr-text4)", marginTop: 3 }}>{item.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {showSearch && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setShowSearch(false); setSearchQuery(""); } }}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }}
        >
          <div style={{ width: "100%", maxWidth: 560, background: "var(--clr-panel-bg)", border: "1px solid var(--clr-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--clr-border)" }}>
              <Search style={{ width: 16, height: 16, color: "var(--clr-text4)", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads, clients, invoices…"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--clr-text1)" }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 6, padding: "3px 7px", fontSize: 11, color: "var(--clr-text3)", cursor: "pointer" }}>
                ESC
              </button>
            </div>
            {searchQuery.trim().length > 1 ? (
              searchResults.length > 0 ? (
                <div>
                  {searchResults.map((r, i) => (
                    <button key={i} onClick={() => { onNavigate?.(r.module); setShowSearch(false); setSearchQuery(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 18px", borderBottom: "1px solid var(--clr-border)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.type === "Lead" ? "#fbbf24" : "#34d399", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--clr-text1)" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "var(--clr-text3)", marginTop: 2 }}>{r.type} · {r.sub}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--clr-text4)" }}>→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clr-text4)", fontSize: 13 }}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              )
            ) : (
              <div style={{ padding: "24px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--clr-text4)", letterSpacing: "0.06em", marginBottom: 10 }}>JUMP TO</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(moduleLabels).map(([key, val]) => (
                    <button key={key} onClick={() => { onNavigate?.(key); setShowSearch(false); setSearchQuery(""); }}
                      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, color: "var(--clr-text2)", background: "var(--clr-card)", border: "1px solid var(--clr-border)", cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card-hover)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card)"; }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
