"use client";
import { cn } from "@/lib/utils";

const CARD = "var(--clr-card)";
const CARD_H = "var(--clr-card-hover)";
const BORD = "var(--clr-border)";
const BORD_H = "var(--clr-border-hover)";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glass?: boolean;
  gradient?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover, glow, glass, gradient, style }: CardProps) {
  return (
    <div
      className={cn(
        hover ? "cursor-pointer" : "",
        gradient && "gradient-border",
        className
      )}
      style={{
        background: glass ? "rgba(8,11,17,0.78)" : CARD,
        border: `1px solid ${BORD}`,
        borderRadius: 14,
        padding: "18px 20px",
        backdropFilter: glass ? "blur(16px)" : undefined,
        transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
        ...style,
      }}
      onMouseEnter={hover ? e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = CARD_H;
        el.style.borderColor = BORD_H;
        if (glow) el.style.boxShadow = "0 0 0 1px rgba(124,58,237,0.1), 0 4px 24px rgba(0,0,0,0.5)";
      } : undefined}
      onMouseLeave={hover ? e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = glass ? "rgba(8,11,17,0.78)" : CARD;
        el.style.borderColor = BORD;
        el.style.boxShadow = "";
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between mb-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--clr-text1)", letterSpacing: "-0.018em" }} className={className}>
      {children}
    </h3>
  );
}

export function StatCard({ label, value, sub, color, icon: Icon, trend, trendUp }: {
  label: string; value: string | number; sub?: string;
  color?: string; icon?: React.ElementType; trend?: string; trendUp?: boolean;
}) {
  return (
    <Card hover glow className="relative overflow-hidden group">
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div className="flex items-start justify-between">
        <div>
          <div style={{ fontSize: 11, color: "var(--clr-text3)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: color || "var(--clr-text1)" }}>{value}</div>
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, marginTop: 5, fontWeight: 500, color: trendUp ? "#34d399" : "#fbbf24" }}>
              <span>{trendUp ? "↑" : "→"}</span>
              {trend}
            </div>
          )}
          {sub && !trend && <div style={{ fontSize: 11, color: "var(--clr-text4)", marginTop: 4 }}>{sub}</div>}
        </div>
        {Icon && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--clr-card-hover)", border: "1px solid var(--clr-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.18s" }}
            className="group-hover:scale-110">
            <Icon className={cn("w-4 h-4", color ? "" : "text-zinc-400")} style={color ? { color } : undefined} />
          </div>
        )}
      </div>
    </Card>
  );
}
