"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { subscribeToasts, ToastItem } from "@/lib/toast";

const ICONS = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const COLORS = {
  success: { color: "#34d399", border: "rgba(52,211,153,0.22)" },
  error:   { color: "#f87171", border: "rgba(248,113,113,0.22)" },
  warning: { color: "#fbbf24", border: "rgba(251,191,36,0.22)"  },
  info:    { color: "#60a5fa", border: "rgba(96,165,250,0.22)"  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column-reverse", gap: 8, alignItems: "center", pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          const c = COLORS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              style={{ pointerEvents: "auto", background: "var(--clr-panel-bg)", border: `1px solid ${c.border}`, borderRadius: 12, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(24px)", minWidth: 260, maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 1px 0 var(--clr-border)" }}
            >
              <Icon style={{ width: 15, height: 15, color: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--clr-text1)", flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
