"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  LayoutDashboard, Users, UserCheck, Settings,
  Zap, BarChart3, Bot, Megaphone, BriefcaseBusiness,
  Sparkles, ChevronDown, Activity, CreditCard, Bell, Link2
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  highlight?: boolean;
  badge?: string;
  color?: string;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard",   icon: LayoutDashboard },
      { id: "assistant", label: "AI Employee", icon: Bot, highlight: true, badge: "AI", color: "#00d4ff" },
      { id: "health",    label: "Health Score",icon: Activity },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "leads",      label: "Leads",      icon: Users,            badge: "9", color: "#f5a623" },
      { id: "clients",    label: "Clients",    icon: UserCheck },
      { id: "operations", label: "Operations", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "content",     label: "Content",     icon: Megaphone },
      { id: "automations", label: "Automations", icon: Zap, badge: "7", color: "#06ffd3" },
      { id: "reports",     label: "Reports",     icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell,      badge: "4", color: "#ff3366" },
      { id: "team",          label: "Team",          icon: Users },
      { id: "integrations",  label: "Integrations",  icon: Link2 },
      { id: "billing",       label: "Billing",       icon: CreditCard },
      { id: "settings",      label: "Settings",      icon: Settings },
    ],
  },
];

interface SidebarProps {
  activeModule: string;
  onNavigate: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/* Animated neural network SVG */
function NeuralNet() {
  return (
    <svg width="100%" height="72" viewBox="0 0 200 72" fill="none" style={{ opacity: 0.45 }}>
      {/* nodes */}
      {[
        [20,36],[60,18],[60,54],[100,36],[140,18],[140,54],[180,36],
        [100,10],[100,62],
      ].map(([cx,cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={2.5} fill="rgba(0,212,255,0.7)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1.8 + i*0.22}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="2;3;2" dur={`${1.8 + i*0.22}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={5} fill="none" stroke="rgba(0,212,255,0.15)">
            <animate attributeName="r" values="5;9;5" dur={`${2.4 + i*0.18}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.4 + i*0.18}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {/* edges */}
      {[
        [[20,36],[60,18]],[[20,36],[60,54]],
        [[60,18],[100,36]],[[60,54],[100,36]],
        [[60,18],[100,10]],[[60,54],[100,62]],
        [[100,36],[140,18]],[[100,36],[140,54]],
        [[100,10],[140,18]],[[100,62],[140,54]],
        [[140,18],[180,36]],[[140,54],[180,36]],
      ].map(([[x1,y1],[x2,y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(0,212,255,0.18)" strokeWidth="0.8">
          <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${2 + i*0.15}s`} repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
}

export function Sidebar({ activeModule, onNavigate, isOpen = false, onClose }: SidebarProps) {
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 39,
              background: "rgba(2,5,16,0.70)",
              backdropFilter: "blur(8px)" }}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        style={{
          position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex", flexDirection: "column",
          zIndex: 40,
          transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), background-color 0.25s ease, border-color 0.25s ease",
          overflow: "hidden",
        }}
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Ambient gradient top */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 120,
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo + close */}
        <div style={{ padding: "18px 16px 14px", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(0,212,255,0.35), 0 0 24px rgba(0,212,255,0.15)",
            }}>
              <Sparkles style={{ width: 13, height: 13, color: "white" }} />
            </div>
            {/* Beacon ring */}
            <div style={{
              position: "absolute", inset: -3, borderRadius: 12,
              border: "1px solid rgba(0,212,255,0.3)",
              animation: "beacon 3s ease-out infinite",
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--clr-text1)", letterSpacing: "-0.025em", flex: 1 }}>
            Agency<span style={{ color: "#00d4ff" }}>OS</span>
          </span>
          <button
            className="md:hidden"
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--clr-border)", background: "var(--clr-card)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--clr-text3)" }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Workspace selector */}
        <div style={{ padding: "0 10px 12px" }}>
          <button
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "7px 8px", borderRadius: 8,
              background: "transparent", border: "none", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "linear-gradient(135deg,#00d4ff,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0,
              boxShadow: "0 0 8px rgba(0,212,255,0.3)",
            }}>A</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text2)", flex: 1, textAlign: "left" }}>Apex Agency</span>
            <ChevronDown style={{ width: 12, height: 12, color: "var(--clr-text4)", flexShrink: 0 }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--sidebar-border), transparent)", margin: "0 16px 8px" }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "6px 10px", overflowY: "auto" }}>
          {navGroups.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < navGroups.length - 1 ? 20 : 0 }}>
              <div style={{
                fontSize: 9.5, fontWeight: 700, color: "var(--clr-text4)",
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0 8px", marginBottom: 4,
              }}>
                {group.label}
              </div>
              {group.items.map(item => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                const accentColor = item.highlight ? "#00d4ff" : (item.color ?? "currentcolor");
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                      background: isActive ? "rgba(0,212,255,0.08)" : "transparent",
                      color: isActive ? "#00d4ff" : item.highlight ? "rgba(0,212,255,0.75)" : "var(--sidebar-text)",
                      transition: "background 0.15s, color 0.15s",
                      marginBottom: 1,
                      position: "relative",
                      minHeight: 38,
                      boxShadow: isActive ? "inset 0 0 0 1px rgba(0,212,255,0.14)" : "none",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-hover)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-text1)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = item.highlight ? "rgba(0,212,255,0.75)" : "var(--sidebar-text)";
                      }
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        style={{
                          position: "absolute", inset: 0,
                          background: "rgba(0,212,255,0.07)",
                          borderRadius: 7,
                          boxShadow: "0 0 16px rgba(0,212,255,0.08), inset 0 0 0 1px rgba(0,212,255,0.15)",
                        }}
                        transition={{ type: "spring", bounce: 0.10, duration: 0.28 }}
                      />
                    )}
                    {/* Active left bar */}
                    {isActive && (
                      <div style={{
                        position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
                        width: 3, height: 18, borderRadius: 2,
                        background: "linear-gradient(180deg, #00d4ff, #8b5cf6)",
                        boxShadow: "0 0 8px rgba(0,212,255,0.6)",
                      }} />
                    )}
                    <Icon style={{
                      width: 15, height: 15, flexShrink: 0,
                      position: "relative",
                      color: isActive ? "#00d4ff" : item.color ?? "currentcolor",
                      filter: isActive ? "drop-shadow(0 0 4px rgba(0,212,255,0.5))" : "none",
                    }} />
                    <span style={{
                      fontSize: 13, fontWeight: isActive ? 600 : 450,
                      flex: 1, textAlign: "left", position: "relative",
                      letterSpacing: "-0.01em",
                    }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, position: "relative",
                        color: item.highlight ? "#00d4ff" : (item.color ?? "var(--clr-text3)"),
                        background: item.highlight
                          ? "rgba(0,212,255,0.12)"
                          : item.color
                            ? `${item.color}18`
                            : "var(--clr-card)",
                        border: `1px solid ${item.highlight ? "rgba(0,212,255,0.22)" : item.color ? `${item.color}30` : "var(--clr-border)"}`,
                        borderRadius: 5, padding: "1px 5px",
                        boxShadow: item.highlight ? "0 0 6px rgba(0,212,255,0.2)" : "none",
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--sidebar-border), transparent)", margin: "0 16px 8px" }} />

        {/* Neural net visualization */}
        <div style={{ padding: "4px 8px 0", opacity: 0.6 }}>
          <NeuralNet />
        </div>

        {/* AI Status indicator */}
        <div style={{ padding: "6px 16px 10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 10px", borderRadius: 8,
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.10)",
          }}>
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#00ff9d" }} />
              <div style={{
                position: "absolute", inset: -2, borderRadius: "50%",
                border: "1px solid rgba(0,255,157,0.4)",
                animation: "beacon 2s ease-out infinite",
              }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#00d4ff", flex: 1 }}>AI Systems Online</span>
            <span style={{ fontSize: 9, color: "var(--clr-text4)" }}>99.9%</span>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: "0 10px 16px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg,#00d4ff,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
              boxShadow: "0 0 10px rgba(0,212,255,0.3)",
            }}>V</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text2)", lineHeight: 1.2 }}>Vijay Kiran</div>
              <div style={{ fontSize: 10, color: "#00d4ff", marginTop: 1, opacity: 0.7 }}>Pro Plan</div>
            </div>
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff9d" }} />
              <div style={{ position: "absolute", inset: -2, borderRadius: "50%", border: "1px solid rgba(0,255,157,0.4)", animation: "beacon 2.5s ease-out infinite" }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
