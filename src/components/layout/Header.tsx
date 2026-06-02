"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Search, Plus, Bot, FileText, Users, Zap, Menu, UserPlus, PenLine, Cpu, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { leads, clients, recentActivity } from "@/lib/data";
import { applyTheme, getSavedTheme, type ThemeMode } from "@/lib/theme";

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
  { label: "New Lead",       icon: UserPlus, module: "leads",       color: "#f5a623" },
  { label: "New Client",     icon: Users,    module: "clients",     color: "#00d4ff" },
  { label: "New Invoice",    icon: FileText, module: "operations",  color: "#06ffd3" },
  { label: "New Automation", icon: Zap,      module: "automations", color: "#8b5cf6" },
];

const ACTIVITY_ICON: Record<string, { icon: typeof Bot; bg: string; border: string; color: string }> = {
  ai:      { icon: Bot,      bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.18)",   color: "#00d4ff"  },
  bot:     { icon: Bot,      bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.18)",   color: "#00d4ff"  },
  invoice: { icon: FileText, bg: "rgba(245,166,35,0.10)",  border: "rgba(245,166,35,0.20)",  color: "#f5a623"  },
  client:  { icon: Users,    bg: "rgba(6,255,211,0.08)",   border: "rgba(6,255,211,0.18)",   color: "#06ffd3"  },
  report:  { icon: Users,    bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.20)",  color: "#a78bfa"  },
  lead:    { icon: UserPlus, bg: "rgba(0,255,157,0.08)",   border: "rgba(0,255,157,0.18)",   color: "#00ff9d"  },
  content: { icon: PenLine,  bg: "rgba(255,51,102,0.08)",  border: "rgba(255,51,102,0.18)",  color: "#ff7099"  },
};

const DEFAULT_ACTIVITY = ACTIVITY_ICON.ai;

interface HeaderProps {
  activeModule: string;
  onNavigate?: (id: string) => void;
  onMenuClick?: () => void;
}

export function Header({ activeModule, onNavigate, onMenuClick }: HeaderProps) {
  const mod = moduleLabels[activeModule] || moduleLabels.dashboard;
  const [showSearch, setShowSearch]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [tick, setTick]               = useState(0);
  /* Lazy init so toggle icon is correct on first render without a useEffect sync */
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "dark" : getSavedTheme()
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifsRef      = useRef<HTMLDivElement>(null);
  const newRef         = useRef<HTMLDivElement>(null);

  /* Subtle clock tick for the AI status clock */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

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
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const searchResults = searchQuery.trim().length > 1
    ? [
        ...leads
          .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(l => ({ type: "Lead",   name: l.name, sub: l.company,  module: "leads"   as const, color: "#f5a623" })),
        ...clients
          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.contact.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(c => ({ type: "Client", name: c.name, sub: c.contact, module: "clients" as const, color: "#00d4ff" })),
      ]
    : [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <>
      <header
        className="h-12 flex items-center justify-between px-4 sticky top-0 z-30 flex-shrink-0"
        style={{
          background: "var(--app-header-bg)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          borderBottom: "1px solid var(--app-header-border)",
          boxShadow: "0 1px 0 rgba(0,212,255,0.04), 0 4px 24px rgba(2,5,16,0.3)",
        }}
      >
        {/* Scan line animation */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: -1,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(6,255,211,0.2), rgba(0,212,255,0.3), transparent)",
          backgroundSize: "200% 100%",
          animation: "aurora-text 4s linear infinite",
        }} />

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
              <h1 className="text-sm font-semibold tracking-tight leading-none"
                style={{ color: "var(--clr-text1)", letterSpacing: "-0.02em" }}>
                {mod.label}
              </h1>
              {activeModule === "automations" && <Badge variant="success" dot pulse>Live</Badge>}
              {activeModule === "assistant"   && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                  background: "rgba(0,212,255,0.10)", border: "1px solid rgba(0,212,255,0.22)",
                  color: "#00d4ff",
                  boxShadow: "0 0 8px rgba(0,212,255,0.15)",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff9d", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                  AI ONLINE
                </span>
              )}
              {activeModule === "leads" && <Badge variant="warning">9 pending</Badge>}
            </div>
            <p className="text-[10px] mt-0.5 hidden sm:block leading-none" style={{ color: "var(--clr-text4)" }}>
              {mod.description}
            </p>
          </div>
        </div>

        {/* Right — AI clock + actions */}
        <div className="flex items-center gap-1.5">
          {/* AI system clock — hidden on small screens */}
          <div className="hidden md:flex items-center gap-1.5 mr-1"
            style={{ padding: "3px 9px", borderRadius: 7, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.08)" }}>
            <Cpu style={{ width: 9, height: 9, color: "#00d4ff", opacity: 0.7 }} />
            <span style={{ fontSize: 10, color: "var(--clr-text4)", fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: "0.05em" }}>
              {timeStr}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--clr-card)",
              border: "1px solid var(--clr-border)",
              color: theme === "dark" ? "#f5a623" : "#00d4ff",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,212,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(0,212,255,0.22)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--clr-card)";
              e.currentTarget.style.borderColor = "var(--clr-border)";
            }}
          >
            {theme === "dark"
              ? <Sun className="w-3.5 h-3.5" />
              : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 h-7 px-3 rounded-lg text-xs transition-all duration-150"
            style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", color: "var(--clr-text3)" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,212,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(0,212,255,0.20)";
              e.currentTarget.style.color = "var(--clr-text1)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--clr-card)";
              e.currentTarget.style.borderColor = "var(--clr-border)";
              e.currentTarget.style.color = "var(--clr-text3)";
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Search</span>
            <kbd className="hidden sm:flex items-center text-[10px] rounded px-1 py-0.5"
              style={{ background: "rgba(0,212,255,0.06)", color: "var(--clr-text4)", border: "1px solid rgba(0,212,255,0.08)", fontFamily: "monospace" }}>
              ⌘K
            </kbd>
          </button>

          {/* Quick add */}
          <div ref={newRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowNew(v => !v)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: showNew ? "rgba(0,212,255,0.16)" : "rgba(0,212,255,0.08)",
                border: `1px solid ${showNew ? "rgba(0,212,255,0.35)" : "rgba(0,212,255,0.18)"}`,
                boxShadow: showNew ? "0 0 16px rgba(0,212,255,0.15)" : "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,212,255,0.14)";
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.30)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(0,212,255,0.12)";
              }}
              onMouseLeave={e => {
                if (!showNew) {
                  e.currentTarget.style.background = "rgba(0,212,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.18)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <Plus className="w-3.5 h-3.5" style={{ color: "#00d4ff" }} />
              <span className="hidden sm:inline text-[11px]" style={{ color: "#00d4ff" }}>New</span>
            </button>

            {showNew && (
              <div style={{
                position: "absolute", top: 34, right: 0, zIndex: 100,
                background: "var(--clr-panel-bg)",
                border: "1px solid rgba(0,212,255,0.14)",
                borderRadius: 14, overflow: "hidden", minWidth: 172,
                boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,212,255,0.06), 0 0 40px rgba(0,212,255,0.05)",
              }}>
                <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(0,212,255,0.07)" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--clr-text4)", letterSpacing: "0.08em" }}>QUICK ADD</span>
                </div>
                {QUICK_ADD.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label}
                      onClick={() => { onNavigate?.(item.module); setShowNew(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "9px 14px", fontSize: 12.5, color: "var(--clr-text2)",
                        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.05)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text1)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text2)";
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon style={{ width: 11, height: 11, color: item.color }} />
                      </div>
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
              style={{
                background: showNotifs ? "rgba(0,212,255,0.10)" : "var(--clr-card)",
                border: `1px solid ${showNotifs ? "rgba(0,212,255,0.25)" : "var(--clr-border)"}`,
                color: showNotifs ? "#00d4ff" : "var(--clr-text3)",
                boxShadow: showNotifs ? "0 0 12px rgba(0,212,255,0.12)" : "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(0,212,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.20)";
                e.currentTarget.style.color = "#00d4ff";
              }}
              onMouseLeave={e => {
                if (!showNotifs) {
                  e.currentTarget.style.background = "var(--clr-card)";
                  e.currentTarget.style.borderColor = "var(--clr-border)";
                  e.currentTarget.style.color = "var(--clr-text3)";
                }
              }}
            >
              <Bell className="w-3.5 h-3.5" />
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 5, height: 5, borderRadius: "50%",
                background: "#ff3366",
                boxShadow: "0 0 4px rgba(255,51,102,0.7)",
              }} />
            </button>

            {showNotifs && (
              <div style={{
                position: "absolute", top: 36, right: 0, zIndex: 100,
                background: "var(--clr-panel-bg)",
                border: "1px solid rgba(0,212,255,0.12)",
                borderRadius: 14, width: 320,
                boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 40px rgba(0,212,255,0.04)",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: "1px solid rgba(0,212,255,0.07)",
                  background: "rgba(0,212,255,0.02)",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--clr-text1)" }}>Activity Feed</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                    background: "rgba(255,51,102,0.10)", border: "1px solid rgba(255,51,102,0.22)",
                    color: "#ff3366",
                  }}>5 new</span>
                </div>
                {recentActivity.map(item => {
                  const def = ACTIVITY_ICON[item.type] ?? ACTIVITY_ICON[item.icon] ?? DEFAULT_ACTIVITY;
                  const Icon = def.icon;
                  return (
                    <div key={item.id}
                      style={{ padding: "10px 16px", borderBottom: "1px solid rgba(0,212,255,0.05)", cursor: "default", transition: "background 0.12s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,212,255,0.03)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 1,
                          background: def.bg, border: `1px solid ${def.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Icon style={{ width: 12, height: 12, color: def.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "var(--clr-text2)", lineHeight: 1.5 }}>{item.message}</div>
                          <div style={{ fontSize: 10, color: "var(--clr-text4)", marginTop: 2 }}>{item.time}</div>
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
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(2,5,16,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80,
          }}
        >
          <div style={{
            width: "100%", maxWidth: 580,
            background: "var(--clr-panel-bg)",
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: 18, overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06), 0 0 60px rgba(0,212,255,0.06)",
            animation: "fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>
            {/* Search input */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
              borderBottom: "1px solid rgba(0,212,255,0.08)",
              background: "rgba(0,212,255,0.02)",
            }}>
              <Search style={{ width: 16, height: 16, color: "#00d4ff", flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search leads, clients, invoices…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14, color: "var(--clr-text1)",
                }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                style={{
                  background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.14)",
                  borderRadius: 6, padding: "3px 8px", fontSize: 10.5,
                  color: "var(--clr-text3)", cursor: "pointer", fontFamily: "monospace",
                }}>ESC</button>
            </div>

            {searchQuery.trim().length > 1 ? (
              searchResults.length > 0 ? (
                <div>
                  {searchResults.map((r, i) => (
                    <button key={i}
                      onClick={() => { onNavigate?.(r.module); setShowSearch(false); setSearchQuery(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        padding: "11px 18px", borderBottom: "1px solid rgba(0,212,255,0.04)",
                        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.04)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0, boxShadow: `0 0 6px ${r.color}80` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--clr-text1)" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "var(--clr-text3)", marginTop: 2 }}>{r.type} · {r.sub}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#00d4ff", opacity: 0.5 }}>↗</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clr-text4)", fontSize: 13 }}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              )
            ) : (
              <div style={{ padding: "20px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--clr-text4)", letterSpacing: "0.08em", marginBottom: 10 }}>JUMP TO</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(moduleLabels).map(([key, val]) => (
                    <button key={key}
                      onClick={() => { onNavigate?.(key); setShowSearch(false); setSearchQuery(""); }}
                      style={{
                        padding: "5px 12px", borderRadius: 8, fontSize: 12, color: "var(--clr-text2)",
                        background: "var(--clr-card)", border: "1px solid var(--clr-border)", cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.30)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 8px rgba(0,212,255,0.08)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text2)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)";
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                      }}
                    >
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
