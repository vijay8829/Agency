"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
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
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
      { id: "assistant",     label: "AI Employee",   icon: Bot, highlight: true, badge: "AI" },
      { id: "health",        label: "Health Score",  icon: Activity },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "leads",         label: "Leads",         icon: Users,            badge: "9" },
      { id: "clients",       label: "Clients",       icon: UserCheck                    },
      { id: "operations",    label: "Operations",    icon: BriefcaseBusiness            },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "content",       label: "Content",       icon: Megaphone                    },
      { id: "automations",   label: "Automations",   icon: Zap,              badge: "7" },
      { id: "reports",       label: "Reports",       icon: BarChart3                    },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell,             badge: "4" },
      { id: "team",          label: "Team",          icon: Users                        },
      { id: "integrations",  label: "Integrations",  icon: Link2                        },
      { id: "billing",       label: "Billing",       icon: CreditCard                   },
      { id: "settings",      label: "Settings",      icon: Settings                     },
    ],
  },
];

interface SidebarProps {
  activeModule: string;
  onNavigate: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeModule, onNavigate, isOpen = false, onClose }: SidebarProps) {
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 39, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          className="md:hidden"
        />
      )}

      <aside
        style={{
          position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex", flexDirection: "column",
          zIndex: 40,
          transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), background-color 0.25s ease, border-color 0.25s ease",
        }}
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo + close (mobile) */}
        <div style={{ padding: "18px 16px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles style={{ width: 13, height: 13, color: "white" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--clr-text1)", letterSpacing: "-0.02em", flex: 1 }}>AgencyOS</span>
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
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0 }}>A</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text2)", flex: 1, textAlign: "left" }}>Apex Agency</span>
            <ChevronDown style={{ width: 12, height: 12, color: "var(--clr-text4)", flexShrink: 0 }} />
          </button>
        </div>

        <div style={{ height: 1, background: "var(--sidebar-border)", margin: "0 16px 8px" }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "6px 10px", overflowY: "auto" }}>
          {navGroups.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < navGroups.length - 1 ? 20 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--clr-text4)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>
                {group.label}
              </div>
              {group.items.map(item => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                      background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                      color: isActive ? "var(--sidebar-text-active)" : item.highlight ? "#a78bfa" : "var(--sidebar-text)",
                      transition: "background 0.15s, color 0.15s",
                      marginBottom: 2,
                      position: "relative",
                      minHeight: 40,
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
                        (e.currentTarget as HTMLButtonElement).style.color = item.highlight ? "#a78bfa" : "var(--sidebar-text)";
                      }
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        style={{ position: "absolute", inset: 0, background: "rgba(124,58,237,0.1)", borderRadius: 7, left: -2, right: -2 }}
                        transition={{ type: "spring", bounce: 0.12, duration: 0.28 }}
                      />
                    )}
                    <Icon style={{ width: 15, height: 15, flexShrink: 0, position: "relative", color: isActive ? "#a78bfa" : "currentcolor" }} />
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 450, flex: 1, textAlign: "left", position: "relative", letterSpacing: "-0.01em" }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, position: "relative",
                        color: item.highlight ? "#a78bfa" : "var(--clr-text4)",
                        background: item.highlight ? "rgba(124,58,237,0.15)" : "var(--clr-card-hover)",
                        borderRadius: 5, padding: "1px 5px",
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

        <div style={{ height: 1, background: "var(--sidebar-border)", margin: "0 16px 10px" }} />

        {/* User */}
        <div style={{ padding: "0 10px 16px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>V</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--clr-text2)", lineHeight: 1.2 }}>Vijay Kiran</div>
              <div style={{ fontSize: 10, color: "var(--clr-text4)", marginTop: 1 }}>Pro Plan</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}
