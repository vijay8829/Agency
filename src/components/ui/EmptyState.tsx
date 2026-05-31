"use client";
import { clr } from "@/lib/ds";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, action, onAction }: EmptyStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 24px", textAlign: "center" }}>
      {Icon && (
        <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon style={{ width: 18, height: 18, color: clr.text4 }} />
        </div>
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: clr.text3, marginBottom: 5 }}>{title}</div>
      {description && (
        <div style={{ fontSize: 12, color: clr.text4, maxWidth: 260, lineHeight: 1.65 }}>{description}</div>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          style={{ marginTop: 16, fontSize: 12, fontWeight: 600, color: clr.accentLight, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 8, padding: "7px 16px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.18)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.1)"; }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
