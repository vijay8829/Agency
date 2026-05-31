"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { clr } from "@/lib/ds";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ title, onClose, children, maxWidth = 440 }: ModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: "var(--clr-panel-bg)", border: "1px solid var(--clr-border)", borderRadius: 18, padding: "24px 28px", width: "100%", maxWidth, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, paddingBottom: 16, borderBottom: "1px solid var(--clr-border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--clr-text1)", letterSpacing: "-0.02em" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${clr.border}`, background: "var(--clr-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: clr.text4 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text2; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = clr.text4; }}
          >
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
