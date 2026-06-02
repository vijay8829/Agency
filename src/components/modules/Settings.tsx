"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Zap, CreditCard, Globe, Mail, MessageSquare, Check, Moon, Sun, Monitor, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SHELL, PAGE_TITLE, PAGE_SUB, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";
import { applyTheme, getSavedTheme, type ThemeMode } from "@/lib/theme";
import { useLocalStorage } from "@/lib/useLocalStorage";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 40, height: 22, borderRadius: 11, position: "relative", cursor: "pointer", flexShrink: 0,
        background: enabled ? clr.accent : "var(--clr-card-hover)",
        border: `1px solid ${enabled ? "rgba(0,212,255,0.35)" : clr.border}`,
        transition: "all 0.2s ease",
      }}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid var(--clr-border)` }}>
        <Icon style={{ width: 14, height: 14, color: clr.text3 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const INITIAL_PROFILE = { name: "Vijay Kiran", agency: "Apex Agency", email: "vijay@codeyogi.org", timezone: "IST (UTC+5:30)" };

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState({ qualify: true, summary: false, recap: true });
  const [aiStyle, setAiStyle] = useState("Professional");
  const [aiModel, setAiModel] = useState("GPT-4 Turbo");
  const [savedProfile, setSavedProfile] = useLocalStorage("agencyos_profile", { ...INITIAL_PROFILE });
  const [profile, setProfile] = useState({ ...savedProfile });
  const [connStatus, setConnStatus] = useState<Record<string, boolean>>({ Gmail: true, Slack: false, Notion: true, Stripe: false });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getSavedTheme());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyTheme(mode);
    showToast(`Theme set to ${mode}`, "success");
  };

  const INTEGRATIONS = [
    { name: "Gmail",   icon: Mail,          desc: "Email automation"   },
    { name: "Slack",   icon: MessageSquare, desc: "Team notifications" },
    { name: "Notion",  icon: Globe,         desc: "Knowledge base"     },
    { name: "Stripe",  icon: CreditCard,    desc: "Payment processing" },
  ];

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSavedProfile({ ...profile });
    setSaved(true);
    showToast("Settings saved successfully", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setProfile({ ...savedProfile });
    showToast("Changes discarded", "info");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const toggleConnect = (name: string) => {
    setConnStatus(p => {
      const next = { ...p, [name]: !p[name] };
      showToast(next[name] ? `${name} connected` : `${name} disconnected`, next[name] ? "success" : "info");
      return next;
    });
  };

  const field = (label: string, key: keyof typeof profile, half?: boolean) => (
    <div style={{ width: half ? "calc(50% - 6px)" : "100%", minWidth: 0 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>{label}</label>
      <input value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
        style={INPUT_STYLE} {...INPUT_FOCUS} />
    </div>
  );

  return (
    <div style={{ ...SHELL, maxWidth: 760 }}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={PAGE_TITLE}>Settings</h2>
        <p style={PAGE_SUB}>Configure your AgencyOS workspace and integrations</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Profile */}
        <Section title="Profile" icon={User}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 52, height: 52, borderRadius: 14, background: photoPreview ? "transparent" : "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "white", flexShrink: 0, cursor: "pointer", overflow: "hidden", border: "2px solid rgba(124,58,237,0.3)" }}
            >
              {photoPreview
                ? <img src={photoPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{profile.name}</div>
              <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>{profile.email}</div>
            </div>
            <Button variant="secondary" size="sm" className="ml-auto" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {field("FULL NAME", "name", true)}
            {field("AGENCY NAME", "agency", true)}
            {field("EMAIL", "email", true)}
            {field("TIMEZONE", "timezone", true)}
          </div>
        </Section>

        {/* AI Configuration */}
        <Section title="AI Configuration" icon={Zap}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <Badge variant="purple" className="ml-auto">Pro Feature</Badge>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 8, letterSpacing: "0.04em" }}>AI Response Style</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Professional", "Casual", "Concise"].map(v => (
                <button key={v} onClick={() => setAiStyle(v)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                    background: v === aiStyle ? clr.accent : "var(--clr-card)",
                    border: `1px solid ${v === aiStyle ? "rgba(0,212,255,0.40)" : clr.border}`,
                    color: v === aiStyle ? "white" : clr.text3 }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 8, letterSpacing: "0.04em" }}>Default AI Model</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["GPT-4 Turbo", "GPT-4o", "Claude 3.5"].map(v => (
                <button key={v} onClick={() => setAiModel(v)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                    background: v === aiModel ? clr.accent : "var(--clr-card)",
                    border: `1px solid ${v === aiModel ? "rgba(0,212,255,0.40)" : clr.border}`,
                    color: v === aiModel ? "white" : clr.text3 }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "qualify" as const, label: "Auto-qualify new leads",       desc: "AI scores and qualifies leads automatically"  },
              { key: "summary" as const, label: "Send AI summaries to email",   desc: "Receive daily digest in your inbox"           },
              { key: "recap"   as const, label: "Auto-generate meeting recaps", desc: "AI creates action items from your meetings"   },
            ].map(t => (
              <div key={t.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: clr.text1, fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: clr.text4, marginTop: 2 }}>{t.desc}</div>
                </div>
                <Toggle enabled={toggles[t.key]} onChange={v => setToggles(p => ({ ...p, [t.key]: v }))} />
              </div>
            ))}
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={Palette}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 10, letterSpacing: "0.04em" }}>THEME MODE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { mode: "dark"   as ThemeMode, label: "Dark",   Icon: Moon,    desc: "Easy on the eyes"          },
                { mode: "light"  as ThemeMode, label: "Light",  Icon: Sun,     desc: "High contrast, bright UI"  },
                { mode: "system" as ThemeMode, label: "System", Icon: Monitor, desc: "Follows OS preference"     },
              ] as { mode: ThemeMode; label: string; Icon: React.ElementType; desc: string }[]).map(({ mode, label, Icon, desc }) => {
                const active = themeMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleThemeChange(mode)}
                    style={{
                      flex: 1,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      padding: "14px 10px", borderRadius: 12, cursor: "pointer", transition: "all 0.18s",
                      background: active ? "rgba(0,212,255,0.12)" : "var(--clr-card)",
                      border: `1px solid ${active ? "rgba(124,58,237,0.45)" : clr.border}`,
                      outline: "none",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.25)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "rgba(124,58,237,0.2)" : "var(--clr-card-hover)",
                      border: `1px solid ${active ? "rgba(124,58,237,0.35)" : clr.border}`,
                    }}>
                      <Icon style={{ width: 16, height: 16, color: active ? "#a78bfa" : clr.text3 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? "#c4b5fd" : clr.text2 }}>{label}</div>
                    <div style={{ fontSize: 10, color: active ? "#a78bfa" : clr.text4, textAlign: "center", lineHeight: 1.4 }}>{desc}</div>
                    {active && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: clr.accent }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: clr.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: clr.text3 }}>
              {themeMode === "system"
                ? "Theme will match your OS dark/light mode setting"
                : `${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} theme is active — change takes effect immediately`}
            </span>
          </div>
        </Section>

        {/* Integrations */}
        <Section title="Integrations" icon={Globe}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INTEGRATIONS.map(int => {
              const Icon = int.icon;
              const connected = connStatus[int.name];
              return (
                <div key={int.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--clr-card)", border: `1px solid ${clr.border}`, borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--clr-card-hover)", border: `1px solid ${clr.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 15, height: 15, color: connected ? clr.text2 : clr.text4 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{int.name}</div>
                    <div style={{ fontSize: 11, color: clr.text3, marginTop: 1 }}>{int.desc}</div>
                  </div>
                  {connected
                    ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: clr.success, fontWeight: 600 }}>
                          <Check style={{ width: 12, height: 12 }} /> Connected
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleConnect(int.name)}>Disconnect</Button>
                      </div>
                    )
                    : <Button variant="secondary" size="sm" onClick={() => toggleConnect(int.name)}>Connect</Button>}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Plan */}
        <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>Current Plan: Pro</div>
              <div style={{ fontSize: 12, color: clr.text3, marginTop: 2 }}>$49/month · Renews Dec 21, 2024</div>
            </div>
            <Button variant="primary" size="sm" onClick={() => showToast("Opening billing portal…", "info")}>Upgrade</Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "AI Tasks",     used: 847, max: 1000 },
              { label: "Automations",  used: 5,   max: 20   },
              { label: "Team Members", used: 1,   max: 5    },
            ].map(u => (
              <div key={u.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: clr.text3 }}>{u.label}</span>
                  <span style={{ fontSize: 11, color: clr.text2 }}>{u.used}/{u.max}</span>
                </div>
                <div style={{ height: 4, background: "var(--clr-border)", borderRadius: 4, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(u.used / u.max) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ height: "100%", background: clr.accent, borderRadius: 4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save row */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} icon={saved ? <Check style={{ width: 13, height: 13 }} /> : undefined}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
