"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Shield, UserPlus, Trash2, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";
import { showToast } from "@/lib/toast";

type Role = "Owner" | "Admin" | "Member" | "Viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "pending";
  joinedAt: string;
  avatar: string;
}

const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

const ROLE_PERMS: Record<Role, string[]> = {
  Owner:  ["Full access", "Billing", "Delete workspace"],
  Admin:  ["All modules", "Invite members", "Manage automations"],
  Member: ["Leads, Clients, Content", "Run AI commands"],
  Viewer: ["Read-only access", "View reports"],
};

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Vijay Kiran",   email: "vijay@codeyogi.org",  role: "Owner",  status: "active",  joinedAt: "Mar 2024", avatar: "VK" },
];

const EMPTY_INVITE = { name: "", email: "", role: "Member" as Role };

export function Team() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_INVITE });
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    else if (members.some(m => m.email.toLowerCase() === form.email.toLowerCase())) errs.email = "Already a team member";
    return errs;
  };

  const handleInvite = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const newMember: Member = {
      id: String(Date.now()),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: "pending",
      joinedAt: "Just now",
      avatar: form.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setMembers(prev => [...prev, newMember]);
    setForm({ ...EMPTY_INVITE });
    setFormErrors({});
    setShowInvite(false);
    showToast(`Invite sent to ${newMember.email}`, "success");
  };

  const handleRemove = (member: Member) => {
    setMembers(prev => prev.filter(m => m.id !== member.id));
    setConfirmRemove(null);
    showToast(`${member.name} removed from team`, "info");
  };

  const handleRoleChange = (id: string, role: Role) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    setRoleDropdown(null);
    showToast("Role updated", "success");
  };

  const activeCount = members.filter(m => m.status === "active").length;
  const pendingCount = members.filter(m => m.status === "pending").length;

  return (
    <div style={{ ...SHELL, maxWidth: 780 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 style={PAGE_TITLE}>Team</h2>
          <p style={PAGE_SUB}>Manage team members, roles, and permissions</p>
        </div>
        <Button variant="primary" size="sm" icon={<UserPlus style={{ width: 13, height: 13 }} />}
          onClick={() => { setShowInvite(true); setFormErrors({}); setForm({ ...EMPTY_INVITE }); }}>
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Active members", value: activeCount, color: clr.success, bg: "rgba(52,211,153,0.08)", bord: "rgba(52,211,153,0.15)" },
          { label: "Pending invites", value: pendingCount, color: clr.warning, bg: "rgba(251,191,36,0.08)", bord: "rgba(251,191,36,0.15)" },
          { label: "Plan limit", value: "5 seats", color: clr.info, bg: "rgba(96,165,250,0.08)", bord: "rgba(96,165,250,0.15)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.bord}`, borderRadius: 12, padding: "14px 18px", flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: clr.text3, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Members list */}
      <div style={SECTION_LABEL}>Members — {members.length}</div>

      {members.length === 0 && (
        <EmptyState icon={Users} title="No team members" description="Invite your first teammate to collaborate." action="Invite Member" onAction={() => setShowInvite(true)} />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <AnimatePresence>
          {members.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
              style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>

              {/* Avatar */}
              <div style={{ width: 38, height: 38, borderRadius: 11, background: m.role === "Owner" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "var(--clr-card-hover)", border: `1px solid ${m.role === "Owner" ? "rgba(124,58,237,0.35)" : "var(--clr-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: m.role === "Owner" ? "white" : clr.text2, flexShrink: 0 }}>
                {m.avatar}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: clr.text1 }}>{m.name}</span>
                  {m.role === "Owner" && <Crown style={{ width: 12, height: 12, color: "#fbbf24" }} />}
                </div>
                <div style={{ fontSize: 12, color: clr.text3, marginTop: 1 }}>{m.email} · Joined {m.joinedAt}</div>
              </div>

              <Badge variant={m.status === "active" ? "success" : "warning"} dot={m.status === "active"}>
                {m.status === "active" ? "Active" : "Pending"}
              </Badge>

              {/* Role selector */}
              <div style={{ position: "relative" }}>
                <button
                  disabled={m.role === "Owner"}
                  onClick={() => setRoleDropdown(roleDropdown === m.id ? null : m.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: m.role === "Owner" ? clr.text4 : clr.text2, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", borderRadius: 7, padding: "5px 10px", cursor: m.role === "Owner" ? "default" : "pointer", transition: "all 0.15s" }}
                >
                  <Shield style={{ width: 12, height: 12 }} />
                  {m.role}
                </button>
                {roleDropdown === m.id && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--clr-panel-bg)", border: "1px solid var(--clr-border)", borderRadius: 10, padding: "4px", zIndex: 50, minWidth: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
                    {ROLES.filter(r => r !== "Owner").map(r => (
                      <button key={r} onClick={() => handleRoleChange(m.id, r)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7, fontSize: 13, color: clr.text2, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--clr-card-hover)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        {m.role === r && <Check style={{ width: 12, height: 12, color: clr.accent }} />}
                        <span style={{ marginLeft: m.role === r ? 0 : 20 }}>{r}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.role !== "Owner" && (
                <button onClick={() => setConfirmRemove(m)}
                  style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--clr-border)", background: "var(--clr-card-hover)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", color: clr.text4, flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.danger; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.3)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)"; }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Role permissions guide */}
      <div style={{ marginTop: 28 }}>
        <div style={SECTION_LABEL}>Role Permissions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {ROLES.map(role => (
            <div key={role} style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: 11, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: clr.text1, marginBottom: 10 }}>{role}</div>
              {ROLE_PERMS[role].map(perm => (
                <div key={perm} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <Check style={{ width: 11, height: 11, color: clr.success, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: clr.text3 }}>{perm}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <Modal title="Invite Team Member" onClose={() => { setShowInvite(false); setFormErrors({}); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>FULL NAME *</label>
              <input style={{ ...INPUT_STYLE, borderColor: formErrors.name ? clr.danger : undefined }} {...INPUT_FOCUS}
                placeholder="Jane Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              {formErrors.name && <p style={{ fontSize: 11, color: clr.danger, marginTop: 4 }}>{formErrors.name}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>EMAIL *</label>
              <input style={{ ...INPUT_STYLE, borderColor: formErrors.email ? clr.danger : undefined }} {...INPUT_FOCUS}
                placeholder="jane@agency.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              {formErrors.email && <p style={{ fontSize: 11, color: clr.danger, marginTop: 4 }}>{formErrors.email}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>ROLE</label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["Admin", "Member", "Viewer"] as Role[]).map(r => (
                  <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", background: form.role === r ? clr.accent : "var(--clr-card)", border: `1px solid ${form.role === r ? "rgba(124,58,237,0.5)" : "var(--clr-border)"}`, color: form.role === r ? "white" : clr.text3 }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.14)", borderRadius: 9, padding: "10px 12px", fontSize: 12, color: clr.text3 }}>
              An invite link will be sent to their email. They can join as <strong style={{ color: clr.text1 }}>{form.role}</strong>.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowInvite(false); setFormErrors({}); }}>Cancel</Button>
              <Button variant="primary" icon={<Mail style={{ width: 13, height: 13 }} />} onClick={handleInvite}>Send Invite</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm remove modal */}
      {confirmRemove && (
        <Modal title="Remove Member" onClose={() => setConfirmRemove(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: clr.text2, lineHeight: 1.6 }}>
              Remove <strong style={{ color: clr.text1 }}>{confirmRemove.name}</strong> from your workspace?
              They will lose access immediately.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setConfirmRemove(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleRemove(confirmRemove)}>Remove Member</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
