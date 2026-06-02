/* Design-system constants shared across all app modules */
import type { CSSProperties } from "react";

export const CARD: CSSProperties = {
  background: "var(--clr-card)",
  border: "1px solid var(--clr-border)",
  borderRadius: 14,
  padding: "18px 20px",
};

export const CARD_ACCENT: CSSProperties = {
  ...CARD,
  background: "rgba(124,58,237,0.045)",
  border: "1px solid rgba(124,58,237,0.18)",
};

export const SHELL: CSSProperties = {
  padding: "32px 36px",
  maxWidth: 1120,
  margin: "0 auto",
};

export const PAGE_TITLE: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: "-0.025em",
  color: "var(--clr-text1)",
};

export const PAGE_SUB: CSSProperties = {
  fontSize: 13,
  color: "var(--clr-text3)",
  marginTop: 4,
};

export const SECTION_LABEL: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--clr-text4)",
  marginBottom: 10,
};

export const AI_BLOCK: CSSProperties = {
  background: "rgba(124,58,237,0.045)",
  border: "1px solid rgba(124,58,237,0.16)",
  borderRadius: 12,
  padding: "14px 16px",
};

export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  background: "var(--clr-input-bg)",
  border: "1px solid var(--clr-input-border)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: "var(--clr-text1)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, background 0.15s",
};

export const INPUT_FOCUS = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(124,58,237,0.45)";
    e.target.style.background = "var(--clr-input-bg)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--clr-input-border)";
    e.target.style.background = "var(--clr-input-bg)";
  },
};

export const ROW_DIVIDER: CSSProperties = {
  borderTop: "1px solid var(--clr-border)",
  marginTop: 0,
  paddingTop: 0,
};

export const clr = {
  text1: "var(--clr-text1)",
  text2: "var(--clr-text2)",
  text3: "var(--clr-text3)",
  text4: "var(--clr-text4)",
  accent: "#00d4ff",
  accentLight: "#7df4ff",
  success: "#00ff9d",
  warning: "#f5a623",
  danger: "#ff3366",
  info: "#00d4ff",
  border: "var(--clr-border)",
  borderHover: "var(--clr-border-hover)",
  card: "var(--clr-card)",
  cardHover: "var(--clr-card-hover)",
};
